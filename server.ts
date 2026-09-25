import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolveZoneTie, getAnnualTable, validateStandingsIntegrity, validateZoneIntegrity } from './src/services/competitionRules';
import type { ZoneStanding, StandingRow, DataInconsistencyRecord } from './src/types/football';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const portArgIndex = process.argv.indexOf('--port');
const cliPort = portArgIndex !== -1 ? parseInt(process.argv[portArgIndex + 1], 10) : undefined;
const PORT = cliPort || (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);

const hostArgIndex = process.argv.indexOf('--host');
const cliHost = hostArgIndex !== -1 ? process.argv[hostArgIndex + 1] : undefined;
const HOST = cliHost || '0.0.0.0';

app.use(express.json());

// In-memory cache for external football API data (reduces latency & respects rate limits)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const cache: Record<string, CacheEntry<unknown>> = {};
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

async function fetchWithCache<T>(cacheKey: string, fetcher: () => Promise<T>, ttlMs = CACHE_TTL_MS): Promise<T> {
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return cached.data as T;
  }
  const fresh = await fetcher();
  cache[cacheKey] = { data: fresh, timestamp: Date.now() };
  return fresh;
}

// Helper: safe fetch with timeout
async function fetchWithTimeout(url: string, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Cabala-Futbol-Argentino/1.0',
        'Accept': 'application/json',
      },
    });
    clearTimeout(id);
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status} from ${url}`);
    }
    return await response.json();
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// ----------------------------------------------------
// Normalizers: Transform Provider (ESPN arg.1) to Internal Clean Domain
// ----------------------------------------------------

function mapStatus(statusType: { name?: string; state?: string; completed?: boolean }): 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled' {
  const state = (statusType.state || '').toLowerCase();
  const name = (statusType.name || '').toLowerCase();

  if (state === 'in' || name === 'status_in_progress' || name === 'status_halftime') {
    return 'live';
  }
  if (state === 'post' || statusType.completed || name === 'status_final' || name === 'status_full_time') {
    return 'finished';
  }
  if (name.includes('postponed')) return 'postponed';
  if (name.includes('cancelled')) return 'cancelled';
  return 'scheduled';
}

function normalizeEspnTeam(teamData: any, zone?: 'A' | 'B') {
  const id = String(teamData.id || '');
  const name = teamData.displayName || teamData.name || 'Club';
  const shortName = teamData.shortDisplayName || teamData.name || name;
  const abbreviation = teamData.abbreviation || shortName.slice(0, 3).toUpperCase();
  const logo = teamData.logos?.[0]?.href || teamData.logo || '';
  const primaryColor = teamData.color ? `#${teamData.color}` : '#DCA842';
  const secondaryColor = teamData.alternateColor ? `#${teamData.alternateColor}` : '#181C22';

  return {
    id,
    name,
    shortName,
    code: abbreviation,
    city: teamData.location || 'Argentina',
    stadium: 'Estadio Oficial',
    founded: 1900,
    logo,
    primaryColor,
    secondaryColor,
    zone,
  };
}

function normalizeEspnMatch(event: any) {
  const competition = event.competitions?.[0] || {};
  const competitors = competition.competitors || [];
  const homeCompetitor = competitors.find((c: any) => c.homeAway === 'home') || competitors[0] || {};
  const awayCompetitor = competitors.find((c: any) => c.homeAway === 'away') || competitors[1] || {};

  const homeTeamRaw = homeCompetitor.team || {};
  const awayTeamRaw = awayCompetitor.team || {};

  const statusType = competition.status?.type || {};
  const status = mapStatus(statusType);
  const minute = competition.status?.displayClock
    ? parseInt(competition.status.displayClock.replace(/[^0-9]/g, ''), 10) || undefined
    : undefined;

  const dateObj = new Date(event.date || competition.date || Date.now());
  const dateStr = dateObj.toISOString().split('T')[0];
  const timeStr = dateObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });

  const homeScore = homeCompetitor.score !== undefined ? parseInt(homeCompetitor.score, 10) : null;
  const awayScore = awayCompetitor.score !== undefined ? parseInt(awayCompetitor.score, 10) : null;

  const venue = competition.venue?.fullName || 'Estadio por confirmar';
  const roundName = event.season?.type?.name || 'Fecha Oficial';

  return {
    id: String(event.id),
    homeTeamId: String(homeTeamRaw.id),
    awayTeamId: String(awayTeamRaw.id),
    homeTeam: normalizeEspnTeam(homeTeamRaw),
    awayTeam: normalizeEspnTeam(awayTeamRaw),
    homeScore: isNaN(homeScore as number) ? null : homeScore,
    awayScore: isNaN(awayScore as number) ? null : awayScore,
    status,
    minute,
    date: dateStr,
    time: timeStr,
    timestamp: dateObj.getTime(),
    tournament: 'Liga Profesional de Fútbol (AFA)',
    round: roundName,
    stadium: venue,
    referee: competition.officials?.[0]?.fullName || undefined,
  };
}

