import { StandingRow, HeadToHeadMatch, ZoneStanding, AnnualStanding, AverageStanding } from '../types/football';

/**
 * Interface representing a Competition RuleSet according to AFA / LPF Regulations.
 */
export interface CompetitionRuleSet {
  seasonYear: string;
  name: string;
  totalTeams: number;
  zonesCount: number;
  teamsPerZone: number;
  regularFixtureRounds: number; // 14 zonales + 1 clásicos + 1 interzonal adicional = 16
  interzonalRounds: number; // 2
  pointsForWin: number;
  pointsForDraw: number;
  pointsForLoss: number;
  playoffFormat: {
    qualifiersPerZone: number; // 8 equipos por zona (1° al 8°)
    rounds: ('roundOf16' | 'quarterFinals' | 'semiFinals' | 'final')[];
    homeAdvantageByBetterZonePosition: boolean; // Localía para 1°, 2°, 3°, 4° en octavos
    penaltyShootoutOnDrawInRegularRounds: boolean; // Octavos y Cuartos definen por penales en caso de empate
    extraTimeInFinal: boolean; // Final cuenta con tiempo suplementario previo a penales
    neutralVenueForFinal: boolean;
  };
  relegationFormat: {
    totalRelegations: number; // 2
    methods: ('annualTable' | 'promedios')[];
    annualTableSlots: number; // 1
    promediosSlots: number; // 1
    requiresTieBreakMatchOnEqualPoints: boolean; // Desempate en cancha neutral ante igualdad en el último puesto
    relegatedTeamsExcludedFromPlayoffs: boolean; // Exclusión de playoffs en Clausura para equipos descendidos o en desempate
    sameTeamLastInBothRule: string; // Si el mismo equipo es último en ambas, desciende por promedios y el 29° desciende por Anual
  };
  libertadoresPlazas: {
    totalPlazas: number; // 6
    criteria: string[];
  };
  sudamericanaPlazas: {
    totalPlazas: number; // 6
    criteria: string[];
  };
}

/**
 * Official RuleSet for Primera División AFA 2026
 */
export const RuleSet2026: CompetitionRuleSet = {
  seasonYear: '2026',
  name: 'Reglamento Torneos Primera División 2026 - LPF / AFA',
  totalTeams: 30,
  zonesCount: 2,
  teamsPerZone: 15,
  regularFixtureRounds: 16,
  interzonalRounds: 2,
  pointsForWin: 3,
  pointsForDraw: 1,
  pointsForLoss: 0,
  playoffFormat: {
    qualifiersPerZone: 8,
    rounds: ['roundOf16', 'quarterFinals', 'semiFinals', 'final'],
    homeAdvantageByBetterZonePosition: true,
    penaltyShootoutOnDrawInRegularRounds: true,
    extraTimeInFinal: true,
    neutralVenueForFinal: true,
  },
  relegationFormat: {
    totalRelegations: 2,
    methods: ['annualTable', 'promedios'],
    annualTableSlots: 1,
    promediosSlots: 1,
    requiresTieBreakMatchOnEqualPoints: true,
    relegatedTeamsExcludedFromPlayoffs: true,
    sameTeamLastInBothRule: 'El cupo de Tabla Anual pasa al siguiente peor ubicado (puesto 29)',
  },
  libertadoresPlazas: {
    totalPlazas: 6,
    criteria: [
      'Campeón Torneo Apertura 2026 (Argentina 1)',
      'Campeón Torneo Clausura 2026 (Argentina 2)',
      'Campeón Copa Argentina 2026 (Argentina 3)',
      '1° de la Tabla General Anual no clasificado previamente (Argentina 4)',
      '2° de la Tabla General Anual no clasificado previamente (Argentina 5)',
      '3° de la Tabla General Anual no clasificado previamente (Argentina 6)',
    ],
  },
  sudamericanaPlazas: {
    totalPlazas: 6,
    criteria: [
      'Siguientes 6 mejores ubicados en la Tabla General Anual 2026 (excluyendo clasificados a Libertadores y descendidos)',
    ],
  },
};

export interface TieBreakDetails {
  appliedCriterion: 'points' | 'goal_diff' | 'goals_for' | 'head_to_head' | 'fair_play' | 'lottery_pending';
  requiresLottery: boolean;
  notes: string;
}

export interface ResolvedStandingRow extends StandingRow {
  tieBreak?: TieBreakDetails;
}

export interface FairPlayDisciplinaryRecord {
  yellowCards: number; // Tarjetas amarillas simples (-1)
  secondYellowCards: number; // Expulsión por segunda amarilla (-3 adicionales)
  directRedCards: number; // Tarjeta roja directa (-5)
}

/**
 * Sistema oficial de cómputo de Fair Play (AFA / LPF):
 * - Tarjeta amarilla: -1 punto
 * - Segunda amarilla (expulsión por 2da amonestación): -3 puntos adicionales
 * - Tarjeta roja directa: -5 puntos
 * El equipo con mayor saldo (menos penalizaciones negativas acumuladas) se ubica por encima.
 */
export function calculateOfficialFairPlayPoints(record: FairPlayDisciplinaryRecord): number {
  return (record.yellowCards * -1) + (record.secondYellowCards * -3) + (record.directRedCards * -5);
}

export interface MiniTableStats {
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
}

function calculateSingleTeamMiniStats(
  teamId: string,
  groupTeamIds: string[],
  matches: HeadToHeadMatch[]
): MiniTableStats {
  let points = 0;
  let gf = 0;
  let ga = 0;

  const relevantMatches = matches.filter(
    (m) =>
      groupTeamIds.includes(m.homeTeamId) &&
      groupTeamIds.includes(m.awayTeamId) &&
      (m.homeTeamId === teamId || m.awayTeamId === teamId)
  );

  for (const m of relevantMatches) {
    const isHome = m.homeTeamId === teamId;
    const teamScore = isHome ? m.homeScore : m.awayScore;
    const oppScore = isHome ? m.awayScore : m.homeScore;

    gf += teamScore;
    ga += oppScore;

    if (teamScore > oppScore) points += 3;
    else if (teamScore === oppScore) points += 1;
  }

  return { points, goalsFor: gf, goalsAgainst: ga, goalDiff: gf - ga };
}

/**
 * Mini-tabla oficial exclusiva entre los equipos empatados (Head to Head).
 * Soporta firma unificada:
 * calculateMiniTableStats(teamIds, matches) -> Record<teamId, MiniTableStats>
 * calculateMiniTableStats(teamId, groupTeamIds, matches) -> MiniTableStats
 */
export function calculateMiniTableStats(
  teamIdsOrTeamId: string[] | string,
  matchesOrGroupTeamIds: HeadToHeadMatch[] | string[],
  maybeMatches?: HeadToHeadMatch[]
): any {
  if (Array.isArray(teamIdsOrTeamId)) {
    const teamIds = teamIdsOrTeamId;
    const matches = (matchesOrGroupTeamIds as HeadToHeadMatch[]) || [];
    const record: Record<string, MiniTableStats> = {};
    for (const tid of teamIds) {
      record[tid] = calculateSingleTeamMiniStats(tid, teamIds, matches);
    }
    return record;
  } else {
    const teamId = teamIdsOrTeamId;
    const groupTeamIds = matchesOrGroupTeamIds as string[];
    const matches = maybeMatches || [];
    return calculateSingleTeamMiniStats(teamId, groupTeamIds, matches);
  }
}

/**
 * Resuelve recursivamente un subgrupo de equipos empatados en puntos aplicando sucesivamente
 * la jerarquía reglamentaria oficial AFA / LPF 2026:
 * 1. Diferencia de gol general
 * 2. Goles a favor generales
 * 3. Mini-tabla de partidos entre sí (Puntos H2H, DG H2H, GF H2H)
 *    Si se separa un escalón, el procedimiento se repite recursivamente entre los que persistan empatados.
 * 4. Fair Play reglamentario (saldo: -1 amarilla, -3 adicional 2da amarilla, -5 roja directa)
 * 5. Sorteo oficial AFA (requiresLottery: true, appliedCriterion: 'lottery_pending', sin inventar ganador)
 */
