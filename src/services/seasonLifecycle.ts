import { Match, Team, StandingRow } from '../types/football';

export interface PlayoffMatchResult {
  round: 'roundOf16' | 'quarterFinals' | 'semiFinals' | 'final';
  roundName: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  winnerTeamName: string;
  date: string;
}

export interface PhaseStatus {
  phase: 'apertura' | 'clausura';
  isRegularFinished: boolean;
  totalRegularMatches: number;
  finishedRegularMatches: number;
  isPlayoffsFinished: boolean;
  totalPlayoffMatches: number;
  finishedPlayoffMatches: number;
  championTeam: Team | null;
  runnerUpTeam: Team | null;
  championName: string | null;
  statusText: string;
}

export interface SeasonLifecycleState {
  seasonYear: number;
  apertura: PhaseStatus;
  clausura: PhaseStatus;
  anual: {
    isFinished: boolean;
    totalMatches: number;
    finishedMatches: number;
    leagueChampion: Team | null;
    statusText: string;
  };
  copasNacionales: {
    trofeoDeCampeones: {
      team1: { name: string; criterion: string; confirmed: boolean; team: Team | null };
      team2: { name: string; criterion: string; confirmed: boolean; team: Team | null };
      venue: string;
      date: string;
      status: string;
    };
    supercopaArgentina: {
      team1: { name: string; criterion: string; confirmed: boolean; team: Team | null };
      team2: { name: string; criterion: string; confirmed: boolean; team: Team | null };
      venue: string;
      date: string;
      status: string;
    };
    supercopaInternacional: {
      team1: { name: string; criterion: string; confirmed: boolean; team: Team | null };
      team2: { name: string; criterion: string; confirmed: boolean; team: Team | null };
      venue: string;
      date: string;
      status: string;
    };
  };
  libertadoresArg1: {
    team: Team | null;
    name: string;
    reason: string;
    confirmed: boolean;
  };
}

/**
 * Motor Autónomo del Ciclo de Vida de Temporadas y Torneos CÁBALA
 *
 * Determina el estado de cada fase a partir de los partidos reales de la base de datos:
 * - Si un torneo concluyó (100% de partidos regulares y de playoffs finalizados), su campeón
 *   se extrae del partido de la Final oficial.
 * - Si un torneo está en juego, los playoffs no se juegan prematuramente y su campeón es "Por definir".
 * - Si cambia el año (ej. 2027), el sistema arranca automáticamente en 0 sin campeones prefijados.
 */