// ----------------------------------------------------
// API Routes
// ----------------------------------------------------

app.get('/api/football/provider-info', (req: Request, res: Response) => {
  res.json({
    provider: 'ESPN Soccer API (Feed Deportivo ARG.1)',
    status: 'connected',
    coverage: 'Liga Profesional de Fútbol Argentino',
    season: '2026',
    dataSource: 'ESPN',
    regulationsSource: 'AFA / Liga Profesional de Fútbol',
    features: {
      liveMatches: true,
      scoreboard: true,
      standings: true,
      teams: true,
      news: true,
      lineupsAndStats: true,
      promediosAFA: 'No reportado por la API de ESPN (mostrado como Datos no disponibles)',
    },
  });
});

// Matches list
app.get('/api/football/matches', async (req: Request, res: Response) => {
  try {
    const { date, status, teamId } = req.query;
    let url = 'https://site.api.espn.com/apis/site/v2/sports/soccer/arg.1/scoreboard';
    if (date && typeof date === 'string') {
      const cleanDate = date.replace(/-/g, '');
      url += `?dates=${cleanDate}`;
    }

    const data: any = await fetchWithCache(`espn_matches_${date || 'current'}`, () =>
      fetchWithTimeout(url, 8000)
    );

    const rawEvents = data.events || [];
    let matches = rawEvents.map(normalizeEspnMatch);

    // Apply query filters
    if (status && typeof status === 'string' && status !== 'all') {
      if (status === 'today') {
        const todayStr = new Date().toISOString().split('T')[0];
        matches = matches.filter((m: any) => m.date === todayStr || m.status === 'live');
      } else {
        matches = matches.filter((m: any) => m.status === status);
      }
    }

    if (teamId && typeof teamId === 'string') {
      matches = matches.filter((m: any) => m.homeTeamId === teamId || m.awayTeamId === teamId);
    }

    res.json(matches);
  } catch (error: any) {
    console.error('Error fetching matches from ESPN:', error.message);
    res.status(502).json({
      error: 'No se pudieron obtener los partidos desde el proveedor de datos (ESPN).',
      details: error.message,
    });
  }
});