function resolveSubGroupRecursive(
  subGroup: ResolvedStandingRow[],
  headToHeadMatches?: HeadToHeadMatch[]
): ResolvedStandingRow[] {
  if (subGroup.length <= 1) {
    if (subGroup.length === 1 && !subGroup[0].tieBreak) {
      subGroup[0].tieBreak = {
        appliedCriterion: 'points',
        requiresLottery: false,
        notes: 'Posición determinada reglamentariamente',
      };
    }
    return subGroup;
  }

  // Criterio 1: Diferencia de gol general
  const gdMap = new Map<number, ResolvedStandingRow[]>();
  for (const t of subGroup) {
    const list = gdMap.get(t.goalDiff) || [];
    list.push(t);
    gdMap.set(t.goalDiff, list);
  }
  if (gdMap.size > 1) {
    const sortedGds = Array.from(gdMap.keys()).sort((a, b) => b - a);
    const result: ResolvedStandingRow[] = [];
    for (const gd of sortedGds) {
      const cluster = gdMap.get(gd)!;
      for (const row of cluster) {
        row.tieBreak = {
          appliedCriterion: 'goal_diff',
          requiresLottery: false,
          notes: `Desempate por mayor diferencia de gol general (${row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff})`,
        };
      }
      result.push(...resolveSubGroupRecursive(cluster, headToHeadMatches));
    }
    return result;
  }

  // Criterio 2: Goles a favor general
  const gfMap = new Map<number, ResolvedStandingRow[]>();
  for (const t of subGroup) {
    const list = gfMap.get(t.goalsFor) || [];
    list.push(t);
    gfMap.set(t.goalsFor, list);
  }
  if (gfMap.size > 1) {
    const sortedGfs = Array.from(gfMap.keys()).sort((a, b) => b - a);
    const result: ResolvedStandingRow[] = [];
    for (const gf of sortedGfs) {
      const cluster = gfMap.get(gf)!;
      for (const row of cluster) {
        row.tieBreak = {
          appliedCriterion: 'goals_for',
          requiresLottery: false,
          notes: `Desempate por mayor cantidad de goles a favor general (${row.goalsFor} GF)`,
        };
      }
      result.push(...resolveSubGroupRecursive(cluster, headToHeadMatches));
    }
    return result;
  }

  // Criterio 3: Enfrentamientos directos (Head to Head) / Mini-tabla
  if (headToHeadMatches && headToHeadMatches.length > 0) {
    const groupIds = subGroup.map((t) => t.teamId);
    const miniStatsMap: Record<string, MiniTableStats> = calculateMiniTableStats(groupIds, headToHeadMatches);

    // 3a. Puntos en la mini-tabla
    const ptsH2HMap = new Map<number, ResolvedStandingRow[]>();
    for (const t of subGroup) {
      const pts = miniStatsMap[t.teamId]?.points ?? 0;
      const list = ptsH2HMap.get(pts) || [];
      list.push(t);
      ptsH2HMap.set(pts, list);
    }
    if (ptsH2HMap.size > 1) {
      const sortedH2hPts = Array.from(ptsH2HMap.keys()).sort((a, b) => b - a);
      const result: ResolvedStandingRow[] = [];
      for (const p of sortedH2hPts) {
        const cluster = ptsH2HMap.get(p)!;
        for (const row of cluster) {
          row.tieBreak = {
            appliedCriterion: 'head_to_head',
            requiresLottery: false,
            notes: `Desempate por partidos entre sí (${p} pts en enfrentamientos directos)`,
          };
        }
        result.push(...resolveSubGroupRecursive(cluster, headToHeadMatches));
      }
      return result;
    }

    // 3b. Diferencia de gol en la mini-tabla
    const gdH2HMap = new Map<number, ResolvedStandingRow[]>();
    for (const t of subGroup) {
      const gd = miniStatsMap[t.teamId]?.goalDiff ?? 0;
      const list = gdH2HMap.get(gd) || [];
      list.push(t);
      gdH2HMap.set(gd, list);
    }
    if (gdH2HMap.size > 1) {
      const sortedH2hGds = Array.from(gdH2HMap.keys()).sort((a, b) => b - a);
      const result: ResolvedStandingRow[] = [];
      for (const gd of sortedH2hGds) {
        const cluster = gdH2HMap.get(gd)!;
        for (const row of cluster) {
          row.tieBreak = {
            appliedCriterion: 'head_to_head',
            requiresLottery: false,
            notes: `Desempate por diferencia de gol en partidos entre sí (${gd > 0 ? `+${gd}` : gd} DG)`,
          };
        }
        result.push(...resolveSubGroupRecursive(cluster, headToHeadMatches));
      }
      return result;
    }

    // 3c. Goles a favor en la mini-tabla
    const gfH2HMap = new Map<number, ResolvedStandingRow[]>();
    for (const t of subGroup) {
      const gf = miniStatsMap[t.teamId]?.goalsFor ?? 0;
      const list = gfH2HMap.get(gf) || [];
      list.push(t);
      gfH2HMap.set(gf, list);
    }
    if (gfH2HMap.size > 1) {
      const sortedH2hGfs = Array.from(gfH2HMap.keys()).sort((a, b) => b - a);
      const result: ResolvedStandingRow[] = [];
      for (const gf of sortedH2hGfs) {
        const cluster = gfH2HMap.get(gf)!;
        for (const row of cluster) {
          row.tieBreak = {
            appliedCriterion: 'head_to_head',
            requiresLottery: false,
            notes: `Desempate por goles a favor en partidos entre sí (${gf} GF)`,
          };
        }
        result.push(...resolveSubGroupRecursive(cluster, headToHeadMatches));
      }
      return result;
    }
  }

  // Criterio 4: Fair Play reglamentario (mayor saldo de puntos disciplinarios)
  const fpMap = new Map<number, ResolvedStandingRow[]>();
  for (const t of subGroup) {
    const fp = t.fairPlayPoints ?? 0;
    const list = fpMap.get(fp) || [];
    list.push(t);
    fpMap.set(fp, list);
  }
  if (fpMap.size > 1) {
    const sortedFps = Array.from(fpMap.keys()).sort((a, b) => b - a); // Mayor saldo es mejor
    const result: ResolvedStandingRow[] = [];
    for (const fp of sortedFps) {
      const cluster = fpMap.get(fp)!;
      for (const row of cluster) {
        row.tieBreak = {
          appliedCriterion: 'fair_play',
          requiresLottery: false,
          notes: `Desempate por tabla de Fair Play disciplinario (${fp} pts de saldo)`,
        };
      }
      result.push(...resolveSubGroupRecursive(cluster, headToHeadMatches));
    }
    return result;
  }

  // Criterio 5: Sorteo Oficial AFA por persistencia de igualdad absoluta
  // NO se inventa ganador ni se ordena alfabéticamente
  for (const row of subGroup) {
    row.tieBreak = {
      appliedCriterion: 'lottery_pending',
      requiresLottery: true,
      notes: 'Igualdad absoluta en puntos, DG, GF, H2H y Fair Play. Requiere Sorteo Oficial de AFA.',
    };
  }
  return subGroup;
}

/**
 * Auditada y corregida según Reglamento Oficial AFA / LPF 2026:
 * Criterios de desempate en fase de zonas (Art. 11 / 12 LPF):
 * 1. Puntos
 * 2. Mayor diferencia de gol general (DG)
 * 3. Mayor cantidad de goles a favor general (GF)
 * 4. Enfrentamientos directos entre sí (Head to Head con mini-tabla oficial)
 * 5. Fair Play reglamentario (-1 amarilla, -3 adicional doble amarilla, -5 roja directa)
 * 6. Sorteo por el Comité Ejecutivo de AFA (sin inventar ganadores)
 */
export function resolveZoneTie(
  teams: StandingRow[],
  headToHeadMatches?: HeadToHeadMatch[]
): ResolvedStandingRow[] {
  if (!teams || teams.length === 0) return [];

  // Clonar para no mutar el original
  const result: ResolvedStandingRow[] = teams.map((t) => ({ ...t }));

  // Agrupar por puntos para aplicar desempates grupales rigurosos
  const pointsMap = new Map<number, ResolvedStandingRow[]>();
  for (const row of result) {
    const group = pointsMap.get(row.points) || [];
    group.push(row);
    pointsMap.set(row.points, group);
  }

  // Ordenar los bloques de puntos de mayor a menor
  const sortedPoints = Array.from(pointsMap.keys()).sort((a, b) => b - a);

  const finalSorted: ResolvedStandingRow[] = [];

  for (const pts of sortedPoints) {
    const tiedGroup = pointsMap.get(pts)!;

    if (tiedGroup.length === 1) {
      tiedGroup[0].tieBreak = {
        appliedCriterion: 'points',
        requiresLottery: false,
        notes: 'Desempate por mayor cantidad de puntos obtenidos',
      };
      finalSorted.push(tiedGroup[0]);
      continue;
    }

    // Resolver recursivamente el subgrupo empatado en puntos
    const resolvedGroup = resolveSubGroupRecursive(tiedGroup, headToHeadMatches);
    finalSorted.push(...resolvedGroup);
  }

  return finalSorted.map((row, idx) => ({
    ...row,
    position: idx + 1,
    zonePosition: idx + 1,
  }));
}

