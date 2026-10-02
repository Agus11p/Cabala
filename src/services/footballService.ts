import {
  Match,
  MatchStatus,
  Club,
  Team,
  StandingRow,
  PromediosRow,
  StandingsResponse,
  ZoneStandingsResponse,
  AnnualTableResponse,
  TableType,
  UserProfile,
  NewsInsight,
  CopaArgentinaFixture,
  CopaArgentinaBracket,
  CopaArgentinaSummary,
} from '../types/football';
import { espnAdapter } from './espnAdapter';
import { cacheService, CACHE_TTL } from './cacheService';
import { COPA_ARGENTINA_SEED } from '../data/copaArgentinaSeed';

export interface MatchFilter {
  status?: MatchStatus | 'all' | 'today';
  teamId?: string;
  tournament?: string;
  date?: string;
  scope?: 'today' | 'tomorrow' | 'upcoming' | 'recent' | '7d' | '30d' | 'regular' | 'all' | 'season';
  range?: '7d' | '30d' | 'regular';
  phase?: 'apertura' | 'clausura' | 'playoffs';
  zone?: 'A' | 'B';
}

export interface CoverageReport {
  season: number;
  matches: {
    total: number;
    played: number;
    scheduled: number;
    live: number;
    stale: number;
    verified: number;
  };
  standings: {
    apertura: string;
    clausura: string;
    annual: string;
  };
  sources: Array<{ id: string; type: string; status: string; details?: string }>;
  lastSuccessfulIngestion: string;
  fixtureRange?: {
    earliestMatchDate: string;
    latestMatchDate: string;
    totalCalendarDays: number;
  };
}

export interface ProviderInfo {
  provider: string;
  status: string;
  coverage: string;
  season: string;
  features: Record<string, any>;
}

const STORAGE_KEY_USER = 'cabala_user_profile_v1';

const DEFAULT_USER: UserProfile = {
  id: 'user_cabala_fan',
  username: 'HinchaCábala',
  displayName: 'Hincha de Primera',
  favoriteClubId: '5', // Boca Juniors por defecto
  rankTitle: 'Iniciado',
  rankTier: 'bronze',
  elo: 1000,
  wins: 0,
  losses: 0,
  streak: 0,
  achievements: [
    {
      id: 'welcome',
      title: 'Bienvenido a la Tribuna',
      desc: 'Comenzaste tu recorrido en Cábala Fútbol Argentino.',
      icon: 'shield',
      unlockedAt: '2026',
    },
  ],
};

class FootballService {
  private userProfile: UserProfile;

