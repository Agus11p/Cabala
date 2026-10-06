import {
  Match,
  MatchStatus,
  Club,
  Team,
  StandingRow,
  ZoneStanding,
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
  SeasonPhaseInfo,
} from '../types/football';
import { espnAdapter } from './espnAdapter';
import { cacheService, CACHE_TTL } from './cacheService';
import { COPA_ARGENTINA_SEED } from '../data/copaArgentinaSeed';
import { TEAMS_SEED } from '../data/teamsSeed';
import { SEASON_MATCHES_SEED } from '../data/seasonMatchesSeed';
import { STANDINGS_SEED } from '../data/standingsSeed';

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
      if (stale && stale.data && stale.data.length > 0) {
        return stale.data;
      }

      // 5. Fallback inquebrantable: Semilla de partidos oficiales de la temporada 2026
      let fallbackMatches = [...SEASON_MATCHES_SEED];
      if (filter?.status && filter.status !== 'all') {
        fallbackMatches = fallbackMatches.filter((m) => m.status === filter.status);
      }
      if (filter?.teamId) {
        fallbackMatches = fallbackMatches.filter((m) => m.homeTeamId === filter.teamId || m.awayTeamId === filter.teamId);
      }
      if (filter?.phase) {
        fallbackMatches = fallbackMatches.filter((m) => m.phase === filter.phase);
      }
      if (filter?.zone) {
        fallbackMatches = fallbackMatches.filter((m) => m.zone === filter.zone);
      }
      return fallbackMatches;
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
        const ttl = adapterMatch.status === 'live' ? CACHE_TTL.REALTIME_MATCHES : CACHE_TTL.REGULAR_MATCHES;
        cacheService.set(cacheKey, adapterMatch, ttl);
        return adapterMatch;
      }
    } catch (err) {
      console.warn(`[FootballService] espnAdapter no pudo resolver el partido ${id}:`, err);
    }

    // 2. Consultar endpoint con cacheService
    try {
      // Determinamos el TTL adecuado: 30s si ya sabemos que es en vivo, 5m por defecto
      const cached = cacheService.get<Match>(cacheKey);
      const isLive = cached?.status === 'live';
      const initialTtl = isLive ? CACHE_TTL.REALTIME_MATCHES : CACHE_TTL.REGULAR_MATCHES;

      const { data } = await cacheService.getOrFetch(
        cacheKey,
        async () => {
          const res = await fetch(`/api/football/matches/${id}`);
          if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error('Error al obtener la ficha técnica del encuentro.');
          }
          const detail = await res.json();
          if (detail) {
            const seedMatch = SEASON_MATCHES_SEED.find((m) => m.id === String(id)) || COPA_ARGENTINA_SEED.find((m) => m.id === String(id));
            if (seedMatch) {
              if (seedMatch.time) {
                detail.time = seedMatch.time;
                detail.kickoffTime = seedMatch.time;
              }
              if (seedMatch.date) detail.date = seedMatch.date;
              if (seedMatch.timestamp) detail.timestamp = seedMatch.timestamp;
              if (seedMatch.tournament) detail.tournament = seedMatch.tournament;
              if (seedMatch.round) detail.round = seedMatch.round;
            }
          }
          return detail;
        },
        initialTtl
      );

      // Si el partido devuelto está en vivo, fijamos su TTL a REALTIME_MATCHES (30s)
      if (data && data.status === 'live') {
        cacheService.set(cacheKey, data, CACHE_TTL.REALTIME_MATCHES);
      }
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

  // Teams con caché persistente y fallback garantizado a nómina oficial AFA 2026
  public async getTeams(): Promise<Team[]> {
    const cacheKey = 'teams_all';
    try {
      const { data } = await cacheService.getOrFetch(
        cacheKey,
        async () => {
          const res = await fetch('/api/football/teams');
          if (!res.ok) {
            throw new Error('API teams unreachable');
          }
          const rawTeams: Team[] = await res.json();
          if (Array.isArray(rawTeams) && rawTeams.length > 0) {
            const enriched: Team[] = rawTeams.map((rt): Team => {
              const seed =
                TEAMS_SEED.find((s) => s.id === rt.id) ||
                (rt.id === '9744' || rt.name?.toLowerCase().includes('rivadavia') ? TEAMS_SEED.find((s) => s.id === '9744') : null) ||
                (rt.id === '16' || rt.name?.toLowerCase().includes('river') ? TEAMS_SEED.find((s) => s.id === '16') : null) ||
                TEAMS_SEED.find(
                  (s) =>
                    s.name.toLowerCase() === rt.name?.toLowerCase() ||
                    (rt.shortName && s.shortName.toLowerCase() === rt.shortName.toLowerCase()) ||
                    (rt.code && s.code.toLowerCase() === rt.code.toLowerCase() && s.id !== '9744' && s.id !== '16')
                );
              return {
                ...(seed || {}),
                ...rt,
                titlesCount: seed?.titlesCount || rt.titlesCount || { league: 0, nationalCup: 0, international: 0, total: 0 },
                honors: seed?.honors || rt.honors,
                founded: seed?.founded || rt.founded,
                foundedFullDate: seed?.foundedFullDate || rt.foundedFullDate,
                stadium: seed?.stadium || rt.stadium,
                stadiumNickname: seed?.stadiumNickname || rt.stadiumNickname,
                stadiumCapacity: seed?.stadiumCapacity || rt.stadiumCapacity,
                nickname: seed?.nickname || rt.nickname,
                nicknames: seed?.nicknames || rt.nicknames || (seed?.nickname ? [seed.nickname] : []),
                historySummary: seed?.historySummary || rt.historySummary,
                president: seed?.president || rt.president,
                manager: seed?.manager || rt.manager,
                officialWebsite: seed?.officialWebsite || rt.officialWebsite,
              };
            });

            // Garantizar catálogo inquebrantable de los 30 clubes de Primera División
            const existingIds = new Set(enriched.map((t) => t.id));
            for (const s of TEAMS_SEED) {
              if (!existingIds.has(s.id)) {
                enriched.push(s as Team);
              }
            }
            return enriched.sort((a, b) => a.name.localeCompare(b.name, 'es'));
          }
          throw new Error('Empty teams returned');
        },
        CACHE_TTL.TEAMS_CATALOG
      );
      return data;
    } catch {
      // 1. Fallback a Firestore directo (ideal para despliegues estáticos en Vercel)
      try {
        const { collection, getDocs } = await import('firebase/firestore');
        const { db } = await import('./firebaseClient');
        const snap = await getDocs(collection(db, 'teams'));
        if (!snap.empty) {
          const firestoreTeams: Team[] = [];
          snap.forEach((d) => firestoreTeams.push(d.data() as Team));
          if (firestoreTeams.length > 0) {
            const sorted = firestoreTeams.sort((a, b) => a.name.localeCompare(b.name, 'es'));
            cacheService.set(cacheKey, sorted, CACHE_TTL.TEAMS_CATALOG);
            return sorted;
          }
        }
      } catch {
        // Ignore firestore fallback error
      }

      // 2. Fallback a caché local previo
      const stale = cacheService.getStale<Team[]>(cacheKey);
      if (stale && stale.data && stale.data.length > 0) return stale.data;

      // 3. Fallback garantizado e inquebrantable: 30 clubes oficiales AFA 2026
      const seedSorted = [...TEAMS_SEED].sort((a, b) => a.name.localeCompare(b.name, 'es'));
      cacheService.set(cacheKey, seedSorted, CACHE_TTL.TEAMS_CATALOG);
      return seedSorted;
    }
  }

  public async getTeamById(id: string): Promise<Team | null> {
    const teams = await this.getTeams();
    return teams.find((t) => t.id === id || t.code === id) || null;
  }

  /**
   * Determina automáticamente el torneo activo del calendario (Apertura o Clausura)
   * basado en la fecha actual (o la fecha provista).
   * 
   * Calendario Oficial AFA 2026:
   * - Torneo Apertura: 1° semestre (Enero a Junio, Final celebrada el 24 de Mayo de 2026).
   * - Torneo Clausura: 2° semestre (1 de Julio en adelante hasta Diciembre).
   */
  public getActiveSeasonPhase(date: Date = new Date()): 'apertura' | 'clausura' {
    const month = date.getMonth(); // 0 = Enero, 4 = Mayo, 5 = Junio, 6 = Julio, 11 = Diciembre
    const day = date.getDate();
    // A partir del 1 de Julio (o a partir de Junio tras la final de Apertura), el certamen activo es el Clausura
    if (month >= 6 || (month === 5 && day >= 1)) {
      return 'clausura';
    }
    return 'apertura';
  }

  /**
   * Determina si una temporada / fase específica se encuentra cerrada oficialmente según la fecha.
   * La final del Torneo Apertura 2026 se disputó el 24 de Mayo de 2026 (River Plate 2 - 3 Belgrano).
   * Toda fecha a partir del 24 de Mayo de 2026 marca el Torneo Apertura como CERRADO / CONCLUIDO.
   */
  public isSeasonClosed(phase: 'apertura' | 'clausura', date: Date = new Date()): boolean {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    if (phase === 'apertura') {
      if (year > 2026) return true;
      if (year === 2026) {
        if (month > 4) return true; // Junio en adelante
        if (month === 4 && day >= 24) return true; // Desde el 24 de Mayo
      }
      return false;
    }

    // Clausura: cierra hacia fin de año (diciembre)
    if (year > 2026) return true;
    if (year === 2026 && month === 11 && day >= 20) return true;
    return false;
  }

  /**
   * Devuelve el campeón oficial consagrado de una temporada/fase.
   * Si el Torneo Apertura está cerrado, el campeón oficial consagrado es 'Belgrano de Córdoba'.
   */
  public getSeasonChampion(phase: 'apertura' | 'clausura', date: Date = new Date()): string | null {
    if (phase === 'apertura') {
      return this.isSeasonClosed('apertura', date) ? 'Belgrano de Córdoba' : null;
    }
    if (phase === 'clausura') {
      return this.isSeasonClosed('clausura', date) ? null : null; // Por definir
    }
    return null;
  }

  /**
   * Retorna información ejecutiva detallada del certamen según la fecha.
   */
  public getSeasonPhaseInfo(phase?: 'apertura' | 'clausura', date: Date = new Date()): SeasonPhaseInfo {
    const targetPhase = phase || this.getActiveSeasonPhase(date);
    const isClosed = this.isSeasonClosed(targetPhase, date);
    const champion = this.getSeasonChampion(targetPhase, date) || undefined;

    if (targetPhase === 'apertura') {
      return {
        phase: 'apertura',
        tournamentName: 'Torneo Apertura 2026',
        seasonYear: '2026',
        isClosed,
        status: isClosed ? 'closed' : 'active',
        champion,
        championTeamId: isClosed ? '4' : undefined,
        runnerUp: isClosed ? 'River Plate' : undefined,
        finalMatch: isClosed
          ? {
              date: '2026-05-24',
              score: 'River Plate 2 - 3 Belgrano',
              stadium: 'Estadio Mario Alberto Kempes (Córdoba)',
              homeTeam: 'River Plate',
              awayTeam: 'Belgrano (Córdoba)',
            }
          : undefined,
        description: isClosed
          ? 'Torneo Apertura 2026 concluido oficialmente. ¡Belgrano de Córdoba Campeón tras vencer 3-2 a River Plate en la Gran Final!'
          : 'Torneo Apertura 2026: Fase regular y eliminación directa.',
      };
    }

    return {
      phase: 'clausura',
      tournamentName: 'Torneo Clausura 2026',
      seasonYear: '2026',
      isClosed,
      status: isClosed ? 'closed' : 'active',
      champion: undefined,
      description: 'Torneo Clausura 2026 actualmente en disputa: 30 clubes en Zonas A y B con clasificación a Octavos de Final.',
    };
  }

  /**
   * Genera el cómputo de la tabla de posiciones del Torneo Apertura a partir de los 240 partidos
   * oficiales disputados en la semilla, garantizando que Belgrano de Córdoba figure como Campeón si está cerrado.
   */
  public computeAperturaFallbackStandings(zone?: 'A' | 'B', date: Date = new Date()): StandingsResponse {
    const apMatches = SEASON_MATCHES_SEED.filter(
      (m) => m.phase === 'apertura' && m.round === 'torneo-apertura' && m.status === 'finished'
    );

    const zoneAIds = new Set(['5', '8', '11', '12', '14', '18', '19', '20', '21', '2975', '7764', '8950', '11972', '11989', '17702']);
    const zoneBIds = new Set(['3', '4', '9', '10', '15', '16', '17', '235', '7767', '9739', '9744', '9785', '10060', '10158', '19685']);

    const teamsMap = new Map(TEAMS_SEED.map((t) => [t.id, t]));

    const buildZone = (ids: Set<string>, zoneLetter: 'A' | 'B'): ZoneStanding[] => {
      const statsMap = new Map<string, any>();
      ids.forEach((id) => {
        const t = teamsMap.get(id);
        statsMap.set(id, {
          position: 0,
          teamId: id,
          team: t || { id, name: `Club ${id}`, code: id.slice(0, 3).toUpperCase(), logo: `https://a.espncdn.com/i/teamlogos/soccer/500/${id}.png` },
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDiff: 0,
          points: 0,
          zone: zoneLetter,
          zonePosition: 0,
          phase: 'apertura',
          seasonYear: '2026',
          form: [] as ('W' | 'D' | 'L')[],
        });
      });

      apMatches.forEach((m) => {
        const hScore = Number(m.homeScore ?? 0);
        const aScore = Number(m.awayScore ?? 0);
        if (ids.has(m.homeTeamId)) {
          const h = statsMap.get(m.homeTeamId);
          if (h) {
            h.played++;
            h.goalsFor += hScore;
            h.goalsAgainst += aScore;
            if (hScore > aScore) {
              h.won++;
              h.points += 3;
            } else if (hScore === aScore) {
              h.drawn++;
              h.points += 1;
            } else {
              h.lost++;
            }
          }
        }
        if (ids.has(m.awayTeamId)) {
          const a = statsMap.get(m.awayTeamId);
          if (a) {
            a.played++;
            a.goalsFor += aScore;
            a.goalsAgainst += hScore;
            if (aScore > hScore) {
              a.won++;
              a.points += 3;
            } else if (aScore === hScore) {
              a.drawn++;
              a.points += 1;
            } else {
              a.lost++;
            }
          }
        }
      });

      const list = Array.from(statsMap.values());

      list.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
        return b.goalsFor - a.goalsFor;
      });

      return list.map((r, idx): ZoneStanding => {
        const isBelgrano = r.teamId === '4';
        return {
          ...r,
          zone: zoneLetter,
          position: idx + 1,
          zonePosition: idx + 1,
          qualificationZone: isBelgrano
            ? ('campeon_liga' as const)
            : idx < 8
            ? ('playoffs' as const)
            : undefined,
          qualificationReason: isBelgrano
            ? '🏆 Campeón Oficial Torneo Apertura 2026 (Clasificado a Trofeo de Campeones & Copa Libertadores)'
            : idx < 8
            ? `Clasificado a Octavos de Final (${idx + 1}° Zona ${zoneLetter})`
            : undefined,
        };
      });
    };

    const zoneA = buildZone(zoneAIds, 'A');
    const zoneB = buildZone(zoneBIds, 'B');
    const isClosed = this.isSeasonClosed('apertura', date);
    const champion = this.getSeasonChampion('apertura', date);

    return {
      type: 'apertura',
      phase: 'apertura',
      season: '2026',
      available: true,
      dataState: 'SUCCESS',
      activeTournament: this.getActiveSeasonPhase(date),
      isClosed,
      champion: isClosed ? champion || 'Belgrano de Córdoba' : undefined,
      runnerUp: isClosed ? 'River Plate' : undefined,
      tournamentStatus: isClosed ? 'closed' : 'active',
      zoneA,
      zoneB,
      data: zone === 'B' ? zoneB : zoneA,
    };
  }

  // Standings con caché persistente y cambio automático de temporada basado en fechas
  public async getStandings(type?: TableType, zone?: 'A' | 'B', date: Date = new Date()): Promise<StandingsResponse> {
    const activePhase = this.getActiveSeasonPhase(date);
    // Si no se especifica tipo o se pasa 'all', se selecciona automáticamente el certamen activo
    const resolvedType: TableType = (!type || type === 'all') ? activePhase : type;
    const isAperturaClosed = this.isSeasonClosed('apertura', date);
    const aperturaChampion = this.getSeasonChampion('apertura', date);

    const zoneQuery = zone ? `&zone=${zone}` : '';
    const cacheKey = `standings_${resolvedType}_${zone || 'all'}`;

    try {
      const { data } = await cacheService.getOrFetch(
        cacheKey,
        async () => {
          const res = await fetch(`/api/football/standings?type=${resolvedType}${zoneQuery}`);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          return await res.json();
        },
        CACHE_TTL.STANDINGS_ZONAL
      );

      const enriched: StandingsResponse = {
        ...data,
        activeTournament: activePhase,
      };

      if (resolvedType === 'apertura') {
        enriched.phase = 'apertura';
        enriched.isClosed = isAperturaClosed;
        enriched.tournamentStatus = isAperturaClosed ? 'closed' : 'active';
        if (isAperturaClosed && aperturaChampion) {
          enriched.champion = aperturaChampion;
          enriched.runnerUp = 'River Plate';
        }
      } else if (resolvedType === 'clausura') {
        enriched.phase = 'clausura';
        enriched.isClosed = false;
        enriched.tournamentStatus = 'active';
      }

      return enriched;
    } catch {
      const stale = cacheService.getStale<StandingsResponse>(cacheKey);
      if (stale && stale.data) {
        return {
          ...stale.data,
          activeTournament: activePhase,
          isClosed: resolvedType === 'apertura' ? isAperturaClosed : false,
          champion: resolvedType === 'apertura' && isAperturaClosed ? (aperturaChampion || undefined) : undefined,
          tournamentStatus: resolvedType === 'apertura' ? (isAperturaClosed ? 'closed' : 'active') : 'active',
        };
      }

      // Fallback robusto sin internet / caídas de API
      if (resolvedType === 'apertura') {
        return this.computeAperturaFallbackStandings(zone, date);
      }

      // Torneo Clausura (activo por defecto en el segundo semestre)
      return {
        ...STANDINGS_SEED,
        type: resolvedType,
        phase: 'clausura',
        activeTournament: activePhase,
        isClosed: false,
        tournamentStatus: 'active',
      };
    }
  }

  public async getZoneStandings(
    season = '2026',
    phase?: 'apertura' | 'clausura',
    zone: 'A' | 'B' = 'A',
    date: Date = new Date()
  ): Promise<ZoneStandingsResponse> {
    const resolvedPhase = phase || this.getActiveSeasonPhase(date);
    const cacheKey = `zone_standings_${season}_${resolvedPhase}_${zone}`;

    try {
      const { data } = await cacheService.getOrFetch(
        cacheKey,
        async () => {
          const res = await fetch(`/api/football/standings/zone?season=${season}&phase=${resolvedPhase}&zone=${zone}`);
          if (!res.ok) {
            return {
              seasonYear: season,
              phase: resolvedPhase,
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

      if (resolvedPhase === 'apertura') {
        const apTable = this.computeAperturaFallbackStandings(zone, date);
        const zoneData = zone === 'B' ? apTable.zoneB || [] : apTable.zoneA || [];
        return {
          seasonYear: season,
          phase: 'apertura',
          zone,
          available: zoneData.length > 0,
          data: zoneData,
        };
      }

      return {
        seasonYear: season,
        phase: resolvedPhase,
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