/**
 * Obtiene la clasificación oficial para una zona específica ('A' o 'B')
 * garantizando que NUNCA se mezclen las tablas de las dos zonas.
 */
export function getZoneStandings(
  allTeams: StandingRow[],
  seasonYear: string,
  phase: 'apertura' | 'clausura',
  zone: 'A' | 'B',
  headToHeadMatches?: HeadToHeadMatch[]
): ZoneStanding[] {
  const filtered = allTeams.filter((t) => (t.zone || t.team?.zone) === zone);
  const resolved = resolveZoneTie(filtered, headToHeadMatches);

  return resolved.map((row, idx) => ({
    position: idx + 1,
    teamId: row.teamId,
    team: row.team,
    played: row.played,
    won: row.won,
    drawn: row.drawn,
    lost: row.lost,
    goalsFor: row.goalsFor,
    goalsAgainst: row.goalsAgainst,
    goalDiff: row.goalDiff,
    points: row.points,
    zone,
    zonePosition: idx + 1,
    phase,
    seasonYear,
    form: row.form,
    fairPlayPoints: row.fairPlayPoints,
    tieBreak: row.tieBreak,
    qualificationZone: idx < 8 ? 'playoffs' : undefined,
    qualificationReason: idx < 8 ? `Clasificado a Octavos de Final (${idx + 1}° Zona ${zone})` : undefined,
  }));
}

/**
 * Validador matemático oficial de estadísticas de fútbol:
 * Detecta discrepancias en:
 * - PJ = PG + PE + PP
 * - DG = GF - GC
 * - PTS = PG * 3 + PE
 * NUNCA corrige silenciosamente; registra la inconsistencia con valores recibido y esperado.
 */
export function validateStandingsIntegrity(
  rows: StandingRow[],
  sourceLabel = 'ESPN Public Official ARG.1 Feed'
): import('../types/football').DataInconsistencyRecord[] {
  const inconsistencies: import('../types/football').DataInconsistencyRecord[] = [];

  for (const row of rows) {
    const club = row.team?.name || row.team?.shortName || `Club ${row.teamId}`;
    const pjExpected = row.won + row.drawn + row.lost;
    const dgExpected = row.goalsFor - row.goalsAgainst;
    const ptsExpected = row.won * 3 + row.drawn;

    if (row.played !== pjExpected) {
      inconsistencies.push({
        club,
        teamId: row.teamId,
        field: 'PJ (Partidos Jugados)',
        receivedValue: row.played,
        expectedValue: pjExpected,
        source: sourceLabel,
      });
    }

    if (row.goalDiff !== dgExpected) {
      inconsistencies.push({
        club,
        teamId: row.teamId,
        field: 'DG (Diferencia de Goles)',
        receivedValue: row.goalDiff,
        expectedValue: dgExpected,
        source: sourceLabel,
      });
    }

    if (row.points !== ptsExpected) {
      inconsistencies.push({
        club,
        teamId: row.teamId,
        field: 'PTS (Puntos Obtenidos)',
        receivedValue: row.points,
        expectedValue: ptsExpected,
        source: sourceLabel,
      });
    }
  }

  return inconsistencies;
}

/**
 * Valida la integridad estructural de la Zona oficial:
 * Zona A = 15 clubes estrictos
 * Zona B = 15 clubes estrictos
 * Nunca permite 14 o 16 clubes.
 */
export function validateZoneIntegrity(
  zoneRows: (StandingRow | ZoneStanding)[],
  zoneName: 'A' | 'B',
  sourceLabel = 'ESPN Public Official ARG.1 Feed'
): import('../types/football').DataInconsistencyRecord[] {
  const inconsistencies: import('../types/football').DataInconsistencyRecord[] = [];

  if (zoneRows.length !== 15) {
    inconsistencies.push({
      club: `Zona ${zoneName} (Nómina Completa)`,
      field: 'Cantidad de Clubes en Zona',
      receivedValue: zoneRows.length,
      expectedValue: 15,
      source: `${sourceLabel} / Reglamento LPF 2026 Art. 1`,
    });
  }

  return inconsistencies;
}

/**
 * Obtiene la Tabla General Anual acumulada (Apertura regular + Clausura regular).
 * Contiene exactamente los 30 clubes. Los playoffs NO suman puntos.
 * Consolida y acumula estadísticas de clubes si se suministran ambas fases.
 * El 1° clasificado es coronado Campeón de Liga 2026.
 */
export function getAnnualTable(
  annualRows: StandingRow[],
  seasonYear = '2026'
): AnnualStanding[] {
  // Consolidar por teamId para sumar Apertura + Clausura de cada club sin duplicados
  const teamMap = new Map<string, StandingRow>();

  for (const row of annualRows) {
    const existing = teamMap.get(row.teamId);
    if (!existing) {
      teamMap.set(row.teamId, {
        ...row,
        played: row.played,
        won: row.won,
        drawn: row.drawn,
        lost: row.lost,
        goalsFor: row.goalsFor,
        goalsAgainst: row.goalsAgainst,
        goalDiff: row.goalDiff,
        points: row.points,
        fairPlayPoints: row.fairPlayPoints ?? 0,
      });
    } else {
      existing.played += row.played;
      existing.won += row.won;
      existing.drawn += row.drawn;
      existing.lost += row.lost;
      existing.goalsFor += row.goalsFor;
      existing.goalsAgainst += row.goalsAgainst;
      existing.goalDiff = existing.goalsFor - existing.goalsAgainst;
      existing.points += row.points;
      existing.fairPlayPoints = (existing.fairPlayPoints ?? 0) + (row.fairPlayPoints ?? 0);
    }
  }

  const consolidated = Array.from(teamMap.values());

  const sorted = consolidated.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return (a.fairPlayPoints ?? 0) - (b.fairPlayPoints ?? 0);
  });

  return sorted.map((row, idx) => {
    const pos = idx + 1;
    let qualZone: 'campeon_liga' | 'libertadores' | 'sudamericana' | 'relegation' | undefined = undefined;
    let qualReason: string | undefined = undefined;

    if (pos === 1) {
      qualZone = 'campeon_liga';
      qualReason = 'Campeón de Liga Profesional 2026 (1° Tabla General Anual)';
    } else if (pos <= 4) {
      qualZone = 'libertadores';
      qualReason = `Zona Copa Libertadores 2027 (${pos}° Tabla General Anual)`;
    } else if (pos <= 10) {
      qualZone = 'sudamericana';
      qualReason = `Zona Copa Sudamericana 2027 (${pos}° Tabla General Anual)`;
    } else if (pos >= 29) {
      qualZone = 'relegation';
      qualReason = pos === 30 ? 'Descenso directo por Tabla Anual' : 'Zona comprometida de permanencia';
    }

    return {
      position: pos,
      teamId: row.teamId,
      team: row.team,
      played: row.played,
      won: row.won,
      drawn: row.drawn,
      lost: row.lost,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      goalDiff: row.goalDiff,
      points: row.points,
      seasonYear,
      form: row.form,
      qualificationZone: qualZone,
      qualificationReason: qualReason,
      isLeagueChampion: pos === 1,
    };
  });
}


// ----------------------------------------------------
// PLAYOFFS DE PRIMERA DIVISIÓN (Octavos a Final)
// ----------------------------------------------------

export interface PlayoffMatchup {
  id: string;
  roundName: 'Octavos de Final' | 'Cuartos de Final' | 'Semifinales' | 'Final';
  matchNumber: number;
  homeTeam: StandingRow;
  awayTeam: StandingRow;
  homeAdvantageTeamId: string;
  venueNote: string;
  tieBreakNote: string;
  isNeutralVenue: boolean;
}

export interface PlayoffMatchResult {
  matchupId: string;
  homeScore90: number;
  awayScore90: number;
  homeScoreET?: number; // Tiempo extra
  awayScoreET?: number;
  homeScorePenalties?: number; // Penales
  awayScorePenalties?: number;
  winnerTeamId: string;
  method: 'regular' | 'extra_time' | 'penalties';
}

/**
 * Filtra los equipos elegibles para disputar los Octavos de Final del Torneo Clausura.
 * Aplica la regla reglamentaria oficial: si un equipo está en zona de descenso directo
 * o debe disputar desempate por permanencia, queda inhabilitado y es reemplazado
 * por el siguiente equipo elegible de su MISMA zona (avanzando 8 -> 9 -> 10 -> 11...).
 */
