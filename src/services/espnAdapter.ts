import { Match, MatchStatus, Club } from '../types/football';
import { cacheService, CACHE_TTL } from './cacheService';

/**
 * Raw ESPN API Scoreboard Interfaces
 * Represents the JSON payload returned by https://site.api.espn.com/apis/site/v2/sports/soccer/arg.1/scoreboard
 */
export interface EspnTeamLogo {
  href: string;
  width?: number;
  height?: number;
  alt?: string;
  rel?: string[];
}

export interface EspnRawTeam {
  id: string;
  uid?: string;
  location?: string;
  name?: string;
  abbreviation?: string;
  displayName?: string;
  shortDisplayName?: string;
  color?: string;
  alternateColor?: string;
  isActive?: boolean;
  logo?: string;
  logos?: EspnTeamLogo[];
}

export interface EspnCompetitor {
  id: string;
  uid?: string;
  type?: string;
  order?: number;
  homeAway: 'home' | 'away';
  winner?: boolean;
  score?: string | number;
  team: EspnRawTeam;
  records?: Array<{
    name?: string;
    type?: string;
    summary?: string;
  }>;
}

export interface EspnStatusType {
  id?: string;
  name?: string;
  state: 'pre' | 'in' | 'post';
  completed?: boolean;
  description?: string;
  detail?: string;
  shortDetail?: string;
}

export interface EspnStatus {
  clock?: number;
  displayClock?: string;
  period?: number;
  type: EspnStatusType;
}

export interface EspnVenueAddress {
  city?: string;
  country?: string;
}

export interface EspnVenue {
  id?: string;
  fullName?: string;
  address?: EspnVenueAddress;
  capacity?: number;
}

export interface EspnOfficial {
  displayName?: string;
  position?: {
    name?: string;
    displayName?: string;
  };
}

export interface EspnCompetition {
  id: string;
  uid?: string;
  date: string;
  attendance?: number;
  timeValid?: boolean;
  neutralSite?: boolean;
  competitors: EspnCompetitor[];
  status: EspnStatus;
  venue?: EspnVenue;
  officials?: EspnOfficial[];
  round?: {
    number?: number;
    displayName?: string;
  };
}

export interface EspnSeason {
  year: number;
  type: number;
  slug?: string;
}

export interface EspnEvent {
  id: string;
  uid?: string;
  date: string;
  name: string;
  shortName: string;
  season?: EspnSeason;
  competitions: EspnCompetition[];
  status: EspnStatus;
}

export interface EspnLeague {
  id: string;
  uid?: string;
  name: string;
  abbreviation?: string;
  slug: string;
  season?: {
    year: number;
    startDate?: string;
    endDate?: string;
    displayName?: string;
  };
  calendar?: string[];
}

export interface EspnScoreboardResponse {
  leagues?: EspnLeague[];
  season?: EspnSeason;
  day?: {
    date?: string;
  };
  events: EspnEvent[];
}

export interface EspnScoreboardOptions {
  /**
   * Date in YYYYMMDD format (e.g. '20260930').
   */
  date?: string;
  limit?: number;
  useCache?: boolean;
}

export class EspnAdapter {
  private readonly baseUrl = 'https://site.api.espn.com/apis/site/v2/sports/soccer/arg.1';
  private readonly defaultTimeoutMs = 8000;