// Single match detail with summary (stats and timeline)
app.get('/api/football/matches/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/arg.1/summary?event=${id}`;

    const data: any = await fetchWithCache(`espn_summary_${id}`, () =>
      fetchWithTimeout(url, 8000),
      15 * 1000 // 15 seconds for live summary
    );

    const header = data.header || {};
    const competition = header.competitions?.[0] || {};
    const competitors = competition.competitors || [];
    const homeCompetitor = competitors.find((c: any) => c.homeAway === 'home') || competitors[0] || {};
    const awayCompetitor = competitors.find((c: any) => c.homeAway === 'away') || competitors[1] || {};

    const homeTeamRaw = homeCompetitor.team || {};
    const awayTeamRaw = awayCompetitor.team || {};

    const statusType = competition.status?.type || {};
    const status = mapStatus(statusType);
    const minute = competition.status?.displayClock
      ? parseInt(competition.status.displayClock.replace(/[^0-9]/g, ''), 10) || undefined
      : undefined;

    const dateObj = new Date(competition.date || Date.now());
    const dateStr = dateObj.toISOString().split('T')[0];
    const timeStr = dateObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });

    // Events timeline
    const rawPlays = data.keyEvents || [];
    const events = rawPlays.map((p: any, idx: number) => {
      let type: 'goal' | 'yellow_card' | 'red_card' | 'sub' = 'goal';
      const text = (p.text || '').toLowerCase();
      if (text.includes('yellow card') || text.includes('tarjeta amarilla')) type = 'yellow_card';
      else if (text.includes('red card') || text.includes('tarjeta roja')) type = 'red_card';
      else if (text.includes('substitution') || text.includes('sustitución')) type = 'sub';

      return {
        id: `play_${idx}`,
        minute: p.clock?.displayValue ? parseInt(p.clock.displayValue, 10) || 0 : 0,
        teamId: String(p.team?.id || ''),
        type,
        player: p.text || 'Incidencia',
      };
    });

    // Boxscore stats
    let stats = undefined;
    const boxTeams = data.boxscore?.teams || [];
    if (boxTeams.length >= 2) {
      const homeStatsList = boxTeams[0].statistics || [];
      const awayStatsList = boxTeams[1].statistics || [];

      const getVal = (list: any[], name: string): number => {
        const item = list.find((s: any) => s.name === name);
        if (!item) return 0;
        return parseFloat(item.displayValue || '0') || 0;
      };

      stats = {
        possession: [getVal(homeStatsList, 'possessionPct') || 50, getVal(awayStatsList, 'possessionPct') || 50] as [number, number],
        shots: [getVal(homeStatsList, 'totalShots'), getVal(awayStatsList, 'totalShots')] as [number, number],
        shotsOnTarget: [getVal(homeStatsList, 'shotsOnTarget'), getVal(awayStatsList, 'shotsOnTarget')] as [number, number],
        corners: [getVal(homeStatsList, 'wonCorners'), getVal(awayStatsList, 'wonCorners')] as [number, number],
        fouls: [getVal(homeStatsList, 'foulsCommitted'), getVal(awayStatsList, 'foulsCommitted')] as [number, number],
        yellowCards: [getVal(homeStatsList, 'yellowCards'), getVal(awayStatsList, 'yellowCards')] as [number, number],
        redCards: [getVal(homeStatsList, 'redCards'), getVal(awayStatsList, 'redCards')] as [number, number],
        offsides: [getVal(homeStatsList, 'offsides'), getVal(awayStatsList, 'offsides')] as [number, number],
      };
    }

    const matchDetail = {
      id: String(id),
      homeTeamId: String(homeTeamRaw.id),
      awayTeamId: String(awayTeamRaw.id),
      homeTeam: normalizeEspnTeam(homeTeamRaw),
      awayTeam: normalizeEspnTeam(awayTeamRaw),
      homeScore: homeCompetitor.score !== undefined ? parseInt(homeCompetitor.score, 10) : null,
      awayScore: awayCompetitor.score !== undefined ? parseInt(awayCompetitor.score, 10) : null,
      status,
      minute,
      date: dateStr,
      time: timeStr,
      timestamp: dateObj.getTime(),
      tournament: 'Liga Profesional de Fútbol (AFA)',
      round: competition.round || 'Fecha Oficial',
      stadium: data.gameInfo?.venue?.fullName || 'Estadio Oficial',
      referee: data.gameInfo?.officials?.[0]?.displayName || undefined,
      events: events.length > 0 ? events : undefined,
      stats,
    };

    res.json(matchDetail);
  } catch (error: any) {
    console.error('Error fetching match detail:', error.message);
    res.status(502).json({
      error: 'No se pudieron obtener los datos de la ficha técnica desde el proveedor (ESPN).',
      details: error.message,
    });
  }
});

function parseChildEntries(child: any, zone: 'A' | 'B', phase: 'apertura' | 'clausura'): ZoneStanding[] {
  const entries = child?.standings?.entries || [];
  const getStat = (statsArr: any[], name: string): number => {
    const s = (statsArr || []).find((x: any) => x.name === name || x.type === name);
    return s?.value ?? 0;
  };

  const rawRows: StandingRow[] = entries.map((entry: any, index: number) => {
    const statsList = entry.stats || [];
    const played = getStat(statsList, 'gamesPlayed');
    const won = getStat(statsList, 'wins');
    const drawn = getStat(statsList, 'ties');
    const lost = getStat(statsList, 'losses');
    const goalsFor = getStat(statsList, 'pointsFor');
    const goalsAgainst = getStat(statsList, 'pointsAgainst');
    const goalDiff = getStat(statsList, 'pointDifferential');
    const points = getStat(statsList, 'points');
    const yellowCards = getStat(statsList, 'yellowCards');
    const redCards = getStat(statsList, 'redCards');
    const fairPlayPoints = yellowCards || redCards ? (yellowCards * -1) + (redCards * -5) : undefined;

    const team = normalizeEspnTeam(entry.team || {}, zone);

    return {
      position: index + 1,
      teamId: team.id,
      team,
      played,
      won,
      drawn,
      lost,
      goalsFor,
      goalsAgainst,
      goalDiff,
      points,
      zone,
      zonePosition: index + 1,
      phase,
      seasonYear: '2026',
      fairPlayPoints,
      form: [] as ('W' | 'D' | 'L')[],
    };
  });

  const resolved = resolveZoneTie(rawRows);
  return resolved.map((r, idx) => ({
    ...r,
    position: idx + 1,
    zonePosition: idx + 1,
    zone,
    phase,
    seasonYear: '2026',
    qualificationZone: idx < 8 ? ('playoffs' as const) : undefined,
    qualificationReason: idx < 8 ? `Clasificado a Octavos de Final (${idx + 1}° Zona ${zone})` : undefined,
  }));
}

