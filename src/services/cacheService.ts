/**
 * CacheService: Almacenamiento local persistente con expiración basada en TTL (Time-To-Live).
 * Garantiza que la interfaz siempre disponga de contenido, operando en modo offline
 * y aplicando la estrategia Stale-While-Revalidate cuando la red falla o está degradada.
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
  version: string;
}

export interface StaleCacheResult<T> {
  data: T;
  isStale: boolean;
  ageMs: number;
  timestamp: number;
}

export const CACHE_TTL = {
  REALTIME_MATCHES: 30 * 1000,          // 30 segundos para partidos en vivo
  TODAY_MATCHES: 60 * 1000,             // 1 minuto para partidos del día
  REGULAR_MATCHES: 5 * 60 * 1000,       // 5 minutos para partidos programados
  HISTORICAL_MATCHES: 30 * 60 * 1000,   // 30 minutos para temporada completa
  STANDINGS_ZONAL: 10 * 60 * 1000,      // 10 minutos para tablas zonales
  STANDINGS_ANNUAL: 15 * 60 * 1000,     // 15 minutos para tabla anual
  TEAMS_CATALOG: 60 * 60 * 1000,        // 1 hora para nómina de clubes
  COVERAGE_REPORT: 5 * 60 * 1000,       // 5 minutos para reporte de cobertura
  NEWS: 10 * 60 * 1000,                 // 10 minutos para noticias
};

const CACHE_PREFIX = 'cabala_cache_v2:';
const CURRENT_VERSION = '2026.1';

export class CacheService {
  private memoryFallback = new Map<string, CacheEntry<any>>();
  private isStorageAvailable: boolean;

  constructor() {
    this.isStorageAvailable = this.checkStorageAvailability();
  }

  private checkStorageAvailability(): boolean {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return false;
    }
    try {
      const testKey = '__cabala_storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private formatKey(key: string): string {
    return `${CACHE_PREFIX}${key}`;
  }

  /**
   * Guarda un valor en la caché persistente con un TTL específico en milisegundos.
   */
  public set<T>(key: string, data: T, ttlMs = CACHE_TTL.REGULAR_MATCHES): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttlMs,
      version: CURRENT_VERSION,
    };

    // Almacenar siempre en memoria para acceso ultrarrápido
    this.memoryFallback.set(key, entry);

    if (this.isStorageAvailable) {
      try {
        const serialized = JSON.stringify(entry);
        window.localStorage.setItem(this.formatKey(key), serialized);
      } catch (err) {
        // En caso de cuota excedida de localStorage, limpiar entradas expiradas
        this.pruneExpiredEntries();
        try {
          window.localStorage.setItem(this.formatKey(key), JSON.stringify(entry));
        } catch {
          // Si continúa fallando, opera en memoryFallback
        }
      }
    }
  }

  /**
   * Recupera un valor si existe y NO ha expirado según su TTL.
   * Si está expirado, retorna null.
   */
  public get<T>(key: string): T | null {
    const result = this.getStale<T>(key);
    if (!result) return null;
    return result.isStale ? null : result.data;
  }

  /**
   * Recupera un valor junto a metadatos de vigencia.
   * Si la red no está disponible, permite entregar el dato en caché (isStale=true)
   * asegurando funcionamiento offline ininterrumpido.
   */
  public getStale<T>(key: string): StaleCacheResult<T> | null {
    let entry: CacheEntry<T> | null = null;

    // 1. Intentar memoria
    if (this.memoryFallback.has(key)) {
      entry = this.memoryFallback.get(key) || null;
    }

    // 2. Si no está en memoria, consultar localStorage
    if (!entry && this.isStorageAvailable) {
      try {
        const raw = window.localStorage.getItem(this.formatKey(key));
        if (raw) {
          entry = JSON.parse(raw);
          if (entry && entry.version === CURRENT_VERSION) {
            this.memoryFallback.set(key, entry);
          } else {
            entry = null;
          }
        }
      } catch {
        entry = null;
      }
    }

    if (!entry) return null;

    const ageMs = Date.now() - entry.timestamp;
    const isStale = ageMs > entry.ttlMs;

    return {
      data: entry.data,
      isStale,
      ageMs,
      timestamp: entry.timestamp,
    };
  }

  /**
   * Patrón Stale-While-Revalidate:
   * 1. Si existe dato fresco en caché, lo retorna de inmediato.
   * 2. Si está expirado o no existe, ejecuta fetcher().
   * 3. Si fetcher() falla (por ejemplo offline), devuelve el dato en caché existente (aunque esté stale).
   * 4. Si fetcher() falla y no hay caché, lanza el error.
   */
  public async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs = CACHE_TTL.REGULAR_MATCHES
  ): Promise<{ data: T; isFromCache: boolean; isStale: boolean }> {
    const cached = this.getStale<T>(key);

    if (cached && !cached.isStale) {
      return { data: cached.data, isFromCache: true, isStale: false };
    }

    try {
      const freshData = await fetcher();
      this.set(key, freshData, ttlMs);
      return { data: freshData, isFromCache: false, isStale: false };
    } catch (networkError) {
      if (cached) {
        return { data: cached.data, isFromCache: true, isStale: true };
      }
      throw networkError;
    }
  }

  /**
   * Elimina una clave de la caché.
   */
  public remove(key: string): void {
    this.memoryFallback.delete(key);
    if (this.isStorageAvailable) {
      try {
        window.localStorage.removeItem(this.formatKey(key));
      } catch {
        // ignore
      }
    }
  }

  /**
   * Limpia todas las entradas de CÁBALA en la caché.
   */
  public clear(): void {
    this.memoryFallback.clear();
    if (this.isStorageAvailable) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(CACHE_PREFIX)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => window.localStorage.removeItem(k));
      } catch {
        // ignore
      }
    }
  }

  /**
   * Elimina de localStorage las entradas cuyo TTL haya expirado.
   */
  public pruneExpiredEntries(): void {
    if (!this.isStorageAvailable) return;
    try {
      const now = Date.now();
      const keysToRemove: string[] = [];

      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(CACHE_PREFIX)) {
          const raw = window.localStorage.getItem(k);
          if (raw) {
            try {
              const entry: CacheEntry<any> = JSON.parse(raw);
              if (now - entry.timestamp > entry.ttlMs * 2) {
                keysToRemove.push(k);
              }
            } catch {
              keysToRemove.push(k);
            }
          }
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    } catch {
      // ignore
    }
  }
}

export const cacheService = new CacheService();