  /**
   * Fetches real-time match data from the ESPN scoreboard endpoint:
   * https://site.api.espn.com/apis/site/v2/sports/soccer/arg.1/scoreboard
   * Incorporates local TTL cache and offline fallback capabilities.
   */
  public async fetchScoreboard(options: EspnScoreboardOptions = {}): Promise<Match[]> {
    const dateParam = options.date || '';
    const limitParam = options.limit || 50;
    const cacheKey = `espn_scoreboard_${dateParam || 'today'}_${limitParam}`;
    const ttl = dateParam ? CACHE_TTL.REGULAR_MATCHES : CACHE_TTL.REALTIME_MATCHES;

    // 1. Revisar si hay dato fresco en caché
    if (options.useCache !== false) {
      const cached = cacheService.get<Match[]>(cacheKey);
      if (cached && cached.length > 0) {
        return cached;
      }
    }

    const params = new URLSearchParams();
    if (options.date) {
      params.append('dates', options.date);
    }
    if (options.limit) {
      params.append('limit', String(options.limit));
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const url = `${this.baseUrl}/scoreboard${queryString}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.defaultTimeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Cabala-LPF-Client/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`ESPN Scoreboard error: HTTP ${response.status} ${response.statusText}`);
      }

      const data: EspnScoreboardResponse = await response.json();
      const events = data.events || [];

      const matches = events
        .map((event) => this.mapEspnEventToMatch(event))
        .filter((match): match is Match => match !== null);

      // Guardar en caché con TTL
      if (matches.length > 0) {
        cacheService.set(cacheKey, matches, ttl);
      }

      return matches;
    } catch (err: any) {
      // 2. Si falla la red (offline, timeout, etc.), intentar fallback a la última versión en caché
      const stale = cacheService.getStale<Match[]>(cacheKey);
      if (stale && stale.data && stale.data.length > 0) {
        console.warn(`[EspnAdapter] Red no disponible; entregando ${stale.data.length} partidos desde caché local (edad: ${Math.round(stale.ageMs / 1000)}s):`, err.message);
        return stale.data;
      }

      if (err.name === 'AbortError') {
        throw new Error(`Timeout al consultar ESPN Scoreboard tras ${this.defaultTimeoutMs}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Fetches a single match by ESPN event ID by querying scoreboard or fallback summary.
   */
  public async fetchMatchById(eventId: string): Promise<Match | null> {
    const cacheKey = `espn_match_${eventId}`;
    const cached = cacheService.get<Match>(cacheKey);
    if (cached) return cached;

    try {
      // Intentar primero a través del scoreboard del día
      const matches = await this.fetchScoreboard();
      const found = matches.find((m) => m.id === eventId);
      if (found) {
        const ttl = found.status === 'live' ? CACHE_TTL.REALTIME_MATCHES : CACHE_TTL.REGULAR_MATCHES;
        cacheService.set(cacheKey, found, ttl);
        return found;
      }

      // Si no se encuentra en el scoreboard actual, consultar endpoint summary
      const summaryUrl = `${this.baseUrl}/summary?event=${encodeURIComponent(eventId)}`;
      const response = await fetch(summaryUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Cabala-LPF-Client/1.0',
        },
      });

      if (!response.ok) return null;
      const summaryData = await response.json();
      if (summaryData.header) {
        const match = this.mapEspnEventToMatch(summaryData.header);
        if (match) {
          const ttl = match.status === 'live' ? CACHE_TTL.REALTIME_MATCHES : CACHE_TTL.REGULAR_MATCHES;
          cacheService.set(cacheKey, match, ttl);
          return match;
        }
      }
      return null;
    } catch (err) {
      const stale = cacheService.getStale<Match>(cacheKey);
      if (stale) return stale.data;
      console.warn(`[EspnAdapter] No se pudo obtener el partido ${eventId}:`, err);
      return null;
    }
  }

  /**
   * Fetches only active live matches in progress.
   */
  public async fetchLiveMatches(): Promise<Match[]> {
    const matches = await this.fetchScoreboard();
    return matches.filter((m) => m.status === 'live');
  }

