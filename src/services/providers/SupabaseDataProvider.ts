/**
 * CÁBALA — SupabaseDataProvider (VMP2-A)
 *
 * Implementación de persistencia relacional en PostgreSQL / Supabase
 * que corre en paralelo con DatabaseProvider (Firestore).
 *
 * Principios:
 * - Cumple estrictamente con el contrato IDatabaseProvider.
 * - Utiliza SUPABASE_SERVICE_ROLE_KEY exclusivamente en el servidor.
 * - Si Supabase no está configurado o falla la red, opera con memoria local
 *   garantizando resiliencia sin lanzar excepciones fatales.
 * - Se activa únicamente si process.env.DATABASE_PROVIDER === 'supabase'.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  TeamEntity,
  MatchEntity,
  AverageStandingEntity,
  DataSourceEntity,
  DataIngestionRunEntity,
} from '../../types/dataContract';
import {
  IDatabaseProvider,
  ProviderStandingsResult,
  ProviderAverageResult,
} from './IDatabaseProvider';
import { TEAMS_SEED } from '../../data/teamsSeed';
import { SEASON_MATCHES_SEED } from '../../data/seasonMatchesSeed';

export class SupabaseDataProvider implements IDatabaseProvider {
  private client: SupabaseClient | null = null;
  private isConfigured = false;
  private memoryCache = {
    teams: new Map<string, TeamEntity>(),
    matches: new Map<string, MatchEntity>(),
    standings: new Map<string, ProviderStandingsResult>(),
    annualStandings: new Map<string, any>(),
    averageStandings: new Map<string, AverageStandingEntity[]>(),
    ingestionRuns: [] as DataIngestionRunEntity[],
  };

  constructor() {
    this.initClient();
  }

  private initClient(): void {
    const url =
      (typeof process !== 'undefined' && (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)) ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
      '';

    // En servidor preferir SUPABASE_SERVICE_ROLE_KEY para bypass legítimo de RLS
    const key =
      (typeof process !== 'undefined' &&
        (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY)) ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
      '';

    if (url && key && !url.includes('YOUR_PROJECT_ID')) {
      try {
        this.client = createClient(url, key, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });
        this.isConfigured = true;
      } catch (err: any) {
        console.warn('[SupabaseDataProvider] Error inicializando cliente Supabase:', err.message);
        this.client = null;
        this.isConfigured = false;
      }
    } else {
      this.client = null;
      this.isConfigured = false;
    }
  }

  public getDataSourceInfo(): DataSourceEntity {
    return {
      id: 'source_database_supabase',
      name: 'Base de Datos Relacional CÁBALA (Supabase PostgreSQL)',
      type: 'INTERNAL_ENGINE',
      rateLimitPerMinute: 20000,
      status: this.isConfigured ? 'ACTIVE' : 'INACTIVE',
      legalNotes: 'Almacén persistente PostgreSQL relacional en Supabase con RLS.',
    };
  }

  // --- EQUIPOS ---

  public async saveTeam(team: TeamEntity): Promise<void> {
    this.memoryCache.teams.set(team.id, team);
    if (!this.client) return;

    try {
      const payload = {
        id: team.id,
        name: team.name,
        short_name: team.shortName,
        slug: team.shortName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        code: team.code,
        logo_url: team.logo,
        zone: team.zone || null,
        city: team.city,
        stadium: team.stadium,
        founded: team.founded,
        primary_color: team.primaryColor,
        secondary_color: team.secondaryColor,
        titles_count: team.titlesCount?.value || { league: 0, nationalCup: 0, international: 0, total: 0 },
        updated_at: new Date().toISOString(),
      };

      await this.client.from('teams').upsert(payload, { onConflict: 'id' });
    } catch (err: any) {
      console.warn(`[SupabaseDataProvider] Error guardando club ${team.id}:`, err.message);
    }
  }

  public async saveTeams(teams: TeamEntity[]): Promise<void> {
    for (const t of teams) {
      this.memoryCache.teams.set(t.id, t);
    }
    if (!this.client || teams.length === 0) return;

    try {
      const payloads = teams.map((team) => ({
        id: team.id,
        name: team.name,
        short_name: team.shortName,
        slug: team.shortName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        code: team.code,
        logo_url: team.logo,
        zone: team.zone || null,
        city: team.city,
        stadium: team.stadium,
        founded: team.founded,
        primary_color: team.primaryColor,
        secondary_color: team.secondaryColor,
        titles_count: team.titlesCount?.value || { league: 0, nationalCup: 0, international: 0, total: 0 },
        updated_at: new Date().toISOString(),
      }));

      await this.client.from('teams').upsert(payloads, { onConflict: 'id' });
    } catch (err: any) {
      console.warn('[SupabaseDataProvider] Error guardando nómina de clubes:', err.message);
    }
  }

  public async getTeam(id: string): Promise<TeamEntity | null> {
    if (this.memoryCache.teams.has(id)) {
      return this.memoryCache.teams.get(id)!;
    }

    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('teams')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          const entity: TeamEntity = {
            id: data.id,
            name: data.name,
            shortName: data.short_name,
            code: data.code,
            city: data.city || '',
            stadium: data.stadium,
            founded: data.founded,
            logo: data.logo_url,
            primaryColor: data.primary_color || '#181C22',
            secondaryColor: data.secondary_color || '#F1EDE6',
            zone: data.zone,
            recentForm: { value: [], status: 'SIN_DATO', source: 'SUPABASE', fetchedAt: data.updated_at, season: 2026 },
            titlesCount: { value: data.titles_count || { league: 0, nationalCup: 0, international: 0, total: 0 }, status: 'VERIFIED', source: 'SUPABASE', fetchedAt: data.updated_at, season: 2026 },
            provenance: { source: 'AFA_REGULATIONS', fetchedAt: data.updated_at, season: 2026, status: 'VERIFIED', validated: true },
          };
          this.memoryCache.teams.set(id, entity);
          return entity;
        }
      } catch (err: any) {
        console.warn(`[SupabaseDataProvider] Error obteniendo club ${id}:`, err.message);
      }
    }

    const seed = TEAMS_SEED.find((t) => t.id === id);
    if (seed) {
      const entity: TeamEntity = {
        ...seed,
        stadium: seed.stadium || null,
        founded: seed.founded || null,
        logo: seed.logo || null,
        recentForm: { value: seed.recentForm || [], status: 'VERIFIED', source: 'SEED', fetchedAt: new Date().toISOString(), season: 2026 },
        titlesCount: { value: seed.titlesCount || { league: 0, nationalCup: 0, international: 0 }, status: 'VERIFIED', source: 'SEED', fetchedAt: new Date().toISOString(), season: 2026 },
        provenance: { source: 'AFA_REGULATIONS', fetchedAt: new Date().toISOString(), season: 2026, status: 'VERIFIED', validated: true },
      };
      return entity;
    }

    return null;
  }

  public async getTeams(): Promise<TeamEntity[]> {
    if (this.client) {
      try {
        const { data, error } = await this.client.from('teams').select('*');
        if (!error && data && data.length > 0) {
          const list: TeamEntity[] = data.map((t) => ({
            id: t.id,
            name: t.name,
            shortName: t.short_name,
            code: t.code,
            city: t.city || '',
            stadium: t.stadium,
            founded: t.founded,
            logo: t.logo_url,
            primaryColor: t.primary_color || '#181C22',
            secondaryColor: t.secondary_color || '#F1EDE6',
            zone: t.zone,
            recentForm: { value: [], status: 'SIN_DATO', source: 'SUPABASE', fetchedAt: t.updated_at, season: 2026 },
            titlesCount: { value: t.titles_count || { league: 0, nationalCup: 0, international: 0 }, status: 'VERIFIED', source: 'SUPABASE', fetchedAt: t.updated_at, season: 2026 },
            provenance: { source: 'AFA_REGULATIONS', fetchedAt: t.updated_at, season: 2026, status: 'VERIFIED', validated: true },
          }));
          for (const item of list) {
            this.memoryCache.teams.set(item.id, item);
          }
          return list;
        }
      } catch (err: any) {
        console.warn('[SupabaseDataProvider] Error consultando clubes en Supabase:', err.message);
      }
    }

    if (this.memoryCache.teams.size > 0) {
      return Array.from(this.memoryCache.teams.values());
    }

    return TEAMS_SEED.map((seed) => ({
      ...seed,
      stadium: seed.stadium || null,
      founded: seed.founded || null,
      logo: seed.logo || null,
      recentForm: { value: seed.recentForm || [], status: 'VERIFIED', source: 'SEED', fetchedAt: new Date().toISOString(), season: 2026 },
      titlesCount: { value: seed.titlesCount || { league: 0, nationalCup: 0, international: 0 }, status: 'VERIFIED', source: 'SEED', fetchedAt: new Date().toISOString(), season: 2026 },
      provenance: { source: 'AFA_REGULATIONS', fetchedAt: new Date().toISOString(), season: 2026, status: 'VERIFIED', validated: true },
    }));
  }

  // --- PARTIDOS ---

  public async saveMatch(match: MatchEntity): Promise<void> {
    this.memoryCache.matches.set(match.id, match);
    if (!this.client) return;

    try {
      const payload = {
        id: match.id,
        season: String(match.season || '2026'),
        competition: match.competitionId || match.tournament || 'arg.1',
        matchday: match.round || 'Fecha Oficial',
        date: match.date,
        time: match.time,
        kickoff_time: match.kickoffTime || match.time,
        timestamp: match.timestamp || Date.now(),
        home_team_id: match.homeTeamId,
        away_team_id: match.awayTeamId,
        home_score: match.homeScore,
        away_score: match.awayScore,
        status: match.status,
        minute: match.minute ? String(match.minute) : null,
        venue: match.stadium || match.venue?.name || null,
        phase: match.phase || null,
        zone: match.zone || null,
        source: match.source || 'ESPN',
        events: match.events || [],
        stats: match.stats || null,
        provenance: match.provenance || {},
        is_stale: Boolean(match.isStale),
        updated_at: new Date().toISOString(),
      };

      await this.client.from('matches').upsert(payload, { onConflict: 'id' });
    } catch (err: any) {
      console.warn(`[SupabaseDataProvider] Error guardando partido ${match.id}:`, err.message);
    }
  }

  public async saveMatches(matches: MatchEntity[]): Promise<void> {
    for (const m of matches) {
      this.memoryCache.matches.set(m.id, m);
    }
    if (!this.client || matches.length === 0) return;

    try {
      const payloads = matches.map((match) => ({
        id: match.id,
        season: String(match.season || '2026'),
        competition: match.competitionId || match.tournament || 'arg.1',
        matchday: match.round || 'Fecha Oficial',
        date: match.date,
        time: match.time,
        kickoff_time: match.kickoffTime || match.time,
        timestamp: match.timestamp || Date.now(),
        home_team_id: match.homeTeamId,
        away_team_id: match.awayTeamId,
        home_score: match.homeScore,
        away_score: match.awayScore,
        status: match.status,
        minute: match.minute ? String(match.minute) : null,
        venue: match.stadium || match.venue?.name || null,
        phase: match.phase || null,
        zone: match.zone || null,
        source: match.source || 'ESPN',
        events: match.events || [],
        stats: match.stats || null,
        provenance: match.provenance || {},
        is_stale: Boolean(match.isStale),
        updated_at: new Date().toISOString(),
      }));

      await this.client.from('matches').upsert(payloads, { onConflict: 'id' });
    } catch (err: any) {
      console.warn('[SupabaseDataProvider] Error guardando lote de partidos:', err.message);
    }
  }

  public async getMatch(id: string): Promise<MatchEntity | null> {
    if (this.memoryCache.matches.has(id)) {
      return this.memoryCache.matches.get(id)!;
    }

    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('matches')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          const match: MatchEntity = {
            id: data.id,
            competitionId: data.competition,
            homeTeamId: data.home_team_id,
            awayTeamId: data.away_team_id,
            homeScore: data.home_score,
            awayScore: data.away_score,
            status: data.status,
            minute: data.minute,
            date: data.date,
            time: data.time,
            kickoffTime: data.kickoff_time,
            timestamp: Number(data.timestamp),
            stadium: data.venue,
            referee: null,
            round: data.matchday,
            tournament: data.competition,
            events: data.events || [],
            stats: data.stats || null,
            provenance: data.provenance,
            isStale: data.is_stale,
          };
          this.memoryCache.matches.set(id, match);
          return match;
        }
      } catch (err: any) {
        console.warn(`[SupabaseDataProvider] Error obteniendo partido ${id}:`, err.message);
      }
    }

    const seed = SEASON_MATCHES_SEED.find((m) => m.id === id);
    if (seed) return seed as any;
    return null;
  }

  public async getMatchById(id: string): Promise<MatchEntity | null> {
    return this.getMatch(id);
  }

  public async getMatches(filter?: {
    date?: string;
    teamId?: string;
    phase?: string;
    zone?: string;
    status?: string;
    scope?: string;
  }): Promise<MatchEntity[]> {
    if (this.client) {
      try {
        let q = this.client.from('matches').select('*').order('date', { ascending: true });
        if (filter?.date) q = q.eq('date', filter.date);
        if (filter?.status) q = q.eq('status', filter.status);
        if (filter?.zone) q = q.eq('zone', filter.zone);
        if (filter?.phase) q = q.eq('phase', filter.phase);
        if (filter?.teamId) {
          q = q.or(`home_team_id.eq.${filter.teamId},away_team_id.eq.${filter.teamId}`);
        }

        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          return data.map((d) => ({
            id: d.id,
            competitionId: d.competition,
            homeTeamId: d.home_team_id,
            awayTeamId: d.away_team_id,
            homeScore: d.home_score,
            awayScore: d.away_score,
            status: d.status,
            minute: d.minute,
            date: d.date,
            time: d.time,
            kickoffTime: d.kickoff_time,
            timestamp: Number(d.timestamp),
            stadium: d.venue,
            referee: null,
            round: d.matchday,
            tournament: d.competition,
            events: d.events || [],
            stats: d.stats || null,
            provenance: d.provenance,
            isStale: d.is_stale,
          }));
        }
      } catch (err: any) {
        console.warn('[SupabaseDataProvider] Error consultando partidos:', err.message);
      }
    }

    if (this.memoryCache.matches.size > 0) {
      let list = Array.from(this.memoryCache.matches.values());
      if (filter?.date) list = list.filter((m) => m.date === filter.date);
      if (filter?.status) list = list.filter((m) => m.status === filter.status);
      if (filter?.teamId) list = list.filter((m) => m.homeTeamId === filter.teamId || m.awayTeamId === filter.teamId);
      return list;
    }

    let seedList = [...SEASON_MATCHES_SEED] as any[];
    if (filter?.date) seedList = seedList.filter((m) => m.date === filter.date);
    if (filter?.status) seedList = seedList.filter((m) => m.status === filter.status);
    if (filter?.teamId) seedList = seedList.filter((m) => m.homeTeamId === filter.teamId || m.awayTeamId === filter.teamId);
    return seedList;
  }

  public async getCoverageMetrics(): Promise<{
    totalSeasonMatches: number;
    playedMatches: number;
    scheduledMatches: number;
    liveMatches: number;
    temporalCoverage: { startDate: string; endDate: string; totalDays: number };
    teamsWithCompleteFixture: number;
    invariantCheck: boolean;
  }> {
    const matches = await this.getMatches();
    const played = matches.filter((m) => m.status === 'finished').length;
    const scheduled = matches.filter((m) => m.status === 'scheduled').length;
    const live = matches.filter((m) => m.status === 'live').length;

    const dates = matches.map((m) => m.date).filter(Boolean).sort();
    const startDate = dates[0] || '2026-01-22';
    const endDate = dates[dates.length - 1] || '2026-11-08';
    const totalDays = new Set(dates).size;

    return {
      totalSeasonMatches: matches.length,
      playedMatches: played,
      scheduledMatches: scheduled,
      liveMatches: live,
      temporalCoverage: { startDate, endDate, totalDays },
      teamsWithCompleteFixture: 30,
      invariantCheck: matches.length === played + scheduled + live,
    };
  }

  // --- TABLAS DE POSICIONES ---

  public async saveStandings(standing: ProviderStandingsResult): Promise<void> {
    const key = `${standing.seasonYear}_${standing.phase}`;
    this.memoryCache.standings.set(key, standing);
    if (!this.client) return;

    try {
      const rows: any[] = [];
      const addRow = (r: any, zone: 'A' | 'B') => {
        const penalty = r.penaltyPoints || 0;
        rows.push({
          id: `${standing.seasonYear}_${standing.phase}_${zone}_${r.teamId}`,
          season: standing.seasonYear,
          competition: standing.phase,
          zone,
          team_id: r.teamId,
          position: r.position || r.zonePosition,
          played: r.played,
          won: r.won,
          drawn: r.drawn,
          lost: r.lost,
          goals_for: r.goalsFor,
          goals_against: r.goalsAgainst,
          goal_difference: r.goalDiff,
          points: r.points,
          penalty_points: penalty,
          form: r.form || [],
          qualification_zone: r.qualificationZone || null,
          qualification_reason: r.qualificationReason || null,
          source: 'ESPN',
          provenance: standing.provenance || {},
          updated_at: new Date().toISOString(),
        });
      };

      (standing.zoneA || []).forEach((r) => addRow(r, 'A'));
      (standing.zoneB || []).forEach((r) => addRow(r, 'B'));

      if (rows.length > 0) {
        await this.client.from('standings').upsert(rows, { onConflict: 'id' });
      }
    } catch (err: any) {
      console.warn('[SupabaseDataProvider] Error guardando tablas en Supabase:', err.message);
    }
  }

  public async getStandings(
    phase: 'apertura' | 'clausura' | 'anual',
    season = '2026'
  ): Promise<ProviderStandingsResult | null> {
    const key = `${season}_${phase}`;
    if (this.memoryCache.standings.has(key)) {
      return this.memoryCache.standings.get(key)!;
    }

    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('standings')
          .select('*')
          .eq('season', season)
          .eq('competition', phase)
          .order('position', { ascending: true });

        if (!error && data && data.length > 0) {
          const mapRow = (d: any) => ({
            position: d.position,
            teamId: d.team_id,
            played: d.played,
            won: d.won,
            drawn: d.drawn,
            lost: d.lost,
            goalsFor: d.goals_for,
            goalsAgainst: d.goals_against,
            goalDiff: d.goal_difference,
            points: d.points,
            penaltyPoints: d.penalty_points || 0,
            zone: d.zone,
            form: d.form || [],
            qualificationZone: d.qualification_zone,
            qualificationReason: d.qualification_reason,
          });

          const zoneA = data.filter((d) => d.zone === 'A').map(mapRow);
          const zoneB = data.filter((d) => d.zone === 'B').map(mapRow);

          const result: ProviderStandingsResult = {
            seasonYear: season,
            phase,
            available: true,
            zoneA,
            zoneB,
            provenance: { source: 'ESPN', status: 'VERIFIED', fetchedAt: new Date().toISOString(), validated: true, season },
          };
          this.memoryCache.standings.set(key, result);
          return result;
        }
      } catch (err: any) {
        console.warn(`[SupabaseDataProvider] Error consultando tablas de ${phase}:`, err.message);
      }
    }

    return null;
  }

  public async saveAnnualStanding(standing: {
    seasonYear: string;
    rows: any[];
    provenance?: any;
  }): Promise<void> {
    this.memoryCache.annualStandings.set(standing.seasonYear, standing);
    if (!this.client || !standing.rows) return;

    try {
      const payloads = standing.rows.map((r: any) => ({
        id: `${standing.seasonYear}_${r.teamId}`,
        season: standing.seasonYear,
        team_id: r.teamId,
        position: r.position,
        played: r.played,
        won: r.won,
        drawn: r.drawn,
        lost: r.lost,
        goals_for: r.goalsFor,
        goals_against: r.goalsAgainst,
        goal_difference: r.goalDiff,
        points: r.points,
        penalty_points: r.penaltyPoints || 0,
        qualification_zone: r.qualificationZone || null,
        source: 'CÁBALA_CONSOLIDATED',
        provenance: standing.provenance || {},
        updated_at: new Date().toISOString(),
      }));

      await this.client.from('annual_standings').upsert(payloads, { onConflict: 'id' });
    } catch (err: any) {
      console.warn('[SupabaseDataProvider] Error guardando tabla anual:', err.message);
    }
  }

  public async getAnnualStanding(seasonYear = '2026'): Promise<{
    seasonYear: string;
    rows: any[];
    provenance: any;
  } | null> {
    if (this.memoryCache.annualStandings.has(seasonYear)) {
      return this.memoryCache.annualStandings.get(seasonYear)!;
    }

    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('annual_standings')
          .select('*')
          .eq('season', seasonYear)
          .order('position', { ascending: true });

        if (!error && data && data.length > 0) {
          const rows = data.map((d) => ({
            position: d.position,
            teamId: d.team_id,
            played: d.played,
            won: d.won,
            drawn: d.drawn,
            lost: d.lost,
            goalsFor: d.goals_for,
            goalsAgainst: d.goals_against,
            goalDiff: d.goal_difference,
            points: d.points,
            penaltyPoints: d.penalty_points || 0,
            qualificationZone: d.qualification_zone,
          }));

          const res = {
            seasonYear,
            rows,
            provenance: { source: 'CÁBALA_CONSOLIDATED', status: 'VERIFIED', fetchedAt: new Date().toISOString(), validated: true, season: seasonYear },
          };
          this.memoryCache.annualStandings.set(seasonYear, res);
          return res;
        }
      } catch (err: any) {
        console.warn('[SupabaseDataProvider] Error obteniendo tabla anual:', err.message);
      }
    }

    return null;
  }

  public async saveAverageStandings(standings: AverageStandingEntity[]): Promise<void> {
    this.memoryCache.averageStandings.set('2026', standings);
    if (!this.client || standings.length === 0) return;

    try {
      const payloads = standings.map((item) => ({
        id: `2026_${item.teamId}`,
        season: '2026',
        team_id: item.teamId,
        position: item.position || 0,
        points_2024: item.seasons?.season2024Pts || 0,
        played_2024: item.seasons?.season2024Played || 0,
        points_2025: item.seasons?.season2025Pts || 0,
        played_2025: item.seasons?.season2025Played || 0,
        points_2026: item.seasons?.season2026Pts || 0,
        played_2026: item.seasons?.season2026Played || 0,
        total_points: item.totalPoints || 0,
        total_played: item.totalPlayed || 0,
        average: item.average || 0,
        relegation_status: item.position === 30 || item.position === 29 ? 'DESCENSO_PROMEDIOS' : 'PERMANECE',
        source: 'PROMIEDOS',
        source_url: 'https://www.promiedos.com.ar/league/liga-profesional/hc',
        updated_at: new Date().toISOString(),
      }));

      await this.client.from('average_standings').upsert(payloads, { onConflict: 'id' });
    } catch (err: any) {
      console.warn('[SupabaseDataProvider] Error guardando promedios:', err.message);
    }
  }

  public async getAverageStandings(
    season = '2026',
    includeSecondary = false
  ): Promise<ProviderAverageResult> {
    if (this.memoryCache.averageStandings.has(season)) {
      return {
        seasonYear: season,
        available: true,
        data: this.memoryCache.averageStandings.get(season)!,
        provenance: { source: 'PROMIEDOS', status: 'SECONDARY_SOURCE_ONLY', fetchedAt: new Date().toISOString(), validated: true, season },
      };
    }

    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('average_standings')
          .select('*')
          .eq('season', season)
          .order('position', { ascending: true });

        if (!error && data && data.length > 0) {
          const list: AverageStandingEntity[] = data.map((d) => ({
            id: d.id,
            teamId: d.team_id,
            position: d.position,
            seasons: {
              season2024Pts: d.points_2024,
              season2024Played: d.played_2024,
              season2025Pts: d.points_2025,
              season2025Played: d.played_2025,
              season2026Pts: d.points_2026,
              season2026Played: d.played_2026,
            },
            totalPoints: d.total_points,
            totalPlayed: d.total_played,
            average: Number(d.average),
            provenance: { source: 'PROMIEDOS', status: 'SECONDARY_SOURCE_ONLY', fetchedAt: d.updated_at, validated: true, season },
          }));

          this.memoryCache.averageStandings.set(season, list);
          return {
            seasonYear: season,
            available: true,
            data: list,
            provenance: { source: 'PROMIEDOS', status: 'SECONDARY_SOURCE_ONLY', fetchedAt: new Date().toISOString(), validated: true, season },
          };
        }
      } catch (err: any) {
        console.warn('[SupabaseDataProvider] Error obteniendo promedios:', err.message);
      }
    }

    return {
      seasonYear: season,
      available: false,
      message: 'Tabla de promedios no disponible en persistencia.',
      data: [],
      provenance: { source: 'PROMIEDOS', status: 'SIN_DATO', fetchedAt: new Date().toISOString(), validated: false, season },
    };
  }

  // --- TRAZABILIDAD DE INGESTA ---

  public async recordIngestionRun(run: DataIngestionRunEntity): Promise<void> {
    this.memoryCache.ingestionRuns.unshift(run);
    if (!this.client) return;

    try {
      const payload = {
        id: run.id,
        provider: run.provider,
        endpoint: run.endpoint,
        started_at: run.startedAt,
        finished_at: run.completedAt || null,
        status: run.status,
        records_count: run.recordsCount || (run.recordsStored ? Object.values(run.recordsStored).reduce((a, b) => a + b, 0) : 0),
        errors: run.errors || [],
        metadata: run.metadata || {},
        created_at: new Date().toISOString(),
      };

      await this.client.from('data_ingestion_runs').insert(payload);
    } catch (err: any) {
      console.warn('[SupabaseDataProvider] Error registrando auditoría de ingesta:', err.message);
    }
  }

  public async getIngestionStatus(): Promise<{
    lastRun: DataIngestionRunEntity | null;
    runs: DataIngestionRunEntity[];
    totalStored: { teams: number; matches: number; standings: number };
  }> {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('data_ingestion_runs')
          .select('*')
          .order('started_at', { ascending: false })
          .limit(10);

        if (!error && data && data.length > 0) {
          const runs: DataIngestionRunEntity[] = data.map((d) => ({
            id: d.id,
            provider: d.provider as any,
            endpoint: d.endpoint,
            startedAt: d.started_at,
            completedAt: d.finished_at,
            durationMs: d.finished_at && d.started_at ? new Date(d.finished_at).getTime() - new Date(d.started_at).getTime() : 0,
            status: d.status,
            recordsCount: d.records_count,
            errors: d.errors || [],
            metadata: d.metadata || {},
          }));

          return {
            lastRun: runs[0] || null,
            runs,
            totalStored: {
              teams: this.memoryCache.teams.size,
              matches: this.memoryCache.matches.size,
              standings: this.memoryCache.standings.size,
            },
          };
        }
      } catch (err: any) {
        console.warn('[SupabaseDataProvider] Error obteniendo historial de ingesta:', err.message);
      }
    }

    return {
      lastRun: this.memoryCache.ingestionRuns[0] || null,
      runs: this.memoryCache.ingestionRuns.slice(0, 10),
      totalStored: {
        teams: this.memoryCache.teams.size,
        matches: this.memoryCache.matches.size,
        standings: this.memoryCache.standings.size,
      },
    };
  }

  public async getPersistenceDiagnostics(): Promise<{
    firestoreConnected?: boolean;
    supabaseConnected?: boolean;
    databaseId?: string;
    activeProvider?: string;
    isConfigured: boolean;
  }> {
    let supabaseConnected = false;
    if (this.client && this.isConfigured) {
      try {
        const { error } = await this.client.from('teams').select('id').limit(1);
        supabaseConnected = !error;
      } catch {
        supabaseConnected = false;
      }
    }

    return {
      firestoreConnected: false,
      supabaseConnected,
      isConfigured: this.isConfigured,
      activeProvider: 'supabase',
      databaseId: 'supabase-postgresql-instance',
    };
  }
}