export function getEligiblePlayoffTeams(
  zoneStandings: (ZoneStanding | StandingRow)[],
  relegationStatus: TeamRelegationEvaluation[] | string[] = []
): (ZoneStanding | StandingRow)[] {
  const ineligibleTeamIds = new Set<string>();

  if (Array.isArray(relegationStatus) && relegationStatus.length > 0) {
    if (typeof relegationStatus[0] === 'string') {
      (relegationStatus as string[]).forEach((id) => ineligibleTeamIds.add(id));
    } else {
      (relegationStatus as TeamRelegationEvaluation[]).forEach((evalItem) => {
        if (
          evalItem.status === 'DESCENSO_DIRECTO' ||
          evalItem.status === 'DESEMPATE' ||
          evalItem.requiresTiebreakMatch
        ) {
          ineligibleTeamIds.add(evalItem.teamId);
        }
      });
    }
  }

  const eligible = zoneStandings.filter((team) => !ineligibleTeamIds.has(team.teamId));
  return eligible.slice(0, 8);
}

/**
 * Cruces oficiales de Octavos de Final (LPF / AFA 2026):
 * 1A vs 8B
 * 1B vs 8A
 * 2A vs 7B
 * 2B vs 7A
 * 3A vs 6B
 * 3B vs 6A
 * 4A vs 5B
 * 4B vs 5A
 *
 * Localía: Para los 4 mejores de cada zona (1°, 2°, 3°, 4°).
 * Regla de Desempate: 90 minutos reglamentarios. Si hay empate, penales directos.
 *
 * REGLA ESPECIAL CLAUSURA:
 * Si un equipo finaliza entre los 8 clasificados de su zona pero está en zona de descenso
 * (Tabla Anual o Promedios) o en situación de desempate por descenso, queda inhabilitado.
 * Su plaza es ocupada por el siguiente clasificado elegible de su zona (9°, 10°, etc.).
 */
export function generateRoundOf16Matchups(
  zoneA: StandingRow[],
  zoneB: StandingRow[],
  options?: {
    isClausura?: boolean;
    relegatedOrTiebreakTeamIds?: string[];
  }
): PlayoffMatchup[] {
  const qualifiedA = options?.isClausura && options.relegatedOrTiebreakTeamIds
    ? (getEligiblePlayoffTeams(zoneA, options.relegatedOrTiebreakTeamIds) as StandingRow[])
    : zoneA.slice(0, 8);
  const qualifiedB = options?.isClausura && options.relegatedOrTiebreakTeamIds
    ? (getEligiblePlayoffTeams(zoneB, options.relegatedOrTiebreakTeamIds) as StandingRow[])
    : zoneB.slice(0, 8);

  const pairings = [
    { homeZone: 'A', homeIdx: 0, awayZone: 'B', awayIdx: 7, matchNum: 1 }, // 1A vs 8B
    { homeZone: 'B', homeIdx: 0, awayZone: 'A', awayIdx: 7, matchNum: 2 }, // 1B vs 8A
    { homeZone: 'A', homeIdx: 1, awayZone: 'B', awayIdx: 6, matchNum: 3 }, // 2A vs 7B
    { homeZone: 'B', homeIdx: 1, awayZone: 'A', awayIdx: 6, matchNum: 4 }, // 2B vs 7A
    { homeZone: 'A', homeIdx: 2, awayZone: 'B', awayIdx: 5, matchNum: 5 }, // 3A vs 6B
    { homeZone: 'B', homeIdx: 2, awayZone: 'A', awayIdx: 5, matchNum: 6 }, // 3B vs 6A
    { homeZone: 'A', homeIdx: 3, awayZone: 'B', awayIdx: 4, matchNum: 7 }, // 4A vs 5B
    { homeZone: 'B', homeIdx: 3, awayZone: 'A', awayIdx: 4, matchNum: 8 }, // 4B vs 5A
  ];

  return pairings.map((pair) => {
    const homeTeam = pair.homeZone === 'A' ? qualifiedA[pair.homeIdx] : qualifiedB[pair.homeIdx];
    const awayTeam = pair.awayZone === 'A' ? qualifiedA[pair.awayIdx] : qualifiedB[pair.awayIdx];

    return {
      id: `r16_${pair.matchNum}`,
      roundName: 'Octavos de Final',
      matchNumber: pair.matchNum,
      homeTeam,
      awayTeam,
      homeAdvantageTeamId: homeTeam.teamId,
      venueNote: `Estadio de ${homeTeam.team?.name || homeTeam.teamId} (Localía reglamentaria por mejor ubicación)`,
      tieBreakNote: 'Partido único (90 min). En caso de empate, definición directa por penales.',
      isNeutralVenue: false,
    };
  });
}

/**
 * Genera los cruces de Cuartos de Final según el cuadro oficial AFA:
 * QF 1: Ganador R16 #1 (1A/8B) vs Ganador R16 #8 (4B/5A)
 * QF 2: Ganador R16 #4 (2B/7A) vs Ganador R16 #5 (3A/6B)
 * QF 3: Ganador R16 #2 (1B/8A) vs Ganador R16 #7 (4A/5B)
 * QF 4: Ganador R16 #3 (2A/7B) vs Ganador R16 #6 (3B/6A)
 */
export function generateQuarterFinalMatchups(
  roundOf16Results: PlayoffMatchResult[],
  teamsMap: Map<string, StandingRow>
): PlayoffMatchup[] {
  const getWinner = (matchNum: number): StandingRow => {
    const matchRes = roundOf16Results.find((r) => r.matchupId === `r16_${matchNum}`);
    if (!matchRes) throw new Error(`Falta el resultado de Octavos # ${matchNum}`);
    const row = teamsMap.get(matchRes.winnerTeamId);
    if (!row) throw new Error(`Equipo ${matchRes.winnerTeamId} no encontrado`);
    return row;
  };

  const pairings = [
    { match1: 1, match2: 8, qfNum: 1 },
    { match1: 4, match2: 5, qfNum: 2 },
    { match1: 2, match2: 7, qfNum: 3 },
    { match1: 3, match2: 6, qfNum: 4 },
  ];

  return pairings.map((pair) => {
    const team1 = getWinner(pair.match1);
    const team2 = getWinner(pair.match2);

    // En cuartos, la localía la tiene el mejor ubicado en fase regular, o cancha neutral si aplica
    const team1Position = team1.position || 99;
    const team2Position = team2.position || 99;
    const homeTeam = team1Position <= team2Position ? team1 : team2;
    const awayTeam = team1Position <= team2Position ? team2 : team1;

    return {
      id: `qf_${pair.qfNum}`,
      roundName: 'Cuartos de Final',
      matchNumber: pair.qfNum,
      homeTeam,
      awayTeam,
      homeAdvantageTeamId: homeTeam.teamId,
      venueNote: `Estadio de ${homeTeam.team?.name || homeTeam.teamId} (o sede neutral designada por AFA)`,
      tieBreakNote: 'Partido único (90 min). En caso de empate, definición directa por penales.',
      isNeutralVenue: false,
    };
  });
}

/**
 * Genera Semifinales:
 * Semi 1: Ganador QF 1 vs Ganador QF 2
 * Semi 2: Ganador QF 3 vs Ganador QF 4
 */
export function generateSemiFinalMatchups(
  qfResults: PlayoffMatchResult[],
  teamsMap: Map<string, StandingRow>
): PlayoffMatchup[] {
  const getWinner = (qfNum: number): StandingRow => {
    const res = qfResults.find((r) => r.matchupId === `qf_${qfNum}`);
    if (!res) throw new Error(`Falta el resultado de Cuartos # ${qfNum}`);
    return teamsMap.get(res.winnerTeamId)!;
  };

  return [
    {
      id: 'sf_1',
      roundName: 'Semifinales',
      matchNumber: 1,
      homeTeam: getWinner(1),
      awayTeam: getWinner(2),
      homeAdvantageTeamId: getWinner(1).teamId,
      venueNote: 'Estadio Neutral designado por AFA / LPF',
      tieBreakNote: 'Partido único (90 min). En caso de empate, definición por penales.',
      isNeutralVenue: true,
    },
    {
      id: 'sf_2',
      roundName: 'Semifinales',
      matchNumber: 2,
      homeTeam: getWinner(3),
      awayTeam: getWinner(4),
      homeAdvantageTeamId: getWinner(3).teamId,
      venueNote: 'Estadio Neutral designado por AFA / LPF',
      tieBreakNote: 'Partido único (90 min). En caso de empate, definición por penales.',
      isNeutralVenue: true,
    },
  ];
}

/**
 * Genera la Gran Final en Estadio Neutral con Tiempo Suplementario y Penales
 */