// Standings
app.get('/api/football/standings', async (req: Request, res: Response) => {
  try {
    const { type = 'clausura', season = '2026' } = req.query;

    if (season !== '2026') {
      return res.status(400).json({
        error: `Temporada "${season}" no soportada. CÁBALA opera exclusivamente en la Temporada 2026.`,
        available: false,
        data: [],
      });
    }

    // Strict Rule: If table is promedios, we do not invent fictional rows
    if (type === 'promedios') {
      return res.json({
        type: 'promedios',
        season: '2026',
        available: false,
        message: 'La tabla de promedios (acumulada 3 temporadas) no está disponible en la API oficial de ESPN. En cumplimiento con la regla de CÁBALA, no se inventan datos.',
        data: [],
        dataState: 'EMPTY',
      });
    }

    const url = 'https://site.api.espn.com/apis/v2/sports/soccer/arg.1/standings';
    const rawData: any = await fetchWithCache('espn_standings', () =>
      fetchWithTimeout(url, 8000),
      3 * 60 * 1000 // 3 minutes cache
    );

    let childA: any = null;
    let childB: any = null;

    if (rawData.children && rawData.children.length >= 2) {
      childA = rawData.children.find((c: any) => c.name?.toLowerCase().includes('a')) || rawData.children[0];
      childB = rawData.children.find((c: any) => c.name?.toLowerCase().includes('b')) || rawData.children[1];
    } else if (rawData.children && rawData.children.length === 1) {
      childA = rawData.children[0];
    }

    const currentPhase = (type === 'apertura' ? 'apertura' : 'clausura') as 'apertura' | 'clausura';
    const zoneAStandings = childA ? parseChildEntries(childA, 'A', currentPhase) : [];
    const zoneBStandings = childB ? parseChildEntries(childB, 'B', currentPhase) : [];

    // Validar integridad estructural de zonas (exactamente 15 clubes cada una)
    const inconsistencies: DataInconsistencyRecord[] = [];
    if (zoneAStandings.length > 0) {
      inconsistencies.push(...validateZoneIntegrity(zoneAStandings, 'A'));
      inconsistencies.push(...validateStandingsIntegrity(zoneAStandings, 'ESPN Group A'));
    }
    if (zoneBStandings.length > 0) {
      inconsistencies.push(...validateZoneIntegrity(zoneBStandings, 'B'));
      inconsistencies.push(...validateStandingsIntegrity(zoneBStandings, 'ESPN Group B'));
    }

    const hasZoneCountError = (zoneAStandings.length > 0 && zoneAStandings.length !== 15) ||
                             (zoneBStandings.length > 0 && zoneBStandings.length !== 15);

    if (hasZoneCountError) {
      return res.status(502).json({
        type,
        phase: currentPhase,
        season: '2026',
        available: false,
        dataState: 'DATA_INCONSISTENCY',
        message: `Error de integridad reglamentaria: Se detectaron ${zoneAStandings.length} clubes en Zona A y ${zoneBStandings.length} en Zona B. El reglamento AFA exige exactamente 15 clubes por zona. No se exhibe una tabla distorsionada.`,
        inconsistencies,
        data: [],
      });
    }

    // Tabla Anual: All 30 clubs together
    if (type === 'anual') {
      const combinedAll30 = [...zoneAStandings, ...zoneBStandings];
      const annualStandings = getAnnualTable(combinedAll30, '2026');
      const annualMathInconsistencies = validateStandingsIntegrity(annualStandings, 'Tabla General Anual Acumulada');

      return res.json({
        type: 'anual',
        season: '2026',
        available: annualStandings.length > 0,
        dataState: annualMathInconsistencies.length > 0 ? 'DATA_INCONSISTENCY' : annualStandings.length > 0 ? 'SUCCESS' : 'EMPTY',
        inconsistencies: annualMathInconsistencies,
        data: annualStandings,
      });
    }

    // Apertura o Clausura: Separación obligatoria de Zona A y Zona B
    const requestedZone = (req.query.zone as string | undefined)?.toUpperCase();
    const dataState = inconsistencies.length > 0 ? 'DATA_INCONSISTENCY' : (zoneAStandings.length > 0 || zoneBStandings.length > 0) ? 'SUCCESS' : 'EMPTY';

    if (requestedZone === 'A') {
      return res.json({
        type,
        phase: currentPhase,
        zone: 'A',
        season: '2026',
        available: zoneAStandings.length > 0,
        dataState,
        inconsistencies,
        data: zoneAStandings,
        zoneA: zoneAStandings,
        zoneB: zoneBStandings,
      });
    }

    if (requestedZone === 'B') {
      return res.json({
        type,
        phase: currentPhase,
        zone: 'B',
        season: '2026',
        available: zoneBStandings.length > 0,
        dataState,
        inconsistencies,
        data: zoneBStandings,
        zoneA: zoneAStandings,
        zoneB: zoneBStandings,
      });
    }

    return res.json({
      type,
      phase: currentPhase,
      season: '2026',
      available: zoneAStandings.length > 0 || zoneBStandings.length > 0,
      dataState,
      inconsistencies,
      zoneA: zoneAStandings,
      zoneB: zoneBStandings,
      data: zoneAStandings,
    });
  } catch (error: any) {
    console.error('Error fetching standings:', error.message);
    res.status(502).json({
      error: 'No se pudieron obtener las tablas oficiales de posiciones.',
      available: false,
      dataState: 'ERROR',
      data: [],
    });
  }
});