  constructor() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      this.userProfile = saved ? JSON.parse(saved) : { ...DEFAULT_USER };
    } catch {
      this.userProfile = { ...DEFAULT_USER };
    }
  }

  // Provider Info
  public async getProviderStatus(): Promise<ProviderInfo> {
    const cacheKey = 'provider_info';
    try {
      const { data } = await cacheService.getOrFetch(
        cacheKey,
        async () => {
          const res = await fetch('/api/football/provider-info');
          if (!res.ok) throw new Error('Status unavailable');
          return await res.json();
        },
        CACHE_TTL.COVERAGE_REPORT
      );
      return data;
    } catch {
      return {
        provider: 'ESPN Soccer API (Proxy CÁBALA)',
        status: 'online',
        coverage: 'Liga Profesional de Fútbol Argentino 2026',
        season: '2026',
        features: {},
      };
    }
  }

  // Matches con persistencia de backend oficial + soporte en vivo y fallback offline con CacheService
  public async getMatches(filter?: MatchFilter): Promise<Match[]> {
    const isHistoricalSeasonScope = filter?.scope === 'all' || filter?.scope === 'season';
    const filterKey = JSON.stringify(filter || {});
    const cacheKey = `matches_${isHistoricalSeasonScope ? 'historical' : 'active'}_${filterKey}`;

    // 1. Si el usuario filtra específicamente por partidos 'live' (en vivo)
    if (filter?.status === 'live') {
      try {
        const liveMatches = await espnAdapter.fetchScoreboard({ date: filter?.date });
        const filtered = (liveMatches || []).filter((m) => m.status === 'live');
        if (filtered.length > 0) {
          cacheService.set(cacheKey, filtered, CACHE_TTL.REALTIME_MATCHES);
          return filtered;
        }
      } catch (adapterErr) {
        console.warn('[FootballService] espnAdapter no disponible para partidos live:', adapterErr);
      }
    }

    // 2. Consultar endpoint de persistencia del backend con Stale-While-Revalidate
    try {
      const params = new URLSearchParams();
      if (filter?.status) params.append('status', filter.status);
      if (filter?.teamId) params.append('teamId', filter.teamId);
      if (filter?.date) params.append('date', filter.date);
      if (filter?.scope) params.append('scope', filter.scope);
      if (filter?.range) params.append('range', filter.range);
      if (filter?.phase) params.append('phase', filter.phase);
      if (filter?.zone) params.append('zone', filter.zone);

      const query = params.toString() ? `?${params.toString()}` : '';
      const ttl = isHistoricalSeasonScope ? CACHE_TTL.HISTORICAL_MATCHES : CACHE_TTL.REGULAR_MATCHES;

      const { data } = await cacheService.getOrFetch(
        cacheKey,
        async () => {
          const res = await fetch(`/api/football/matches${query}`);
          if (!res.ok) {
            throw new Error('Error al consultar partidos desde la persistencia oficial (Firestore).');
          }
          return await res.json();
        },
        ttl
      );

      return (data || []) as Match[];
    } catch (err: any) {
      // 3. Fallback a Firestore directo (ideal para despliegues estáticos en Vercel)
      try {
        const { collection, getDocs } = await import('firebase/firestore');
        const { db } = await import('./firebaseClient');
        const snap = await getDocs(collection(db, 'matches'));
        if (!snap.empty) {
          const firestoreMatches: Match[] = [];
          snap.forEach((docSnap) => {
            const m = docSnap.data() as any;
            firestoreMatches.push({
              ...m,
              id: docSnap.id || m.id,
              isStale: true,
            });
          });
          if (firestoreMatches.length > 0) {
            cacheService.set(cacheKey, firestoreMatches, CACHE_TTL.REGULAR_MATCHES);
            return firestoreMatches;
          }
        }
      } catch (firestoreErr) {
        console.warn('[FootballService] Fallback a Firestore directo no disponible:', firestoreErr);
      }

      // 4. Fallback total offline: devolver cualquier resultado previo en caché
      const stale = cacheService.getStale<Match[]>(cacheKey);
      if (stale && stale.data) {
        console.warn(`[FootballService] Operando offline: entregando partidos desde caché local (edad: ${Math.round(stale.ageMs / 1000)}s)`);
        return stale.data;
      }
      return [];
    }
  }

  /**
   * Obtiene el fixture y resultados oficiales de Copa Argentina 2026.
   * Con soporte offline, fallback automático ante Vercel y normalización en huso de Argentina.
   */
  public async getCopaArgentinaMatches(filter?: {
    round?: string;
    status?: string;
    teamId?: string;
    scope?: string;
  }): Promise<Match[]> {
    const params = new URLSearchParams();
    if (filter?.round) params.append('round', filter.round);
    if (filter?.status) params.append('status', filter.status);
    if (filter?.teamId) params.append('teamId', filter.teamId);
    if (filter?.scope) params.append('scope', filter.scope);

    const query = params.toString() ? `?${params.toString()}` : '';
    const cacheKey = `copa_argentina_matches_${query}`;

    try {
      const { data } = await cacheService.getOrFetch(
        cacheKey,
        async () => {
          const res = await fetch(`/api/football/copa-argentina/matches${query}`);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status} al consultar Copa Argentina`);
          }
          return await res.json();
        },
        CACHE_TTL.REGULAR_MATCHES
      );
      return (data || []) as Match[];
    } catch {
      // Fallback 1: Memoria local seed garantizada (inmune a caídas de ESPN o Vercel)
      let fallback = [...COPA_ARGENTINA_SEED];
      if (filter?.round) {
        fallback = fallback.filter((m) => (m.round || '').toLowerCase().includes(filter.round!.toLowerCase()));
      }
      if (filter?.status && filter.status !== 'all') {
        fallback = fallback.filter((m) => m.status === filter.status);
      }
      if (filter?.teamId) {
        fallback = fallback.filter((m) => m.homeTeamId === filter.teamId || m.awayTeamId === filter.teamId);
      }
      if (filter?.scope === 'finished') {
        fallback = fallback.filter((m) => m.status === 'finished');
      } else if (filter?.scope === 'upcoming') {
        fallback = fallback.filter((m) => m.status === 'scheduled');
      }
      return fallback;
    }
  }

  /**
   * Obtiene el Fixture estructurado de Copa Argentina 2026 clasificado por rondas.
   */
  public async getCopaArgentinaFixture(): Promise<CopaArgentinaFixture> {
    const cacheKey = 'copa_argentina_fixture';
    try {
      const { data } = await cacheService.getOrFetch(
        cacheKey,
        async () => {
          const res = await fetch('/api/football/copa-argentina/fixture');
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return await res.json();
        },
        CACHE_TTL.REGULAR_MATCHES
      );
      return data as CopaArgentinaFixture;
    } catch {
      const matches = COPA_ARGENTINA_SEED;
      return {
        tournament: 'Copa Argentina 2026',
        season: 2026,
        currentStage: 'Semifinales',
        totalMatches: matches.length,
        completedMatches: matches.filter((m) => m.status === 'finished').length,
        scheduledMatches: matches.filter((m) => m.status === 'scheduled').length,
        rounds: {
          '32vos': matches.filter((m) => (m.round || '').toLowerCase().includes('32vos')),
          '16vos': matches.filter((m) => (m.round || '').toLowerCase().includes('16vos')),
          octavos: matches.filter((m) => (m.round || '').toLowerCase().includes('octavos')),
          cuartos: matches.filter((m) => (m.round || '').toLowerCase().includes('cuartos')),
          semifinales: matches.filter((m) => (m.round || '').toLowerCase().includes('semi')),
          final: matches.filter((m) => {
            const r = (m.round || '').toLowerCase();
            return r.includes('final') && !r.includes('vos') && !r.includes('cuartos') && !r.includes('semi');
          }),
        },
      };
    }
  }

  /**
   * Obtiene exclusivamente los resultados concluidos con marcadores oficiales y penales.
   */
  public async getCopaArgentinaResults(): Promise<Match[]> {
    const cacheKey = 'copa_argentina_results';
    try {
      const { data } = await cacheService.getOrFetch(
        cacheKey,
        async () => {
          const res = await fetch('/api/football/copa-argentina/results');
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return await res.json();
        },
        CACHE_TTL.REGULAR_MATCHES
      );
      return data as Match[];
    } catch {
      return COPA_ARGENTINA_SEED.filter((m) => m.status === 'finished').sort(
        (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
      );
    }
  }

  /**
   * Obtiene la estructura visual del cuadro (Bracket) de eliminación directa.
   */
  public async getCopaArgentinaBracket(): Promise<CopaArgentinaBracket> {
    const cacheKey = 'copa_argentina_bracket';
    try {
      const { data } = await cacheService.getOrFetch(
        cacheKey,
        async () => {
          const res = await fetch('/api/football/copa-argentina/bracket');
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return await res.json();
        },
        CACHE_TTL.REGULAR_MATCHES
      );
      return data as CopaArgentinaBracket;
    } catch {
      const matches = COPA_ARGENTINA_SEED;
      return {
        tournament: 'Copa Argentina 2026',
        champion: 'Por definir',
        rounds: [
          { id: '32vos', name: '32vos de Final', matches: matches.filter((m) => (m.round || '').toLowerCase().includes('32vos')) },
          { id: '16vos', name: '16vos de Final', matches: matches.filter((m) => (m.round || '').toLowerCase().includes('16vos')) },
          { id: 'octavos', name: 'Octavos de Final', matches: matches.filter((m) => (m.round || '').toLowerCase().includes('octavos')) },
          { id: 'cuartos', name: 'Cuartos de Final', matches: matches.filter((m) => (m.round || '').toLowerCase().includes('cuartos')) },
          { id: 'semifinales', name: 'Semifinales', matches: matches.filter((m) => (m.round || '').toLowerCase().includes('semi')) },
          {
            id: 'final',
            name: 'Gran Final',
            matches: matches.filter((m) => {
              const r = (m.round || '').toLowerCase();
              return r.includes('final') && !r.includes('vos') && !r.includes('cuartos') && !r.includes('semi');
            }),
          },
        ],
      };
    }
  }

  /**
   * Obtiene métricas oficiales y resumen ejecutivo de Copa Argentina.
   */
  public async getCopaArgentinaSummary(): Promise<CopaArgentinaSummary> {
    const cacheKey = 'copa_argentina_summary';
    try {
      const { data } = await cacheService.getOrFetch(
        cacheKey,
        async () => {
          const res = await fetch('/api/football/copa-argentina/summary');
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return await res.json();
        },
        CACHE_TTL.REGULAR_MATCHES
      );
      return data as CopaArgentinaSummary;
    } catch {
      const matches = COPA_ARGENTINA_SEED;
      const completed = matches.filter((m) => m.status === 'finished');
      const scheduled = matches.filter((m) => m.status === 'scheduled');
      let totalGoals = 0;
      completed.forEach((m) => {
        totalGoals += (m.homeScore || 0) + (m.awayScore || 0);
      });
      return {
        tournament: 'Copa Argentina 2026',
        totalMatches: matches.length,
        completedMatches: completed.length,
        scheduledMatches: scheduled.length,
        completionPercentage: parseFloat(((completed.length / matches.length) * 100).toFixed(1)),
        totalGoals,
        avgGoals: completed.length > 0 ? parseFloat((totalGoals / completed.length).toFixed(2)) : 0,
        currentStage: 'Semifinales',
        semifinalists: [
          { id: '9785', name: 'Atlético Tucumán' },
          { id: '7764', name: 'Platense' },
          { id: '235', name: 'Banfield' },
          { id: '5', name: 'Boca Juniors' },
        ],
        champion: 'Por definir',
      };
    }
  }

  public async getCoverage(): Promise<CoverageReport> {
    const cacheKey = 'coverage_report';
    try {
      const { data } = await cacheService.getOrFetch(
        cacheKey,
        async () => {
          const res = await fetch('/api/football/coverage');
          if (!res.ok) throw new Error('Error al obtener reporte de cobertura de datos.');
          return await res.json();
        },
        CACHE_TTL.COVERAGE_REPORT
      );
      return data;
    } catch (err: any) {
      const stale = cacheService.getStale<CoverageReport>(cacheKey);
      if (stale && stale.data) return stale.data;
      throw err;
    }
  }

  public async getMatchById(id: string): Promise<Match | null> {
    const cacheKey = `match_detail_${id}`;

    // 1. Intentar espnAdapter en tiempo real
    try {
      const adapterMatch = await espnAdapter.fetchMatchById(id);
      if (adapterMatch) {
        cacheService.set(cacheKey, adapterMatch, CACHE_TTL.REGULAR_MATCHES);
        return adapterMatch;
      }
    } catch (err) {
      console.warn(`[FootballService] espnAdapter no pudo resolver el partido ${id}:`, err);
    }

    // 2. Consultar endpoint con cacheService
    try {
      const { data } = await cacheService.getOrFetch(
        cacheKey,
        async () => {
          const res = await fetch(`/api/football/matches/${id}`);
          if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error('Error al obtener la ficha técnica del encuentro.');
          }
          return await res.json();
        },
        CACHE_TTL.REGULAR_MATCHES
      );
      return data;
    } catch (err) {
      const stale = cacheService.getStale<Match>(cacheKey);
      if (stale && stale.data) return stale.data;
      return null;
    }
  }

  public async getFeaturedMatch(): Promise<Match | null> {
    const matches = await this.getMatches();
    if (!matches || matches.length === 0) return null;

    // Priorizar partidos en vivo, luego primer terminado/programado
    const live = matches.find((m) => m.status === 'live');
    if (live) return live;
    return matches[0] || null;
  }

  // Teams con caché persistente
  public async getTeams(): Promise<Team[]> {
    const cacheKey = 'teams_all';
    try {
      const { data } = await cacheService.getOrFetch(
        cacheKey,
        async () => {
          const res = await fetch('/api/football/teams');
          if (!res.ok) {
            throw new Error('Error al consultar la nómina de clubes de Primera División.');
          }
          const rawTeams: Team[] = await res.json();
          return rawTeams.sort((a, b) => a.name.localeCompare(b.name, 'es'));
        },
        CACHE_TTL.TEAMS_CATALOG
      );
      return data;
    } catch (err: any) {
      const stale = cacheService.getStale<Team[]>(cacheKey);
      if (stale && stale.data) return stale.data;
      throw err;
    }
  }

  public async getTeamById(id: string): Promise<Team | null> {
    const teams = await this.getTeams();
    return teams.find((t) => t.id === id || t.code === id) || null;
  }

  // Standings con caché persistente
  public async getStandings(type: TableType, zone?: 'A' | 'B'): Promise<StandingsResponse> {
    const zoneQuery = zone ? `&zone=${zone}` : '';
    const cacheKey = `standings_${type}_${zone || 'all'}`;

    try {
      const { data } = await cacheService.getOrFetch(
        cacheKey,
        async () => {
          const res = await fetch(`/api/football/standings?type=${type}${zoneQuery}`);
          if (!res.ok) {
            return {
              type,
              available: false,
              message: 'No fue posible conectar con el servicio de clasificación.',
              data: [],
            };
          }
          return await res.json();
        },
        CACHE_TTL.STANDINGS_ZONAL
      );
      return data;
    } catch (err: any) {
      const stale = cacheService.getStale<StandingsResponse>(cacheKey);
      if (stale && stale.data) return stale.data;
      return {
        type,
        available: false,
        message: 'Modo offline: sin conexión y sin datos en caché.',
        data: [],
      };
    }
  }

  public async getZoneStandings(
    season = '2026',
    phase: 'apertura' | 'clausura' = 'clausura',
    zone: 'A' | 'B' = 'A'
  ): Promise<ZoneStandingsResponse> {
    const cacheKey = `zone_standings_${season}_${phase}_${zone}`;

    try {
      const { data } = await cacheService.getOrFetch(
        cacheKey,
        async () => {
          const res = await fetch(`/api/football/standings/zone?season=${season}&phase=${phase}&zone=${zone}`);
          if (!res.ok) {
            return {
              seasonYear: season,
              phase,
              zone,
              available: false,
              message: 'No se pudo obtener la tabla de la zona.',
              data: [],
            };
          }
          return await res.json();
        },
        CACHE_TTL.STANDINGS_ZONAL
      );
      return data;
    } catch (err: any) {
      const stale = cacheService.getStale<ZoneStandingsResponse>(cacheKey);
      if (stale && stale.data) return stale.data;
      return {
        seasonYear: season,
        phase,
        zone,
        available: false,
        message: 'Modo offline: sin datos disponibles para la zona.',
        data: [],
      };
    }
  }

  public async getAnnualTable(season = '2026'): Promise<AnnualTableResponse> {
    const cacheKey = `annual_table_${season}`;

    try {
      const { data } = await cacheService.getOrFetch(
        cacheKey,
        async () => {
          const res = await fetch(`/api/football/standings/annual?season=${season}`);
          if (!res.ok) {
            return {
              seasonYear: season,
              available: false,
              message: 'No se pudo obtener la tabla anual.',
              data: [],
            };
          }
          return await res.json();
        },
        CACHE_TTL.STANDINGS_ANNUAL
      );
      return data;
    } catch (err: any) {
      const stale = cacheService.getStale<AnnualTableResponse>(cacheKey);
      if (stale && stale.data) return stale.data;
      return {
        seasonYear: season,
        available: false,
        message: 'Modo offline: sin datos disponibles para la tabla anual.',
        data: [],
      };
    }
  }

  // News
  public async getNews(): Promise<NewsInsight[]> {
    const cacheKey = 'news_insights';
    try {
      const { data } = await cacheService.getOrFetch(
        cacheKey,
        async () => {
          const res = await fetch('/api/football/news');
          if (!res.ok) return [];
          return await res.json();
        },
        CACHE_TTL.NEWS
      );
      return data;
    } catch {
      const stale = cacheService.getStale<NewsInsight[]>(cacheKey);
      return stale?.data || [];
    }
  }

  // User Profile
  public async getUserProfile(): Promise<UserProfile> {
    return { ...this.userProfile };
  }

  public async setFavoriteClub(clubId: string): Promise<UserProfile> {
    this.userProfile = {
      ...this.userProfile,
      favoriteClubId: clubId,
    };
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.userProfile));
    } catch {
      // ignore storage failure
    }
    return { ...this.userProfile };
  }

  // Google Search Discovery & Institutional Verification
  public async getClubInstitutional(clubId: string, name?: string): Promise<any> {
    try {
      const q = name ? `?name=${encodeURIComponent(name)}` : '';
      const res = await fetch(`/api/search/club/${clubId}${q}`);
      if (!res.ok) throw new Error('Error al verificar institucional');
      return await res.json();
    } catch {
      return null;
    }
  }

  public async getVerifiedRegulations(topic = 'desempates'): Promise<any> {
    try {
      const res = await fetch(`/api/search/regulations/verify?topic=${encodeURIComponent(topic)}`);
      if (!res.ok) throw new Error('Error verificando reglamentación');
      return await res.json();
    } catch {
      return null;
    }
  }

  public async getVerifiedNews(club?: string): Promise<any> {
    try {
      const q = club ? `?club=${encodeURIComponent(club)}` : '';
      const res = await fetch(`/api/search/news/verified${q}`);
      if (!res.ok) throw new Error('Error en noticias verificadas');
      return await res.json();
    } catch {
      return { count: 0, news: [] };
    }
  }

  public async getCoverageMatrix(): Promise<any> {
    try {
      const res = await fetch('/api/search/coverage-matrix');
      if (!res.ok) throw new Error('Error al obtener matriz de cobertura');
      return await res.json();
    } catch {
      return null;
    }
  }

  public async runDiscoveryQuery(query: string): Promise<any> {
    const res = await fetch('/api/search/discover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error('Falla en la consulta de descubrimiento');
    return await res.json();
  }
}

export const footballService = new FootballService();