export function generateFinalMatchup(
  sfResults: PlayoffMatchResult[],
  teamsMap: Map<string, StandingRow>
): PlayoffMatchup {
  const sf1Res = sfResults.find((r) => r.matchupId === 'sf_1');
  const sf2Res = sfResults.find((r) => r.matchupId === 'sf_2');
  if (!sf1Res || !sf2Res) throw new Error('Resultados incompletos de semifinales');

  const finalist1 = teamsMap.get(sf1Res.winnerTeamId)!;
  const finalist2 = teamsMap.get(sf2Res.winnerTeamId)!;

  return {
    id: 'final_1',
    roundName: 'Final',
    matchNumber: 1,
    homeTeam: finalist1,
    awayTeam: finalist2,
    homeAdvantageTeamId: finalist1.teamId,
    venueNote: 'Estadio Neutral (Sede Oficial Gran Final de la Liga Profesional)',
    tieBreakNote: 'Partido único: 90 minutos reglamentarios. Si persiste igualdad, tiempo suplementario (2 tiempos de 15 min). Si continúa empatado, penales.',
    isNeutralVenue: true,
  };
}

/**
 * Resuelve un partido eliminatorio aplicando el reglamento estricto
 */
export function resolvePlayoffMatch(
  matchup: PlayoffMatchup,
  homeScore90: number,
  awayScore90: number,
  overtimeScores?: { home: number; away: number },
  penaltyScores?: { home: number; away: number }
): PlayoffMatchResult {
  if (homeScore90 > awayScore90) {
    return {
      matchupId: matchup.id,
      homeScore90,
      awayScore90,
      winnerTeamId: matchup.homeTeam.teamId,
      method: 'regular',
    };
  }
  if (awayScore90 > homeScore90) {
    return {
      matchupId: matchup.id,
      homeScore90,
      awayScore90,
      winnerTeamId: matchup.awayTeam.teamId,
      method: 'regular',
    };
  }

  // Empate en 90 min:
  // Si es la Final, se juega tiempo suplementario
  if (matchup.roundName === 'Final') {
    if (!overtimeScores) {
      throw new Error('La Final requiere cómputo de tiempo suplementario antes de penales');
    }
    const totalHome = homeScore90 + overtimeScores.home;
    const totalAway = awayScore90 + overtimeScores.away;

    if (totalHome > totalAway) {
      return {
        matchupId: matchup.id,
        homeScore90,
        awayScore90,
        homeScoreET: overtimeScores.home,
        awayScoreET: overtimeScores.away,
        winnerTeamId: matchup.homeTeam.teamId,
        method: 'extra_time',
      };
    }
    if (totalAway > totalHome) {
      return {
        matchupId: matchup.id,
        homeScore90,
        awayScore90,
        homeScoreET: overtimeScores.home,
        awayScoreET: overtimeScores.away,
        winnerTeamId: matchup.awayTeam.teamId,
        method: 'extra_time',
      };
    }
  }

  // Definición por penales (Octavos, Cuartos, Semis, o Final tras alargue)
  if (!penaltyScores || penaltyScores.home === penaltyScores.away) {
    throw new Error('La definición por penales no puede terminar en empate');
  }

  return {
    matchupId: matchup.id,
    homeScore90,
    awayScore90,
    homeScoreET: overtimeScores?.home,
    awayScoreET: overtimeScores?.away,
    homeScorePenalties: penaltyScores.home,
    awayScorePenalties: penaltyScores.away,
    winnerTeamId: penaltyScores.home > penaltyScores.away ? matchup.homeTeam.teamId : matchup.awayTeam.teamId,
    method: 'penalties',
  };
}

// ----------------------------------------------------
// TABLA GENERAL ANUAL & CAMPEÓN DE LIGA
// ----------------------------------------------------

/**
 * Calcula la Tabla General Anual de acuerdo con el Reglamento Oficial AFA 2026:
 * - Suma de puntos, partidos jugados, victorias, empates, derrotas, GF, GC y DG
 *   exclusivamente de las FASES REGULARES del Torneo Apertura (16 fechas) y Torneo Clausura (16 fechas).
 * - TOTAL: 32 partidos por equipo.
 * - LOS PLAYOFFS NO SUMAN PUNTOS NI PARTIDOS A LA TABLA ANUAL.
 * - El 1° puesto se consagra CAMPEÓN DE LIGA.
 */
export function calculateAnnualTable(
  aperturaRegular: StandingRow[],
  clausuraRegular: StandingRow[],
  playoffMatchesDisputed: any[] = []
): { annualTable: StandingRow[]; leagueChampionId: string; leagueChampionTitle: string } {
  // Ignorar deliberadamente playoffMatchesDisputed para respetar la norma estricta
  void playoffMatchesDisputed;

  const teamMap = new Map<string, StandingRow>();

  const accumulate = (row: StandingRow) => {
    const existing = teamMap.get(row.teamId);
    if (!existing) {
      teamMap.set(row.teamId, {
        position: 0,
        teamId: row.teamId,
        team: row.team,
        played: row.played,
        won: row.won,
        drawn: row.drawn,
        lost: row.lost,
        goalsFor: row.goalsFor,
        goalsAgainst: row.goalsAgainst,
        goalDiff: row.goalDiff,
        points: row.points,
        fairPlayPoints: row.fairPlayPoints ?? 0,
      });
    } else {
      existing.played += row.played;
      existing.won += row.won;
      existing.drawn += row.drawn;
      existing.lost += row.lost;
      existing.goalsFor += row.goalsFor;
      existing.goalsAgainst += row.goalsAgainst;
      existing.goalDiff = existing.goalsFor - existing.goalsAgainst;
      existing.points += row.points;
      existing.fairPlayPoints = (existing.fairPlayPoints ?? 0) + (row.fairPlayPoints ?? 0);
    }
  };

  aperturaRegular.forEach(accumulate);
  clausuraRegular.forEach(accumulate);

  const annualRows = Array.from(teamMap.values());

  // Desempate en Tabla Anual según reglamento
  annualRows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return (a.fairPlayPoints ?? 0) - (b.fairPlayPoints ?? 0);
  });

  annualRows.forEach((r, idx) => {
    r.position = idx + 1;
  });

  const leagueChampion = annualRows[0];

  return {
    annualTable: annualRows,
    leagueChampionId: leagueChampion ? leagueChampion.teamId : '',
    leagueChampionTitle: 'Campeón de Liga Profesional 2026 (1° Tabla General Anual)',
  };
}

// ----------------------------------------------------
// DESCENSO: ESTADOS REGLAMENTARIOS Y EVALUACIÓN
// ----------------------------------------------------

export type RelegationStatus = 'DESCENSO_DIRECTO' | 'DESEMPATE' | 'EN_RIESGO' | 'SALVADO';

export interface TeamRelegationEvaluation {
  teamId: string;
  status: RelegationStatus;
  annualTablePosition: number;
  promediosPosition: number;
  relegationReason?: string;
  requiresTiebreakMatch: boolean;
  tiedTeamIdsWith?: string[];
  verificationStatus?: 'CERTIFICADA' | 'REQUIERE_VERIFICACIÓN_REGLAMENTARIA';
}

/**
 * Evalúa los descensos de acuerdo al reglamento oficial:
 * 1. Descenso por Tabla Anual: Último puesto (puesto 30)
 * 2. Descenso por Promedios: Último puesto (puesto 30)
 * 3. Si el mismo equipo queda último en ambas tablas:
 *    Desciende por Promedios, y el descenso de Tabla Anual pasa al siguiente peor ubicado (puesto 29).
 * 4. Si hay igualdad de puntos/promedio en el puesto de descenso:
 *    NO se define por diferencia de gol; requiere partido o torneo de desempate en cancha neutral ('DESEMPATE').
 * 5. Estados claramente diferenciados: DESCENSO_DIRECTO, DESEMPATE, EN_RIESGO, SALVADO.
 */
