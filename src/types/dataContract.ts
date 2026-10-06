/**
 * CÁBALA — Contratos de Datos, Entidades Normalizadas y Trazabilidad (Provenance)
 *
 * Principio Rector:
 * - DATOS INVENTADOS = ERROR
 * - Si falta cualquier información: "SIN DATO"
 * - Cero (0) NO significa "SIN DATO" (0 es un valor numérico válido).
 */

export type ProvenanceStatus =
  | 'VERIFIED'
  | 'PARTIAL'
  | 'UNAVAILABLE'
  | 'STALE'
  | 'ERROR'
  | 'DATA_INCONSISTENCY'
  | 'SIN_DATO'
  | 'REQUIERE_VERIFICACIÓN_REGLAMENTARIA'
  | 'SECONDARY_SOURCE_ONLY';

export interface ProvenanceMeta {
  source: 'ESPN' | 'AFA_REGULATIONS' | 'INTERNAL_ENGINE' | 'SCRAPER_AFA' | 'MANUAL_VERIFIED' | 'PROMIEDOS';
  sourceUrl?: string;
  sourceId?: string;
  fetchedAt: string;
  season: number | string;
  status: ProvenanceStatus;
  validated: boolean;
  notes?: string;
}

export interface TrackedValue<T> {
  value: T | null;
  status: ProvenanceStatus;
  source: string;
  fetchedAt: string;
  season: number | string;
  notes?: string;
}

// ----------------------------------------------------
// Entidades de la Base de Datos Interna Normalizada
// ----------------------------------------------------

export interface SeasonEntity {
  id: string; // e.g. "2026"
  year: number;
  displayName: string;
  status: 'active' | 'completed' | 'upcoming';
  provenance: ProvenanceMeta;
}

export interface CompetitionEntity {
  id: string; // e.g. "arg.1"
  name: string;
  country: string;
  seasonYear: string;
  governingBody: string; // "AFA / Liga Profesional de Fútbol"
  provenance: ProvenanceMeta;
}

export interface PhaseEntity {
  id: string; // e.g. "apertura-2026"
  competitionId: string;
  name: 'apertura' | 'clausura' | 'anual';
  year: number;
  format: 'zonas' | 'acumulada_30';
  provenance: ProvenanceMeta;
}

export interface ZoneEntity {
  id: string; // e.g. "clausura-2026-A"
  phaseId: string;
  zoneCode: 'A' | 'B';
  expectedTeamsCount: number; // 15
  provenance: ProvenanceMeta;
}

export interface TeamEntity {
  id: string;
  name: string;
  shortName: string;
  code: string;
  city: string;
  stadium: string | null;
  founded: number | null;
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
  zone?: 'A' | 'B';
  recentForm: TrackedValue<('W' | 'D' | 'L')[]>;
  titlesCount: TrackedValue<{
    league: number;
    nationalCup: number;
    international: number;
  }>;
  provenance: ProvenanceMeta;
}

export interface MatchEntity {
  id: string;
  competitionId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled' | 'suspended' | 'delayed';
  minute?: number | string | null;
  date: string;
  time: string | null;
  kickoffTime?: string | null;
  timestamp?: number | null;
  stadium: string | null;
  referee: string | null;
  round: string;
  tournament: string;
  events?: any[];
  stats?: any;
  provenance: ProvenanceMeta;
  season?: number | string;
  phase?: 'apertura' | 'clausura' | 'playoffs';
  zone?: 'A' | 'B' | 'interzonal';
  homeTeam?: any;
  awayTeam?: any;
  venue?: { name?: string | null; city?: string | null } | null;
  source?: string;
  sourceId?: string;
  firstSeenAt?: string;
  lastSeenAt?: string;
  ingestionRunId?: string;
  isStale?: boolean;
  verificationStatus?: ProvenanceStatus;
  primarySource?: string;
  secondarySources?: string[];
  crossValidation?: {
    status: 'MATCH' | 'CONFLICT' | 'ONLY_ESPN' | 'ONLY_PROMIEDOS' | 'UNVERIFIED';
    checkedAt: string;
    sources: string[];
    differences?: string[];
    notes?: string;
  };
  tvNetworks?: string[];
}

export interface StandingEntity {
  id: string;
  phaseId: string;
  zone: 'A' | 'B';
  position: number;
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  penaltyPoints?: number | null;
  fairPlayPoints?: number | null;
  provenance: ProvenanceMeta;
}

export interface AnnualStandingEntity {
  id: string;
  seasonYear: string;
  position: number;
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  penaltyPoints?: number | null;
  isLeagueChampion?: boolean;
  provenance: ProvenanceMeta;
}

export interface AverageStandingEntity {
  id: string;
  teamId: string;
  team?: any;
  position: number | null;
  seasons: {
    season2024Pts: number | null;
    season2025Pts: number | null;
    season2026Pts: number | null;
    season2024Played?: number | null;
    season2025Played?: number | null;
    season2026Played?: number | null;
  } | null;
  totalPoints: number | null;
  totalPlayed: number | null;
  average: number | null;
  provenance: ProvenanceMeta;
}

export interface PlayoffEntity {
  id: string;
  phaseId: string;
  round: 'octavos' | 'cuartos' | 'semifinal' | 'final';
  matchKey: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  winnerTeamId?: string | null;
  provenance: ProvenanceMeta;
}

export interface RegulationRuleEntity {
  id: string;
  competitionId: string;
  ruleCategory: 'tie_breaker' | 'playoff_qualification' | 'relegation' | 'international_cups';
  description: string;
  authority: string; // "AFA"
  isDeterministic: boolean;
  verificationStatus: 'VERIFICADO_AFA_2026' | 'REQUIERE_VERIFICACIÓN_REGLAMENTARIA';
}

export interface DataSourceEntity {
  id: string;
  name: string;
  type: 'API' | 'SCRAPER' | 'MANUAL' | 'INTERNAL_ENGINE';
  endpoint?: string;
  rateLimitPerMinute: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DEGRADED';
  legalNotes: string;
}

export interface DataIngestionRunEntity {
  id: string;
  sourceId: string;
  startedAt: string;
  completedAt: string;
  recordsIngested: number;
  recordsVerified: number;
  inconsistenciesCount: number;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  errorMessage?: string;
}
