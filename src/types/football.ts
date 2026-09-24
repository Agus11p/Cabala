export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';

export interface Competition {
  id: string;
  name: string;
  code: string;
  country: string;
  season: string;
}

export interface Season {
  year: number;
  displayName: string;
  startDate?: string;
  endDate?: string;
  currentTournament: string;
}

export interface MatchEvent {
  id: string;
  minute: number;
  type: 'goal' | 'penalty_goal' | 'yellow_card' | 'red_card' | 'sub';
  teamId: string;
  player: string;
  assistOrSubOut?: string;
  isPenalty?: boolean;
}

export interface MatchStats {
  possession: [number, number]; // [home%, away%]
  shots: [number, number];
  shotsOnTarget: [number, number];
  corners: [number, number];
  fouls: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
  offsides: [number, number];
  passesAccurate?: [number, number];
}

export interface PlayerLineup {
  number: number;
  name: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  isCaptain?: boolean;
}

export interface TeamLineup {
  formation: string; // e.g. "4-3-3"
  coach: string;
  starters: PlayerLineup[];
  substitutes: PlayerLineup[];
}

export interface Club {
  id: string;
  name: string;
  shortName: string;
  code: string;
  city: string;
  neighborhood?: string;
  stadium: string;
  founded: number;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  recentForm: ('W' | 'D' | 'L')[];
  seasonStats?: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
    position: number;
    cleanSheets?: number;
    avgPossession?: number;
  };
  titlesCount?: {
    league: number;
    nationalCup: number;
    international: number;
  };
}

// Team is an alias for Club for full backwards compatibility
export type Team = Club;

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam?: Club;
  awayTeam?: Club;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  minute?: number;
  date: string;
  time: string;
  timestamp?: number;
  tournament: string;
  round: string;
  stadium: string;
  referee?: string;
  featured?: boolean;
  events?: MatchEvent[];
  stats?: MatchStats;
  lineups?: {
    home: TeamLineup;
    away: TeamLineup;
  };
}

export interface StandingRow {
  position: number;
  teamId: string;
  team?: Club;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form?: ('W' | 'D' | 'L')[];
  qualificationZone?: 'libertadores' | 'sudamericana' | 'relegation';
}

export interface PromediosRow {
  position: number;
  teamId: string;
  team?: Club;
  seasons?: {
    season2024Pts: number;
    season2025Pts: number;
    season2026Pts: number;
  };
  totalPoints: number;
  totalPlayed: number;
  average: number;
  isRelegationZone?: boolean;
}

export interface StandingsResponse {
  type: TableType;
  available: boolean;
  season?: string;
  message?: string;
  data: (StandingRow | PromediosRow)[];
}

export type TableType = 'apertura' | 'clausura' | 'anual' | 'promedios';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  favoriteClubId: string;
  rankTitle: string; // e.g. "Plata II"
  rankTier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legend';
  elo: number;
  wins: number;
  losses: number;
  streak: number;
  achievements: {
    id: string;
    title: string;
    desc: string;
    unlockedAt?: string;
    icon: string;
  }[];
}

export interface NewsInsight {
  id: string;
  tag: string;
  title: string;
  summary: string;
  date: string;
  readTime: string;
  teamId?: string;
  author: string;
  imageUrl?: string;
}