// Zone standings endpoint: /api/football/standings/zone?phase=apertura&zone=A
app.get('/api/football/standings/zone', async (req: Request, res: Response) => {
  try {
    const rawPhase = ((req.query.phase as string) || 'clausura').toLowerCase();
    const phase = (rawPhase === 'apertura' ? 'apertura' : 'clausura') as 'apertura' | 'clausura';
    const rawZone = ((req.query.zone as string) || 'A').toUpperCase();
    if (rawZone !== 'A' && rawZone !== 'B') {
      return res.status(400).json({
        error: 'Zona inválida. Debe ser "A" o "B".',
        available: false,
        dataState: 'ERROR',
        data: [],
      });
    }
    const zone = rawZone as 'A' | 'B';
    const seasonYear = (req.query.season as string) || '2026';
    if (seasonYear !== '2026') {
      return res.status(400).json({
        error: 'Temporada no soportada. CÁBALA opera exclusivamente en la Temporada 2026.',
        available: false,
        dataState: 'ERROR',
        data: [],
      });
    }

    const url = 'https://site.api.espn.com/apis/v2/sports/soccer/arg.1/standings';
    const rawData: any = await fetchWithCache('espn_standings', () =>
      fetchWithTimeout(url, 8000),
      3 * 60 * 1000
    );

    let child = null;
    if (rawData.children && rawData.children.length >= 2) {
      child = zone === 'B'
        ? rawData.children.find((c: any) => c.name?.toLowerCase().includes('b')) || rawData.children[1]
        : rawData.children.find((c: any) => c.name?.toLowerCase().includes('a')) || rawData.children[0];
    } else if (rawData.children && rawData.children.length === 1) {
      child = rawData.children[0];
    }

    const zoneStandings = child ? parseChildEntries(child, zone, phase) : [];
    const inconsistencies: DataInconsistencyRecord[] = [];
    if (zoneStandings.length > 0) {
      inconsistencies.push(...validateZoneIntegrity(zoneStandings, zone));
      inconsistencies.push(...validateStandingsIntegrity(zoneStandings, `ESPN Group ${zone}`));
    }

    const hasZoneCountError = zoneStandings.length > 0 && zoneStandings.length !== 15;
    if (hasZoneCountError) {
      return res.status(502).json({
        seasonYear,
        phase,
        zone,
        available: false,
        dataState: 'DATA_INCONSISTENCY',
        message: `Error de integridad reglamentaria: Se detectaron ${zoneStandings.length} clubes en Zona ${zone} (deben ser 15).`,
        inconsistencies,
        data: [],
      });
    }

    res.json({
      seasonYear,
      phase,
      zone,
      available: zoneStandings.length > 0,
      dataState: inconsistencies.length > 0 ? 'DATA_INCONSISTENCY' : zoneStandings.length > 0 ? 'SUCCESS' : 'EMPTY',
      inconsistencies,
      data: zoneStandings,
    });
  } catch (error: any) {
    console.error('Error fetching zone standings:', error.message);
    res.status(502).json({
      error: 'No se pudo obtener la tabla de la zona.',
      available: false,
      dataState: 'ERROR',
      data: [],
    });
  }
});

