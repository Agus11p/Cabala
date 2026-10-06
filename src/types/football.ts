export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled' | 'suspended' | 'delayed';

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
  minute: number | string;
  type: 'goal' | 'penalty_goal' | 'yellow_card' | 'red_card' | 'sub' | 'var' | 'delay' | 'general';
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

export interface ClubHonors {
  league: number;
  nationalCup: number;
  international: number;
  total: number;
  highlighted?: string[];
  summary?: string;
}

export interface Club {
  id: string;
  name: string;
  shortName: string;
  code: string;
  city: string;
  neighborhood?: string;
  province?: string;
  stadium: string;
  stadiumNickname?: string;
  stadiumCapacity?: number;
  founded: number;
  foundedFullDate?: string;
  nickname?: string;
  nicknames?: string[];
  president?: string;
  manager?: string;
  officialWebsite?: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  zone?: 'A' | 'B';
  recentForm?: ('W' | 'D' | 'L')[];
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
    total?: number;
  };
  honors?: ClubHonors;
  historySummary?: string;
}

// Team is an alias for Club for full backwards compatibility
export type Team = Club;

export type MatchTeam = Partial<Club> & {
  id: string;
  name: string;
  shortName?: string;
  code?: string;
  logo?: string | null;
};

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam?: MatchTeam;
  awayTeam?: MatchTeam;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  minute?: number | string;
  date: string;
  time: string;
  timestamp?: number;
  tournament: string;
  round: string;
  stadium: string;
  kickoffTime?: string;
  notes?: string;
  venue?: {
    name?: string;
    city?: string;
  };
  source?: string;
  sourceId?: string;
  provenance?: any;
  isStale?: boolean;
  verificationStatus?: string;
  fetchedAt?: string;
  firstSeenAt?: string;
  [key: string]: any;
  phase?: 'apertura' | 'clausura' | 'playoffs' | string;
  zone?: 'A' | 'B' | string;
  season?: number;
  referee?: string;
  featured?: boolean;
  events?: MatchEvent[];
  stats?: MatchStats;
  lineups?: {
    home: TeamLineup;
    away: TeamLineup;
  };
}

export interface ZoneStanding {
  position: number; // 1 a 15
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
  penaltyPoints?: number;
  zone: 'A' | 'B';
  zonePosition: number; // 1 a 15
  phase: 'apertura' | 'clausura';
  seasonYear: string;
  form?: ('W' | 'D' | 'L')[];
  fairPlayPoints?: number;
  qualificationZone?: 'playoffs' | 'relegation';
  qualificationReason?: string;
  tieBreak?: {
    appliedCriterion: 'points' | 'goal_diff' | 'goals_for' | 'head_to_head' | 'fair_play' | 'lottery_pending';
    requiresLottery: boolean;
    notes: string;
  };
}

export interface AnnualStanding {
  position: number; // 1 a 30
  teamId: string;
  team?: Club;
  played: number; // Fases regulares únicamente (Apertura + Clausura)
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number; // apertura.points + clausura.points
  penaltyPoints?: number;
  seasonYear: string;
  form?: ('W' | 'D' | 'L')[];
  qualificationZone?: 'campeon_liga' | 'libertadores' | 'sudamericana' | 'relegation';
  qualificationReason?: string;
  isLeagueChampion?: boolean; // 1° de la Tabla Anual
}

export interface AverageStanding {
  position: number; // 1 a 30
  teamId: string;
  team?: Club;
  seasons?: {
    season2024Pts: number | null;
    season2025Pts: number | null;
    season2026Pts: number | null;
    season2024Played?: number | null;
    season2025Played?: number | null;
    season2026Played?: number | null;
  };
  totalPoints: number;
  totalPlayed: number;
  average: number;
  isRelegationZone?: boolean;
  statusText?: string;
}

// Backwards-compatible StandingRow definition
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
  penaltyPoints?: number;
  zone?: 'A' | 'B';
  zonePosition?: number;
  phase?: 'apertura' | 'clausura';
  seasonYear?: string;
  form?: ('W' | 'D' | 'L')[];
  fairPlayPoints?: number;
  qualificationZone?: 'libertadores' | 'sudamericana' | 'playoffs' | 'relegation' | 'campeon_liga';
  qualificationReason?: string;
  tieBreak?: {
    appliedCriterion: 'points' | 'goal_diff' | 'goals_for' | 'head_to_head' | 'fair_play' | 'lottery_pending';
    requiresLottery: boolean;
    notes: string;
  };
}

export type PromediosRow = AverageStanding;

export type UIState = 'LOADING' | 'SUCCESS' | 'EMPTY' | 'ERROR' | 'DATA_INCONSISTENCY';

export interface DataInconsistencyRecord {
  club: string;
  teamId?: string;
  field: string;
  receivedValue: number | string;
  expectedValue: number | string;
  source: string;
}

export interface ZoneStandingsResponse {
  seasonYear: string;
  phase: 'apertura' | 'clausura';
  zone: 'A' | 'B';
  available: boolean;
  message?: string;
  data: ZoneStanding[];
  inconsistencies?: DataInconsistencyRecord[];
}

export interface AnnualTableResponse {
  seasonYear: string;
  available: boolean;
  message?: string;
  data: AnnualStanding[];
  inconsistencies?: DataInconsistencyRecord[];
}

export interface AverageTableResponse {
  seasonYear: string;
  available: boolean;
  message?: string;
  data: AverageStanding[];
}

export interface StandingsResponse {
  type: TableType;
  phase?: 'apertura' | 'clausura' | string;
  available: boolean;
  season?: string;
  message?: string;
  data: (StandingRow | PromediosRow)[];
  zoneA?: ZoneStanding[];
  zoneB?: ZoneStanding[];
  inconsistencies?: DataInconsistencyRecord[];
  dataState?: UIState;
  champion?: string;
  runnerUp?: string;
  isClosed?: boolean;
  activeTournament?: 'apertura' | 'clausura';
  tournamentStatus?: 'active' | 'closed' | 'scheduled';
}

export interface SeasonPhaseInfo {
  phase: 'apertura' | 'clausura';
  tournamentName: string;
  seasonYear: string;
  isClosed: boolean;
  status: 'active' | 'closed' | 'scheduled';
  champion?: string;
  championTeamId?: string;
  runnerUp?: string;
  finalMatch?: {
    date: string;
    score: string;
    stadium: string;
    homeTeam: string;
    awayTeam: string;
  };
  description: string;
}

export type TableType =
  | 'apertura'
  | 'clausura'
  | 'anual'
  | 'promedios'
  | 'zonaA'
  | 'zonaB'
  | 'copas'
  | 'playoffs'
  | 'all';

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

export interface HeadToHeadMatch {
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
}

export interface CopaArgentinaFixture {
  tournament: string;
  season: number;
  currentStage: string;
  totalMatches: number;
  completedMatches: number;
  scheduledMatches: number;
  rounds: {
    '32vos': Match[];
    '16vos': Match[];
    octavos: Match[];
    cuartos: Match[];
    semifinales: Match[];
    final: Match[];
  };
}

export interface CopaArgentinaBracketStage {
  id: string;
  name: string;
  matches: Match[];
}

export interface CopaArgentinaBracket {
  tournament: string;
  champion: string;
  rounds: CopaArgentinaBracketStage[];
}

export interface CopaArgentinaSummary {
  tournament: string;
  totalMatches: number;
  completedMatches: number;
  scheduledMatches: number;
  completionPercentage: number;
  totalGoals: number;
  avgGoals: number;
  currentStage: string;
  semifinalists: Array<{ id: string; name: string }>;
  champion: string;
}