  /**
   * Maps a raw ESPN scoreboard event JSON object to the domain Match interface.
   * Enforces CÁBALA Argentine Football regulatory rules:
   * - Scheduled matches have homeScore=null & awayScore=null (never false 0-0).
   * - Finished matches must preserve valid non-negative integer scores.
   */
  public mapEspnEventToMatch(event: EspnEvent): Match | null {
    if (!event || !event.id) return null;

    const competition = event.competitions?.[0];
    if (!competition) return null;

    const competitors = competition.competitors || [];
    const homeComp = competitors.find((c) => c.homeAway === 'home') || competitors[0];
    const awayComp = competitors.find((c) => c.homeAway === 'away') || competitors[1];

    if (!homeComp || !awayComp) return null;

    const homeRaw = homeComp.team || {};
    const awayRaw = awayComp.team || {};

    const homeTeamId = String(homeRaw.id || '');
    const awayTeamId = String(awayRaw.id || '');

    if (!homeTeamId || !awayTeamId || homeTeamId === awayTeamId) {
      return null;
    }

    // Map match status
    const statusType = competition.status?.type || event.status?.type || { state: 'pre' };
    const state = (statusType.state || '').toLowerCase();
    const statusName = (statusType.name || '').toLowerCase();
    const isCompleted = Boolean(statusType.completed);

    let status: MatchStatus = 'scheduled';
    if (state === 'post' || isCompleted || statusName.includes('final') || statusName.includes('full_time')) {
      status = 'finished';
    } else if (state === 'in' || statusName.includes('progress') || statusName.includes('halftime')) {
      status = 'live';
    } else if (statusName.includes('suspended')) {
      status = 'suspended';
    } else if (statusName.includes('delay') || state.includes('delay')) {
      status = 'delayed';
    } else if (statusName.includes('postponed')) {
      status = 'postponed';
    } else if (statusName.includes('cancelled')) {
      status = 'cancelled';
    } else {
      status = 'scheduled';
    }

    // Strict score resolution
    let homeScore: number | null = null;
    let awayScore: number | null = null;

    if (status === 'live' || status === 'finished') {
      const hParsed = homeComp.score !== undefined ? parseInt(String(homeComp.score), 10) : NaN;
      const aParsed = awayComp.score !== undefined ? parseInt(String(awayComp.score), 10) : NaN;

      if (!isNaN(hParsed) && !isNaN(aParsed) && hParsed >= 0 && aParsed >= 0) {
        homeScore = hParsed;
        awayScore = aParsed;
      }
    }

    // Parse date & kickoff time
    const rawDate = competition.date || event.date || new Date().toISOString();
    const dateObj = new Date(rawDate);
    let dateStr = new Date().toISOString().split('T')[0];
    let timeStr = '20:00';
    if (!isNaN(dateObj.getTime())) {
      dateStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Argentina/Buenos_Aires',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(dateObj);
      timeStr = new Intl.DateTimeFormat('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(dateObj);
    }

    // Minutes display for live matches
    let minute: number | undefined;
    if (status === 'live') {
      const clock = competition.status?.clock ?? event.status?.clock;
      if (typeof clock === 'number') {
        minute = Math.floor(clock / 60) || 1;
      }
    }

    const homeTeam: Club = {
      id: homeTeamId,
      name: homeRaw.displayName || homeRaw.name || 'Club Local',
      shortName: homeRaw.shortDisplayName || homeRaw.name || 'Local',
      code: homeRaw.abbreviation || 'ARG',
      city: homeRaw.location || 'Argentina',
      stadium: competition.venue?.fullName || 'Estadio Oficial',
      founded: 1900,
      logo: homeRaw.logo || homeRaw.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/soccer/500/${homeTeamId}.png`,
      primaryColor: homeRaw.color ? `#${homeRaw.color}` : '#DCA842',
      secondaryColor: homeRaw.alternateColor ? `#${homeRaw.alternateColor}` : '#181C22',
      recentForm: [],
    };

    const awayTeam: Club = {
      id: awayTeamId,
      name: awayRaw.displayName || awayRaw.name || 'Club Visitante',
      shortName: awayRaw.shortDisplayName || awayRaw.name || 'Visitante',
      code: awayRaw.abbreviation || 'ARG',
      city: awayRaw.location || 'Argentina',
      stadium: 'Estadio Oficial',
      founded: 1900,
      logo: awayRaw.logo || awayRaw.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/soccer/500/${awayTeamId}.png`,
      primaryColor: awayRaw.color ? `#${awayRaw.color}` : '#DCA842',
      secondaryColor: awayRaw.alternateColor ? `#${awayRaw.alternateColor}` : '#181C22',
      recentForm: [],
    };

    const tournament = event.season?.slug
      ? (event.season.slug.includes('apertura') ? 'Torneo Apertura 2026' : 'Torneo Clausura 2026')
      : 'Liga Profesional de Fútbol';

    const round = statusType.detail || competition.round?.displayName || 'Fecha Oficial';
    const stadium = competition.venue?.fullName || (competition.venue?.address?.city ? `Estadio en ${competition.venue.address.city}` : 'Estadio Oficial');
    const referee = competition.officials?.[0]?.displayName;

    return {
      id: String(event.id),
      homeTeamId,
      awayTeamId,
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      status,
      minute,
      date: dateStr,
      time: timeStr,
      timestamp: dateObj.getTime(),
      tournament,
      round,
      stadium,
      referee,
    };
  }
}

export const espnAdapter = new EspnAdapter();