// Annual table endpoint: /api/football/standings/annual?season=2026
app.get('/api/football/standings/annual', async (req: Request, res: Response) => {
  try {
    const seasonYear = (req.query.season as string) || '2026';
    if (seasonYear !== '2026') {
      return res.status(400).json({
        error: 'Temporada no soportada. CÁBALA opera exclusivamente en la Temporada 2026.',
        available: false,
        dataState: 'ERROR',
        data: [],
      });
    }

    const url = 'https://site.api.espn.com/apis/v2/sports/soccer/arg.1/standings';
    const rawData: any = await fetchWithCache('espn_standings', () =>
      fetchWithTimeout(url, 8000),
      3 * 60 * 1000
    );

    let childA = null;
    let childB = null;
    if (rawData.children && rawData.children.length >= 2) {
      childA = rawData.children.find((c: any) => c.name?.toLowerCase().includes('a')) || rawData.children[0];
      childB = rawData.children.find((c: any) => c.name?.toLowerCase().includes('b')) || rawData.children[1];
    }

    const zoneA = childA ? parseChildEntries(childA, 'A', 'clausura') : [];
    const zoneB = childB ? parseChildEntries(childB, 'B', 'clausura') : [];
    const annualTable = getAnnualTable([...zoneA, ...zoneB], seasonYear);
    const inconsistencies = validateStandingsIntegrity(annualTable, 'Tabla General Anual Acumulada');

    res.json({
      seasonYear,
      available: annualTable.length > 0,
      dataState: inconsistencies.length > 0 ? 'DATA_INCONSISTENCY' : annualTable.length > 0 ? 'SUCCESS' : 'EMPTY',
      inconsistencies,
      data: annualTable,
    });
  } catch (error: any) {
    console.error('Error fetching annual standings:', error.message);
    res.status(502).json({
      error: 'No se pudo obtener la tabla anual.',
      available: false,
      dataState: 'ERROR',
      data: [],
    });
  }
});

// Teams directory
app.get('/api/football/teams', async (req: Request, res: Response) => {
  try {
    const url = 'https://site.api.espn.com/apis/site/v2/sports/soccer/arg.1/teams';
    const data: any = await fetchWithCache('espn_teams', () =>
      fetchWithTimeout(url, 8000),
      10 * 60 * 1000 // 10 minutes cache
    );

    const rawTeams = data.sports?.[0]?.leagues?.[0]?.teams || [];
    const teams = rawTeams.map((item: any) => {
      const raw = item.team || {};
      const teamObj = normalizeEspnTeam(raw);
      return {
        ...teamObj,
        recentForm: [] as ('W' | 'D' | 'L')[],
      };
    });

    res.json(teams);
  } catch (error: any) {
    console.error('Error fetching teams:', error.message);
    res.status(502).json({
      error: 'No se pudo obtener el directorio de clubes.',
      details: error.message,
    });
  }
});

// News
app.get('/api/football/news', async (req: Request, res: Response) => {
  try {
    const url = 'https://site.api.espn.com/apis/site/v2/sports/soccer/arg.1/news';
    const data: any = await fetchWithCache('espn_news', () =>
      fetchWithTimeout(url, 8000),
      5 * 60 * 1000 // 5 minutes cache
    );

    const articles = (data.articles || []).map((art: any, idx: number) => ({
      id: String(art.id || `espn_art_${idx}`),
      title: art.headline || art.title || 'Actualidad del fútbol argentino',
      summary: art.description || '',
      author: art.byline || 'Crónica Deportiva',
      date: art.published ? new Date(art.published).toLocaleDateString('es-AR') : 'Reciente',
      readTime: '3 min lectura',
      tag: 'Primera División',
      imageUrl: art.images?.[0]?.url || undefined,
    }));

    res.json(articles);
  } catch (error: any) {
    console.error('Error fetching news:', error.message);
    res.status(502).json({
      error: 'No se pudieron cargar las noticias oficiales.',
      details: error.message,
    });
  }
});

// ----------------------------------------------------
// Setup Vite in development or serve static in production
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`CÁBALA Server running on http://${HOST}:${PORT}`);
  });
}

startServer();