export function evaluateRelegation(
  annualTable: StandingRow[],
  promediosTable: { teamId: string; average: number; played: number; points: number }[],
  isSeasonFinished: boolean
): TeamRelegationEvaluation[] {
  const evaluations: TeamRelegationEvaluation[] = [];

  // Ordenar Tabla Anual (ascendente para ver los últimos primero)
  const sortedAnnualAsc = [...annualTable].sort((a, b) => a.points - b.points || a.goalDiff - b.goalDiff);
  // Ordenar Promedios (ascendente para ver los peores promedios)
  const sortedPromediosAsc = [...promediosTable].sort((a, b) => a.average - b.average || a.points - b.points);

  const worstAnnual = sortedAnnualAsc[0];
  const worstPromedio = sortedPromediosAsc[0];

  // Verificar empate en el último puesto de la Tabla Anual
  const tiedAnnualWorst = worstAnnual ? sortedAnnualAsc.filter((r) => r.points === worstAnnual.points) : [];
  // Verificar empate en el último puesto de Promedios
  const tiedPromediosWorst = worstPromedio ? sortedPromediosAsc.filter((r) => Math.abs(r.average - worstPromedio.average) < 0.0001) : [];

  const allTeamIds = Array.from(
    new Set([...annualTable.map((r) => r.teamId), ...promediosTable.map((p) => p.teamId)])
  );

  for (const teamId of allTeamIds) {
    const row = annualTable.find((r) => r.teamId === teamId);
    const annualPos = row ? row.position : 15;
    const promIndex = sortedPromediosAsc.findIndex((p) => p.teamId === teamId);
    const promPos = promIndex !== -1 ? 30 - promIndex : 15;

    let status: RelegationStatus = 'SALVADO';
    let reason: string | undefined = undefined;
    let requiresTiebreak = false;
    let tiedWith: string[] | undefined = undefined;

    const isWorstAnnual = worstAnnual && tiedAnnualWorst.some((t) => t.teamId === teamId);
    const isWorstPromedios = worstPromedio && tiedPromediosWorst.some((t) => t.teamId === teamId);

    let verificationStatus: 'CERTIFICADA' | 'REQUIERE_VERIFICACIÓN_REGLAMENTARIA' = 'CERTIFICADA';

    if (isSeasonFinished) {
      // Temporada finalizada
      if (tiedAnnualWorst.length > 1 && isWorstAnnual) {
        status = 'DESEMPATE';
        requiresTiebreak = true;
        tiedWith = tiedAnnualWorst.map((t) => t.teamId).filter((id) => id !== teamId);
        reason = 'Igualdad en el último puesto de la Tabla Anual. Disputa partido/triangular de desempate.';
      } else if (tiedPromediosWorst.length > 1 && isWorstPromedios) {
        status = 'DESEMPATE';
        requiresTiebreak = true;
        tiedWith = tiedPromediosWorst.map((t) => t.teamId).filter((id) => id !== teamId);
        reason = 'Igualdad en el último puesto de la Tabla de Promedios. Disputa partido/triangular de desempate.';
      } else if (worstAnnual && worstPromedio && worstAnnual.teamId === worstPromedio.teamId) {
        // Mismo equipo en ambas: regla de traslación
        verificationStatus = 'REQUIERE_VERIFICACIÓN_REGLAMENTARIA';
        if (teamId === worstAnnual.teamId) {
          status = 'DESCENSO_DIRECTO';
          reason = 'Último puesto en Promedios (Descenso Directo). Nota: La traslación del cupo anual requiere verificación reglamentaria oficial.';
        } else if (sortedAnnualAsc[1] && teamId === sortedAnnualAsc[1].teamId) {
          // El puesto 29 desciende por Tabla Anual (sujeto a circular reglamentaria AFA)
          status = 'DESCENSO_DIRECTO';
          reason = 'REQUIERE_VERIFICACIÓN_REGLAMENTARIA: Descenso por Tabla Anual (por presunta traslación al ser el mismo último en Promedios). Requiere circular AFA expresa.';
        }
      } else {
        if (worstAnnual && teamId === worstAnnual.teamId) {
          status = 'DESCENSO_DIRECTO';
          reason = 'Último puesto de la Tabla General Anual 2026.';
        } else if (worstPromedio && teamId === worstPromedio.teamId) {
          status = 'DESCENSO_DIRECTO';
          reason = 'Último puesto de la Tabla de Promedios 2026.';
        }
      }
    } else {
      // Temporada en curso
      if (annualPos >= 29 || promPos >= 29) {
        status = 'EN_RIESGO';
        reason = 'Ubicación actual en zona comprometida de descenso.';
      } else {
        status = 'SALVADO';
      }
    }

    evaluations.push({
      teamId,
      status,
      annualTablePosition: annualPos,
      promediosPosition: promPos,
      relegationReason: reason,
      requiresTiebreakMatch: requiresTiebreak,
      tiedTeamIdsWith: tiedWith,
      verificationStatus,
    });
  }

  return evaluations;
}

// ----------------------------------------------------
// CLASIFICACIÓN A COPAS: MATRIZ Y REASIGNACIÓN
// ----------------------------------------------------

export interface ContinentalPlace {
  placeNumber: number;
  competition: 'libertadores' | 'sudamericana';
  teamId: string;
  teamName: string;
  reason: string;
}

export interface ReallocationStep {
  step: number;
  description: string;
  vacatedByTeamId?: string;
  awardedToTeamId: string;
  ruleApplied: string;
}

export interface ContinentalMatrixAudit {
  scenarioName: string;
  originalSlots: { slot: string; teamId?: string; notes: string }[];
  duplicateOrIneligibleDetected: { teamId: string; reason: string }[];
  reallocationSteps: ReallocationStep[];
  finalLibertadores: ContinentalPlace[];
  finalSudamericana: ContinentalPlace[];
}

/**
 * Matriz determinista de clasificación y reasignación continental para Copa Libertadores y Sudamericana
 */
export function calculateContinentalPlacesWithAudit(
  annualTable: StandingRow[],
  champions: {
    aperturaChampionId?: string;
    clausuraChampionId?: string;
    copaArgentinaChampionId?: string;
  },
  relegatedOrIneligibleTeamIds: string[] = [],
  scenarioLabel = 'Escenario Oficial'
): ContinentalMatrixAudit {
  const audit: ContinentalMatrixAudit = {
    scenarioName: scenarioLabel,
    originalSlots: [],
    duplicateOrIneligibleDetected: [],
    reallocationSteps: [],
    finalLibertadores: [],
    finalSudamericana: [],
  };

  const getTeamName = (teamId: string) => {
    const row = annualTable.find((r) => r.teamId === teamId);
    return row?.team?.name || row?.team?.shortName || `Club ${teamId}`;
  };

  const assignedLibertadores = new Set<string>();
  let stepCount = 0;

  // 1. Plazas Originales teóricas
  audit.originalSlots.push({
    slot: 'Argentina 1 (Libertadores)',
    teamId: champions.aperturaChampionId,
    notes: 'Campeón Torneo Apertura 2026',
  });
  audit.originalSlots.push({
    slot: 'Argentina 2 (Libertadores)',
    teamId: champions.clausuraChampionId,
    notes: 'Campeón Torneo Clausura 2026',
  });
  audit.originalSlots.push({
    slot: 'Argentina 3 (Libertadores)',
    teamId: champions.copaArgentinaChampionId,
    notes: 'Campeón Copa Argentina 2026',
  });

  // Chequear inelegibles o descendidos
  const checkIneligible = (teamId?: string): boolean => {
    if (!teamId) return false;
    return relegatedOrIneligibleTeamIds.includes(teamId);
  };

  // Asignar Argentina 1
  if (champions.aperturaChampionId) {
    if (checkIneligible(champions.aperturaChampionId)) {
      audit.duplicateOrIneligibleDetected.push({
        teamId: champions.aperturaChampionId,
        reason: 'Campeón del Apertura está descendido o inhabilitado reglamentariamente.',
      });
    } else {
      assignedLibertadores.add(champions.aperturaChampionId);
      audit.finalLibertadores.push({
        placeNumber: 1,
        competition: 'libertadores',
        teamId: champions.aperturaChampionId,
        teamName: getTeamName(champions.aperturaChampionId),
        reason: 'Campeón Torneo Apertura 2026 (Argentina 1)',
      });
    }
  }

  // Asignar Argentina 2 (Clausura)
  if (champions.clausuraChampionId) {
    if (checkIneligible(champions.clausuraChampionId)) {
      audit.duplicateOrIneligibleDetected.push({
        teamId: champions.clausuraChampionId,
        reason: 'Campeón del Clausura está descendido o inhabilitado.',
      });
    } else if (assignedLibertadores.has(champions.clausuraChampionId)) {
      // BICAMPEÓN: Mismo equipo ganó Apertura y Clausura
      audit.duplicateOrIneligibleDetected.push({
        teamId: champions.clausuraChampionId,
        reason: 'Bicampeón Apertura y Clausura: plaza duplicada detectada.',
      });
    } else {
      assignedLibertadores.add(champions.clausuraChampionId);
      audit.finalLibertadores.push({
        placeNumber: audit.finalLibertadores.length + 1,
        competition: 'libertadores',
        teamId: champions.clausuraChampionId,
        teamName: getTeamName(champions.clausuraChampionId),
        reason: 'Campeón Torneo Clausura 2026 (Argentina 2)',
      });
    }
  }

  // Asignar Argentina 3 (Copa Argentina)
  if (champions.copaArgentinaChampionId) {
    if (checkIneligible(champions.copaArgentinaChampionId)) {
      audit.duplicateOrIneligibleDetected.push({
        teamId: champions.copaArgentinaChampionId,
        reason: 'Campeón de Copa Argentina está descendido o inhabilitado.',
      });
    } else if (assignedLibertadores.has(champions.copaArgentinaChampionId)) {
      audit.duplicateOrIneligibleDetected.push({
        teamId: champions.copaArgentinaChampionId,
        reason: 'Campeón de Copa Argentina ya clasificado a Libertadores por torneo de Liga.',
      });
    } else {
      assignedLibertadores.add(champions.copaArgentinaChampionId);
      audit.finalLibertadores.push({
        placeNumber: audit.finalLibertadores.length + 1,
        competition: 'libertadores',
        teamId: champions.copaArgentinaChampionId,
        teamName: getTeamName(champions.copaArgentinaChampionId),
        reason: 'Campeón Copa Argentina 2026 (Argentina 3)',
      });
    }
  }

  // Completar cupos de Libertadores (hasta 6) a través de la Tabla General Anual
  const sortedAnnual = [...annualTable].sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff);

  for (const row of sortedAnnual) {
    if (audit.finalLibertadores.length >= 6) break;

    if (!assignedLibertadores.has(row.teamId) && !checkIneligible(row.teamId)) {
      stepCount++;
      const slotNum = audit.finalLibertadores.length + 1;
      const isReallocated = slotNum <= 3; // Ocupó cupo vacante de campeón

      assignedLibertadores.add(row.teamId);
      audit.finalLibertadores.push({
        placeNumber: slotNum,
        competition: 'libertadores',
        teamId: row.teamId,
        teamName: getTeamName(row.teamId),
        reason: isReallocated
          ? `Cupo vacante reasignado a Tabla General Anual (${row.position}° puesto)`
          : `Clasificado por Tabla General Anual 2026 (Argentina ${slotNum})`,
      });

      if (isReallocated) {
        audit.reallocationSteps.push({
          step: stepCount,
          description: `Plaza Argentina ${slotNum} vacante reasignada al mejor de la Tabla Anual`,
          awardedToTeamId: row.teamId,
          ruleApplied: 'Reglamento LPF Art. Plazas Conmebol: reasignación directa a la Tabla Anual',
        });
      }
    }
  }

  // Asignar 6 plazas a Copa Sudamericana
  const excludedFromSudamericana = new Set<string>([
    ...Array.from(assignedLibertadores),
    ...relegatedOrIneligibleTeamIds,
  ]);

  for (const row of sortedAnnual) {
    if (audit.finalSudamericana.length >= 6) break;

    if (!excludedFromSudamericana.has(row.teamId)) {
      const slotNum = audit.finalSudamericana.length + 1;
      audit.finalSudamericana.push({
        placeNumber: slotNum,
        competition: 'sudamericana',
        teamId: row.teamId,
        teamName: getTeamName(row.teamId),
        reason: `Clasificado por Tabla General Anual 2026 (Argentina ${slotNum} Sudamericana | ${row.position}° puesto general)`,
      });
      excludedFromSudamericana.add(row.teamId);
    }
  }

  return audit;
}

