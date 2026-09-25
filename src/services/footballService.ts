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
} from '../types/football';

export interface MatchFilter {
  status?: MatchStatus | 'all' | 'today';
  teamId?: string;
  tournament?: string;
  date?: string;
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
  favoriteClubId: '5', // Boca Juniors or first team
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
    // Load persisted user preferences if available
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      this.userProfile = saved ? JSON.parse(saved) : { ...DEFAULT_USER };
    } catch {
      this.userProfile = { ...DEFAULT_USER };
    }
  }

  // Provider Info
  public async getProviderStatus(): Promise<ProviderInfo> {
    try {
      const res = await fetch('/api/football/provider-info');
      if (!res.ok) throw new Error('Status unavailable');
      return await res.json();
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

  // Matches
  public async getMatches(filter?: MatchFilter): Promise<Match[]> {
    const params = new URLSearchParams();
    if (filter?.status) params.append('status', filter.status);
    if (filter?.teamId) params.append('teamId', filter.teamId);
    if (filter?.date) params.append('date', filter.date);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`/api/football/matches${query}`);
    if (!res.ok) {
      throw new Error('Error al consultar partidos desde el proveedor de datos (ESPN).');
    }
    return await res.json();
  }

  public async getMatchById(id: string): Promise<Match | null> {
    const res = await fetch(`/api/football/matches/${id}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Error al obtener la ficha técnica del encuentro.');
    }
    return await res.json();
  }

  public async getFeaturedMatch(): Promise<Match | null> {
    const matches = await this.getMatches();
    if (!matches || matches.length === 0) return null;

    // Prioritize active live matches, then first scheduled/finished
    const live = matches.find((m) => m.status === 'live');
    if (live) return live;
    return matches[0] || null;
  }

  // Teams
  public async getTeams(): Promise<Team[]> {
    const res = await fetch('/api/football/teams');
    if (!res.ok) {
      throw new Error('Error al consultar la nómina de clubes de Primera División.');
    }
    const teams: Team[] = await res.json();
    return teams.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }

  public async getTeamById(id: string): Promise<Team | null> {
    const teams = await this.getTeams();
    return teams.find((t) => t.id === id || t.code === id) || null;
  }

  // Standings
  public async getStandings(type: TableType, zone?: 'A' | 'B'): Promise<StandingsResponse> {
    const zoneQuery = zone ? `&zone=${zone}` : '';
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
  }

  public async getZoneStandings(
    season = '2026',
    phase: 'apertura' | 'clausura' = 'clausura',
    zone: 'A' | 'B' = 'A'
  ): Promise<ZoneStandingsResponse> {
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
  }

  public async getAnnualTable(season = '2026'): Promise<AnnualTableResponse> {
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
  }

  // News
  public async getNews(): Promise<NewsInsight[]> {
    try {
      const res = await fetch('/api/football/news');
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
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
}

export const footballService = new FootballService();
