/**
Contrato común de persistencia deportiva para CÁBALA.
Permite alternar entre Firestore y Supabase/PostgreSQL de forma transparente.
*/

import {
  TeamEntity,
  MatchEntity,
  AverageStandingEntity,
  DataSourceEntity,
  DataIngestionRunEntity,
} from '../../types/dataContract';

export interface ProviderStandingsResult {
  seasonYear: string;
  phase: 'apertura' | 'clausura' | 'anual';
  available: boolean;
  message?: string;
  zoneA?: any[];
  zoneB?: any[];
  rows?: any[];
  provenance: any;
  inconsistencies?: any[];
  champion?: string;
  runnerUp?: string;
  isClosed?: boolean;
}

export interface ProviderAverageResult {
  seasonYear: string;
  available: boolean;
  message?: string;
  data: AverageStandingEntity[];
  provenance: any;
}

export interface IDatabaseProvider {
  getDataSourceInfo(): DataSourceEntity;
  saveTeam(team: TeamEntity): Promise<void>;
  saveTeams(teams: TeamEntity[]): Promise<void>;
  getTeam(id: string): Promise<TeamEntity | null>;
  getTeams(): Promise<TeamEntity[]>;
  saveMatch(match: MatchEntity): Promise<void>;
  saveMatches(matches: MatchEntity[]): Promise<void>;
  getMatch(id: string): Promise<MatchEntity | null>;
  getMatchById(id: string): Promise<MatchEntity | null>;
  getMatches(filter?: {
    date?: string;
    teamId?: string;
    phase?: string;
    zone?: string;
    status?: string;
    scope?: string;
  }): Promise<MatchEntity[]>;
  getCoverageMetrics(): Promise<{
    totalSeasonMatches: number;
    playedMatches: number;
    scheduledMatches: number;
    liveMatches: number;
    temporalCoverage: { startDate: string; endDate: string; totalDays: number };
    teamsWithCompleteFixture: number;
    invariantCheck: boolean;
  }>;
  saveStandings(standing: ProviderStandingsResult): Promise<void>;
  getStandings(
    phase: 'apertura' | 'clausura' | 'anual',
    season?: string
  ): Promise<ProviderStandingsResult | null>;
  saveAnnualStanding(standing: {
    seasonYear: string;
    rows: any[];
    provenance?: any;
  }): Promise<void>;
  getAnnualStanding(seasonYear?: string): Promise<{
    seasonYear: string;
    rows: any[];
    provenance: any;
  } | null>;
  recordIngestionRun(run: DataIngestionRunEntity): Promise<void>;
  getIngestionStatus(): Promise<{
    lastRun: DataIngestionRunEntity | null;
    runs: DataIngestionRunEntity[];
    totalStored: { teams: number; matches: number; standings: number };
  }>;
  saveAverageStandings(standings: AverageStandingEntity[]): Promise<void>;
  getAverageStandings(
    season?: string,
    includeSecondary?: boolean
  ): Promise<ProviderAverageResult>;
  getPersistenceDiagnostics(): Promise<{
    firestoreConnected?: boolean;
    supabaseConnected?: boolean;
    databaseId?: string;
    activeProvider?: string;
    [key: string]: any;
  }>;
}