/**
 * Retorna las 6 plazas a Copa Libertadores
 */
export function calculateLibertadoresPlaces(
  annualTable: StandingRow[],
  champions?: {
    aperturaChampionId?: string;
    clausuraChampionId?: string;
    copaArgentinaChampionId?: string;
  },
  relegatedTeamIds: string[] = []
): ContinentalPlace[] {
  const audit = calculateContinentalPlacesWithAudit(annualTable, champions || {}, relegatedTeamIds);
  return audit.finalLibertadores;
}

/**
 * Retorna las 6 plazas a Copa Sudamericana
 */
export function calculateSudamericanaPlaces(
  annualTable: StandingRow[],
  libertadoresPlazas: ContinentalPlace[] = [],
  relegatedTeamIds: string[] = []
): ContinentalPlace[] {
  const libIds = libertadoresPlazas.map((p) => p.teamId);
  const audit = calculateContinentalPlacesWithAudit(
    annualTable,
    {},
    [...relegatedTeamIds, ...libIds]
  );
  return audit.finalSudamericana;
}

/**
 * Asigna las 6 plazas a Copa Sudamericana tomando los clubes correspondientes de la Tabla Anual
 * después de excluir a los clasificados a Libertadores y a los clubes inelegibles (descendidos, etc.).
 */