export class SeasonLifecycleEngine {
  /**
   * Evalúa el estado completo de la temporada a partir de la lista de partidos y equipos oficiales.
   */
  public evaluateSeason(matches: Match[], teams: Team[], currentYear: number = 2026): SeasonLifecycleState {
    const seasonMatches = matches.filter((m) => {
      if (m.date) {
        return m.date.startsWith(String(currentYear));
      }
      return true;
    });

    // ─────────────────────────────────────────────────────────────
    // 1. APERTURA
    // ─────────────────────────────────────────────────────────────
    const aperturaRegular = seasonMatches.filter(
      (m) => m.phase === 'apertura' && (!m.round || !m.round.includes('apertura---'))
    );
    const aperturaPlayoffs = seasonMatches.filter(
      (m) => m.phase === 'apertura' && m.round && m.round.includes('apertura---')
    );

    const apRegularTotal = aperturaRegular.length;
    const apRegularFinished = aperturaRegular.filter((m) => m.status === 'finished').length;
    const isApRegularFinished = apRegularTotal > 0 && apRegularFinished >= apRegularTotal;

    const apPlayoffsTotal = aperturaPlayoffs.length;
    const apPlayoffsFinished = aperturaPlayoffs.filter((m) => m.status === 'finished').length;
    const isApPlayoffsFinished = apPlayoffsTotal >= 15 && apPlayoffsFinished >= apPlayoffsTotal;

    // Buscar partido final del Apertura
    let aperturaChampion: Team | null = null;
    let aperturaRunnerUp: Team | null = null;

    if (isApPlayoffsFinished) {
      const finalMatch = aperturaPlayoffs.find((m) => m.round === 'apertura---final');
      if (finalMatch && finalMatch.status === 'finished' && finalMatch.homeScore !== null && finalMatch.awayScore !== null) {
        if (finalMatch.homeScore > finalMatch.awayScore) {
          aperturaChampion = teams.find((t) => t.id === finalMatch.homeTeamId) || (finalMatch.homeTeam as unknown as Team) || null;
          aperturaRunnerUp = teams.find((t) => t.id === finalMatch.awayTeamId) || (finalMatch.awayTeam as unknown as Team) || null;
        } else if (finalMatch.awayScore > finalMatch.homeScore) {
          aperturaChampion = teams.find((t) => t.id === finalMatch.awayTeamId) || (finalMatch.awayTeam as unknown as Team) || null;
          aperturaRunnerUp = teams.find((t) => t.id === finalMatch.homeTeamId) || (finalMatch.homeTeam as unknown as Team) || null;
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. CLAUSURA
    // ─────────────────────────────────────────────────────────────
    const clausuraRegular = seasonMatches.filter(
      (m) => m.phase === 'clausura' && (!m.round || !m.round.includes('clausura---'))
    );
    const clausuraPlayoffs = seasonMatches.filter(
      (m) => m.phase === 'clausura' && m.round && m.round.includes('clausura---')
    );

    const clRegularTotal = clausuraRegular.length;
    const clRegularFinished = clausuraRegular.filter((m) => m.status === 'finished').length;
    const isClRegularFinished = clRegularTotal > 0 && clRegularFinished >= clRegularTotal;

    const clPlayoffsTotal = clausuraPlayoffs.length;
    const clPlayoffsFinished = clausuraPlayoffs.filter((m) => m.status === 'finished').length;
    const isClPlayoffsFinished = clPlayoffsTotal >= 15 && clPlayoffsFinished >= clPlayoffsTotal;

    let clausuraChampion: Team | null = null;
    let clausuraRunnerUp: Team | null = null;

    if (isClPlayoffsFinished) {
      const finalMatch = clausuraPlayoffs.find((m) => m.round === 'clausura---final');
      if (finalMatch && finalMatch.status === 'finished' && finalMatch.homeScore !== null && finalMatch.awayScore !== null) {
        if (finalMatch.homeScore > finalMatch.awayScore) {
          clausuraChampion = teams.find((t) => t.id === finalMatch.homeTeamId) || (finalMatch.homeTeam as unknown as Team) || null;
          clausuraRunnerUp = teams.find((t) => t.id === finalMatch.awayTeamId) || (finalMatch.awayTeam as unknown as Team) || null;
        } else {
          clausuraChampion = teams.find((t) => t.id === finalMatch.awayTeamId) || (finalMatch.awayTeam as unknown as Team) || null;
          clausuraRunnerUp = teams.find((t) => t.id === finalMatch.homeTeamId) || (finalMatch.homeTeam as unknown as Team) || null;
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 3. TABLA GENERAL ANUAL (32 FECHAS REGULARES)
    // ─────────────────────────────────────────────────────────────
    const totalSeasonRegular = apRegularTotal + clRegularTotal;
    const totalSeasonFinished = apRegularFinished + clRegularFinished;
    const isAnualFinished = totalSeasonRegular > 0 && totalSeasonFinished >= totalSeasonRegular;

    // ─────────────────────────────────────────────────────────────
    // 4. COPAS NACIONALES CONECTADAS AL MOTOR
    // ─────────────────────────────────────────────────────────────
    const aperturaPhaseStatus: PhaseStatus = {
      phase: 'apertura',
      isRegularFinished: isApRegularFinished,
      totalRegularMatches: apRegularTotal,
      finishedRegularMatches: apRegularFinished,
      isPlayoffsFinished: isApPlayoffsFinished,
      totalPlayoffMatches: apPlayoffsTotal,
      finishedPlayoffMatches: apPlayoffsFinished,
      championTeam: aperturaChampion,
      runnerUpTeam: aperturaRunnerUp,
      championName: aperturaChampion ? aperturaChampion.name : null,
      statusText: isApPlayoffsFinished
        ? `Torneo Finalizado · Campeón: ${aperturaChampion?.name || 'Oficial'}`
        : 'En desarrollo',
    };

    const clausuraPhaseStatus: PhaseStatus = {
      phase: 'clausura',
      isRegularFinished: isClRegularFinished,
      totalRegularMatches: clRegularTotal,
      finishedRegularMatches: clRegularFinished,
      isPlayoffsFinished: isClPlayoffsFinished,
      totalPlayoffMatches: clPlayoffsTotal,
      finishedPlayoffMatches: clPlayoffsFinished,
      championTeam: clausuraChampion,
      runnerUpTeam: clausuraRunnerUp,
      championName: clausuraChampion ? clausuraChampion.name : null,
      statusText: isClPlayoffsFinished
        ? `Torneo Finalizado · Campeón: ${clausuraChampion?.name || 'Oficial'}`
        : isClRegularFinished
        ? 'Fase Regular Finalizada · Disputando Playoffs'
        : 'Torneo en disputa (Fase Regular en juego)',
    };

    return {
      seasonYear: currentYear,
      apertura: aperturaPhaseStatus,
      clausura: clausuraPhaseStatus,
      anual: {
        isFinished: isAnualFinished,
        totalMatches: totalSeasonRegular,
        finishedMatches: totalSeasonFinished,
        leagueChampion: null, // Solo cuando isAnualFinished sea true
        statusText: isAnualFinished ? 'Temporada Regular Concluida' : 'En disputa acumulada',
      },
      copasNacionales: {
        trofeoDeCampeones: {
          team1: {
            name: aperturaChampion ? aperturaChampion.name : 'Por definir',
            criterion: 'Campeón Torneo Apertura 2026',
            confirmed: !!aperturaChampion,
            team: aperturaChampion,
          },
          team2: {
            name: clausuraChampion ? clausuraChampion.name : 'Por definir',
            criterion: 'Campeón Torneo Clausura 2026',
            confirmed: !!clausuraChampion,
            team: clausuraChampion,
          },
          venue: 'Estadio Único Madre de Ciudades, Santiago del Estero',
          date: 'Diciembre 2026 · Final Oficial AFA',
          status: aperturaChampion && !clausuraChampion ? 'Esperando Campeón del Torneo Clausura' : 'Por definir',
        },
        supercopaArgentina: {
          team1: {
            name: isAnualFinished ? 'Campeón de Liga' : 'Por definir',
            criterion: 'Campeón de Liga (1° Tabla General Anual)',
            confirmed: isAnualFinished,
            team: null,
          },
          team2: {
            name: 'Por definir',
            criterion: 'Campeón Copa Argentina 2026',
            confirmed: false,
            team: null,
          },
          venue: 'Estadio Mario Alberto Kempes, Córdoba',
          date: 'Principios de 2027 · Sede Neutral',
          status: 'Por definir al cierre de la temporada',
        },
        supercopaInternacional: {
          team1: {
            name: aperturaChampion ? aperturaChampion.name : 'Por definir',
            criterion: 'Clasificado Trofeo de Campeones (Campeón de Liga)',
            confirmed: !!aperturaChampion,
            team: aperturaChampion,
          },
          team2: {
            name: 'Por definir',
            criterion: '1° Tabla General Anual 2026',
            confirmed: false,
            team: null,
          },
          venue: 'Estadio Hazza Bin Zayed, Abu Dhabi / Sede Internacional',
          date: 'Ventana Internacional 2027',
          status: 'Por definir al término de las 32 fechas anuales',
        },
      },
      libertadoresArg1: {
        team: aperturaChampion,
        name: aperturaChampion ? aperturaChampion.name : 'Por definir',
        reason: 'Campeón Torneo Apertura 2026 (Argentina 1 - Fase de Grupos)',
        confirmed: !!aperturaChampion,
      },
    };
  }
}

export const seasonLifecycle = new SeasonLifecycleEngine();