export function getEligibleSudamericanaTeams(
  annualTable: (AnnualStanding | StandingRow)[],
  continentalAssignments: ContinentalPlace[],
  ineligibleTeamIds: string[] = []
): ContinentalPlace[] {
  const libertadoresTeamIds = new Set(
    continentalAssignments
      .filter((p) => p.competition === 'libertadores')
      .map((p) => p.teamId)
  );
  const excludedSet = new Set([...libertadoresTeamIds, ...ineligibleTeamIds]);

  const sortedAnnual = [...annualTable].sort(
    (a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor
  );
  const eligibleAnnual = sortedAnnual.filter((team) => !excludedSet.has(team.teamId));
  const sudamericanaTeams = eligibleAnnual.slice(0, 6);

  return sudamericanaTeams.map((team, idx) => ({
    placeNumber: idx + 1,
    competition: 'sudamericana' as const,
    teamId: team.teamId,
    teamName: team.team?.name || `Club ${team.teamId}`,
    reason: `Plaza Argentina ${idx + 1} Copa Sudamericana 2027 (${team.position}° de la Tabla Anual elegible)`,
  }));
}


// ----------------------------------------------------
// RECOPA DE CAMPEONES: ESTRUCTURA TRIANGULAR OFICIAL
// ----------------------------------------------------

export interface RecopaTriangularMatch {
  matchNumber: 1 | 2 | 3;
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  note: string;
}

export interface RecopaTriangularParticipant {
  teamId: string;
  qualificationTitle: string;
  isReplacement: boolean;
  replacesTeamId?: string;
}

export interface RecopaTriangularState {
  participants: RecopaTriangularParticipant[];
  schedule: RecopaTriangularMatch[];
  table: {
    teamId: string;
    points: number;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDiff: number;
  }[];
  championTeamId?: string;
}

/**
 * Recopa de Campeones - Estructura Oficial Triangular
 * Participantes reglamentarios:
 * 1. Ganador Copa Argentina
 * 2. Ganador Supercopa Argentina
 * 3. Ganador Supercopa Internacional
 *
 * Reemplazos reglamentarios ante duplicación:
 * Si un club gana más de uno de estos trofeos, su plaza en el triangular
 * es ocupada por el respectivo subcampeón / finalista.
 *
 * Secuencia de partidos:
 * Partido 1: Campeón Supercopa Arg vs Campeón Supercopa Int
 * Partido 2: Campeón Copa Argentina vs Perdedor de Partido 1
 * Partido 3: Campeón Copa Argentina vs Ganador de Partido 1
 */
export function setupRecopaTriangular(titles: {
  copaArgentina: { championId: string; runnerUpId: string };
  supercopaArgentina: { championId: string; runnerUpId: string };
  supercopaInternacional: { championId: string; runnerUpId: string };
}): RecopaTriangularState {
  const participants: RecopaTriangularParticipant[] = [];
  const takenTeamIds = new Set<string>();

  // Slot 1: Copa Argentina
  participants.push({
    teamId: titles.copaArgentina.championId,
    qualificationTitle: 'Campeón Copa Argentina',
    isReplacement: false,
  });
  takenTeamIds.add(titles.copaArgentina.championId);

  // Slot 2: Supercopa Argentina
  if (takenTeamIds.has(titles.supercopaArgentina.championId)) {
    // Reemplazo por el subcampeón
    participants.push({
      teamId: titles.supercopaArgentina.runnerUpId,
      qualificationTitle: 'Subcampeón Supercopa Argentina (por duplicación de campeón)',
      isReplacement: true,
      replacesTeamId: titles.supercopaArgentina.championId,
    });
    takenTeamIds.add(titles.supercopaArgentina.runnerUpId);
  } else {
    participants.push({
      teamId: titles.supercopaArgentina.championId,
      qualificationTitle: 'Campeón Supercopa Argentina',
      isReplacement: false,
    });
    takenTeamIds.add(titles.supercopaArgentina.championId);
  }

  // Slot 3: Supercopa Internacional
  if (takenTeamIds.has(titles.supercopaInternacional.championId)) {
    participants.push({
      teamId: titles.supercopaInternacional.runnerUpId,
      qualificationTitle: 'Subcampeón Supercopa Internacional (por duplicación de campeón)',
      isReplacement: true,
      replacesTeamId: titles.supercopaInternacional.championId,
    });
    takenTeamIds.add(titles.supercopaInternacional.runnerUpId);
  } else {
    participants.push({
      teamId: titles.supercopaInternacional.championId,
      qualificationTitle: 'Campeón Supercopa Internacional',
      isReplacement: false,
    });
    takenTeamIds.add(titles.supercopaInternacional.championId);
  }

  const teamCopa = participants[0].teamId;
  const teamSuperArg = participants[1].teamId;
  const teamSuperInt = participants[2].teamId;

  const schedule: RecopaTriangularMatch[] = [
    {
      matchNumber: 1,
      homeTeamId: teamSuperArg,
      awayTeamId: teamSuperInt,
      note: 'Partido 1: Ganador Supercopa Argentina vs Ganador Supercopa Internacional',
    },
    {
      matchNumber: 2,
      homeTeamId: teamCopa,
      awayTeamId: 'PERDEDOR_P1',
      note: 'Partido 2: Ganador Copa Argentina vs Perdedor Partido 1 (o empatante según sorteo)',
    },
    {
      matchNumber: 3,
      homeTeamId: teamCopa,
      awayTeamId: 'GANADOR_P1',
      note: 'Partido 3: Ganador Copa Argentina vs Ganador Partido 1',
    },
  ];

  const table = participants.map((p) => ({
    teamId: p.teamId,
    points: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDiff: 0,
  }));

  return {
    participants,
    schedule,
    table,
  };
}

/**
 * Simula y calcula la tabla del triangular de la Recopa de Campeones
 * Criterio reglamentario de desempate:
 * 1. Puntos
 * 2. Mayor diferencia de gol
 * 3. Mayor cantidad de goles a favor
 * 4. Menor cantidad de goles en contra
 * 5. Fair Play correspondiente
 * Nota: Penales de desempate de partido NO suman goles a la tabla del triangular.
 */
export function resolveRecopaTriangular(
  state: RecopaTriangularState,
  p1Result: { homeScore: number; awayScore: number },
  p2Result: { homeScore: number; awayScore: number },
  p3Result: { homeScore: number; awayScore: number },
  fairPlayScores?: Record<string, number>
): RecopaTriangularState {
  const newState: RecopaTriangularState = JSON.parse(JSON.stringify(state));

  const teamSuperArg = newState.participants[1].teamId;
  const teamSuperInt = newState.participants[2].teamId;
  const teamCopa = newState.participants[0].teamId;

  // Determinar perdedor y ganador de P1
  let p1Winner = teamSuperArg;
  let p1Loser = teamSuperInt;
  if (p1Result.awayScore > p1Result.homeScore) {
    p1Winner = teamSuperInt;
    p1Loser = teamSuperArg;
  }

  // Actualizar fixture con rivales definidos
  newState.schedule[0].homeScore = p1Result.homeScore;
  newState.schedule[0].awayScore = p1Result.awayScore;

  newState.schedule[1].awayTeamId = p1Loser;
  newState.schedule[1].homeScore = p2Result.homeScore;
  newState.schedule[1].awayScore = p2Result.awayScore;

  newState.schedule[2].awayTeamId = p1Winner;
  newState.schedule[2].homeScore = p3Result.homeScore;
  newState.schedule[2].awayScore = p3Result.awayScore;

  // Registrar estadísticas en la tabla
  const recordMatch = (homeId: string, awayId: string, hScore: number, aScore: number) => {
    const homeRow = newState.table.find((t) => t.teamId === homeId)!;
    const awayRow = newState.table.find((t) => t.teamId === awayId)!;

    homeRow.played++;
    awayRow.played++;
    homeRow.goalsFor += hScore;
    homeRow.goalsAgainst += aScore;
    homeRow.goalDiff = homeRow.goalsFor - homeRow.goalsAgainst;

    awayRow.goalsFor += aScore;
    awayRow.goalsAgainst += hScore;
    awayRow.goalDiff = awayRow.goalsFor - awayRow.goalsAgainst;

    if (hScore > aScore) {
      homeRow.won++;
      homeRow.points += 3;
      awayRow.lost++;
    } else if (aScore > hScore) {
      awayRow.won++;
      awayRow.points += 3;
      homeRow.lost++;
    } else {
      homeRow.drawn++;
      homeRow.points += 1;
      awayRow.drawn++;
      awayRow.points += 1;
    }
  };

  recordMatch(teamSuperArg, teamSuperInt, p1Result.homeScore, p1Result.awayScore);
  recordMatch(teamCopa, p1Loser, p2Result.homeScore, p2Result.awayScore);
  recordMatch(teamCopa, p1Winner, p3Result.homeScore, p3Result.awayScore);

  // 1. Puntos, 2. DG, 3. GF, 4. Menor GC, 5. Fair Play
  newState.table.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    if (a.goalsAgainst !== b.goalsAgainst) return a.goalsAgainst - b.goalsAgainst;
    if (fairPlayScores) {
      const fpA = fairPlayScores[a.teamId] ?? 0;
      const fpB = fairPlayScores[b.teamId] ?? 0;
      if (fpB !== fpA) return fpB - fpA;
    }
    return 0;
  });

  newState.championTeamId = newState.table[0].teamId;

  return newState;
}

export type { StandingRow } from '../types/football';

// ----------------------------------------------------
// CÁLCULO DETERMINISTA DE ESCENARIO DE CLASIFICACIÓN
// ----------------------------------------------------

export interface QualificationScenarioResult {
  teamId: string;
  teamName: string;
  zone: string;
  currentPosition: number;
  currentPoints: number;
  played: number;
  remainingRounds: number;
  maxPossiblePoints: number;
  status: 'CLINCHED' | 'ELIMINATED' | 'IN_CONTENTION';
  pointsNeededToClinch: number;
  eighthPlaceCurrentPoints: number;
  ninthPlaceMaxPoints: number;
  summaryExplanation: string;
}

/**
 * Calcula de forma 100% matemática y reglamentaria qué necesita un equipo para clasificar a Octavos.
 * NUNCA inventa números ni probabilidades ficticias.
 */
export function calculateQualificationScenario(
  zoneStandings: StandingRow[],
  targetTeamId: string,
  totalRegularRounds = 16
): QualificationScenarioResult {
  const team = zoneStandings.find(
    (t) => t.teamId === targetTeamId || t.team?.name?.toLowerCase().includes(targetTeamId.toLowerCase())
  );
  if (!team) {
    throw new Error(`Equipo "${targetTeamId}" no encontrado en la zona.`);
  }

  const played = team.played || 0;
  const remainingRounds = Math.max(0, totalRegularRounds - played);
  const maxPossiblePoints = team.points + remainingRounds * 3;

  // 8° lugar actual (último que clasifica)
  const eighth = zoneStandings[7] || zoneStandings[zoneStandings.length - 1];
  // 9° lugar actual (primer no clasificado)
  const ninth = zoneStandings[8];

  const eighthPoints = eighth ? eighth.points : 0;
  const ninthMaxPoints = ninth ? ninth.points + Math.max(0, totalRegularRounds - (ninth.played || 0)) * 3 : 0;

  let status: 'CLINCHED' | 'ELIMINATED' | 'IN_CONTENTION' = 'IN_CONTENTION';
  let pointsNeeded = 0;
  let explanation = '';

  if (team.points > ninthMaxPoints) {
    status = 'CLINCHED';
    pointsNeeded = 0;
    explanation = `${team.team?.name || team.teamId} está MATEMÁTICAMENTE CLASIFICADO a Octavos de Final. Sus ${team.points} puntos son inalcanzables para el 9° puesto (máximo posible: ${ninthMaxPoints} pts).`;
  } else if (maxPossiblePoints < eighthPoints) {
    status = 'ELIMINATED';
    pointsNeeded = -1;
    explanation = `${team.team?.name || team.teamId} está MATEMÁTICAMENTE ELIMINADO de la pelea por Octavos. Su techo matemático es de ${maxPossiblePoints} puntos, mientras que el 8° puesto ya cuenta con ${eighthPoints} pts.`;
  } else {
    status = 'IN_CONTENTION';
    pointsNeeded = Math.max(0, ninthMaxPoints + 1 - team.points);
    explanation = `Para asegurar la clasificación sin depender de otros resultados o desempates por diferencia de gol, ${team.team?.name || team.teamId} necesita sumar ${pointsNeeded} puntos de los ${remainingRounds * 3} puntos que restan en disputa (${remainingRounds} fechas pendientes). Techo matemático: ${maxPossiblePoints} pts.`;
  }

  return {
    teamId: team.teamId,
    teamName: team.team?.name || team.teamId,
    zone: team.team?.zone || 'Zona Oficial',
    currentPosition: team.position,
    currentPoints: team.points,
    played,
    remainingRounds,
    maxPossiblePoints,
    status,
    pointsNeededToClinch: pointsNeeded,
    eighthPlaceCurrentPoints: eighthPoints,
    ninthPlaceMaxPoints: ninthMaxPoints,
    summaryExplanation: explanation,
  };
}


