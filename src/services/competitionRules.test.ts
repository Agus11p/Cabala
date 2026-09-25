import { StandingRow, HeadToHeadMatch } from '../types/football';
import {
  resolveZoneTie,
  calculateOfficialFairPlayPoints,
  getEligiblePlayoffTeams,
  getEligibleSudamericanaTeams,
  calculateAnnualTable,
  generateRoundOf16Matchups,
  generateQuarterFinalMatchups,
  generateSemiFinalMatchups,
  generateFinalMatchup,
  resolvePlayoffMatch,
  calculateContinentalPlacesWithAudit,
  evaluateRelegation,
  setupRecopaTriangular,
  resolveRecopaTriangular,
  calculateQualificationScenario,
  RuleSet2026,
} from './competitionRules';

export interface TestReportItem {
  testName: string;
  category: string;
  passed: boolean;
  details: string;
}

export interface ComprehensiveAuditTestReport {
  allPassed: boolean;
  total: number;
  passedCount: number;
  failedCount: number;
  verifiedCount: number;
  pendingCount: number;
  results: TestReportItem[];
  verifiedResults: TestReportItem[];
  pendingVerificationResults: TestReportItem[];
}

/**
 * Suite Exhaustiva de Auditoría y Verificación de CÁBALA
 * Comprueba línea por línea las reglas de la Liga Profesional de Fútbol / AFA 2026.
 */
export function runComprehensiveCompetitionTests(): ComprehensiveAuditTestReport {
  const results: TestReportItem[] = [];

  // =========================================================================
  // 1. AUDITORÍA resolveZoneTie(): Desempates en Zonas
  // =========================================================================

  // Test 1.1: Desempate por Diferencia de Goles
  try {
    const teams: StandingRow[] = [
      { position: 1, teamId: 'A', played: 14, won: 7, drawn: 3, lost: 4, goalsFor: 18, goalsAgainst: 15, goalDiff: 3, points: 24 },
      { position: 2, teamId: 'B', played: 14, won: 7, drawn: 3, lost: 4, goalsFor: 20, goalsAgainst: 12, goalDiff: 8, points: 24 },
    ];
    const sorted = resolveZoneTie(teams);
    const passed = sorted[0].teamId === 'B' && sorted[0].tieBreak?.appliedCriterion === 'goal_diff';
    results.push({
      testName: 'resolveZoneTie: Mayor diferencia de goles general',
      category: 'Desempates de Zona',
      passed,
      details: passed ? 'B lidera (+8 DG vs +3 DG)' : 'Fallo en ordenamiento por DG',
    });
  } catch (e: any) {
    results.push({ testName: 'resolveZoneTie: Mayor diferencia de goles general', category: 'Desempates de Zona', passed: false, details: e.message });
  }

  // Test 1.2: Desempate por Goles a Favor (Mismos PTS y misma DG)
  try {
    const teams: StandingRow[] = [
      { position: 1, teamId: 'X', played: 14, won: 6, drawn: 4, lost: 4, goalsFor: 18, goalsAgainst: 14, goalDiff: 4, points: 22 },
      { position: 2, teamId: 'Y', played: 14, won: 6, drawn: 4, lost: 4, goalsFor: 22, goalsAgainst: 18, goalDiff: 4, points: 22 },
    ];
    const sorted = resolveZoneTie(teams);
    const passed = sorted[0].teamId === 'Y' && sorted[0].tieBreak?.appliedCriterion === 'goals_for';
    results.push({
      testName: 'resolveZoneTie: Mayor cantidad de goles a favor (mismos PTS y DG)',
      category: 'Desempates de Zona',
      passed,
      details: passed ? 'Y lidera (22 GF vs 18 GF)' : 'Fallo en ordenamiento por GF',
    });
  } catch (e: any) {
    results.push({ testName: 'resolveZoneTie: Goles a favor', category: 'Desempates de Zona', passed: false, details: e.message });
  }

  // Test 1.3: Desempate Head-to-Head entre 2 equipos (iguales PTS, DG y GF)
  try {
    const teams: StandingRow[] = [
      { position: 1, teamId: 'RACING', played: 14, won: 6, drawn: 3, lost: 5, goalsFor: 15, goalsAgainst: 12, goalDiff: 3, points: 21 },
      { position: 2, teamId: 'INDEPENDIENTE', played: 14, won: 6, drawn: 3, lost: 5, goalsFor: 15, goalsAgainst: 12, goalDiff: 3, points: 21 },
    ];
    const h2h: HeadToHeadMatch[] = [
      { homeTeamId: 'RACING', awayTeamId: 'INDEPENDIENTE', homeScore: 1, awayScore: 0 },
    ];
    const sorted = resolveZoneTie(teams, h2h);
    const passed = sorted[0].teamId === 'RACING' && sorted[0].tieBreak?.appliedCriterion === 'head_to_head';
    results.push({
      testName: 'resolveZoneTie: Head-to-Head directo entre 2 equipos',
      category: 'Desempates de Zona',
      passed,
      details: passed ? 'Racing lidera por victoria 1-0 en el cruce directo' : 'Fallo en H2H directo',
    });
  } catch (e: any) {
    results.push({ testName: 'resolveZoneTie: H2H 2 equipos', category: 'Desempates de Zona', passed: false, details: e.message });
  }

  // Test 1.4: Desempate Head-to-Head entre 3 equipos (Mini-tabla)
  try {
    const teams: StandingRow[] = [
      { position: 1, teamId: 'T1', played: 14, won: 6, drawn: 2, lost: 6, goalsFor: 14, goalsAgainst: 14, goalDiff: 0, points: 20 },
      { position: 2, teamId: 'T2', played: 14, won: 6, drawn: 2, lost: 6, goalsFor: 14, goalsAgainst: 14, goalDiff: 0, points: 20 },
      { position: 3, teamId: 'T3', played: 14, won: 6, drawn: 2, lost: 6, goalsFor: 14, goalsAgainst: 14, goalDiff: 0, points: 20 },
    ];
    // T1 le ganó a T2 (3 pts) y empató con T3 (1 pt) -> 4 pts en mini-tabla
    // T2 empató con T3 (1 pt) -> 1 pt
    // T3 empató con T1 y T2 -> 2 pts
    const h2h: HeadToHeadMatch[] = [
      { homeTeamId: 'T1', awayTeamId: 'T2', homeScore: 2, awayScore: 1 },
      { homeTeamId: 'T1', awayTeamId: 'T3', homeScore: 0, awayScore: 0 },
      { homeTeamId: 'T2', awayTeamId: 'T3', homeScore: 1, awayScore: 1 },
    ];
    const sorted = resolveZoneTie(teams, h2h);
    const passed = sorted[0].teamId === 'T1' && sorted[1].teamId === 'T3' && sorted[2].teamId === 'T2';
    results.push({
      testName: 'resolveZoneTie: Mini-tabla Head-to-Head entre 3 equipos empatados',
      category: 'Desempates de Zona',
      passed,
      details: passed ? 'Orden reglamentario exacto: T1 (4 pts) > T3 (2 pts) > T2 (1 pt)' : 'Fallo en mini-tabla',
    });
  } catch (e: any) {
    results.push({ testName: 'resolveZoneTie: H2H 3 equipos', category: 'Desempates de Zona', passed: false, details: e.message });
  }

  // Test 1.5: Desempate por Fair Play
  try {
    const teams: StandingRow[] = [
      { position: 1, teamId: 'CLUB_DISCIPLINADO', played: 14, won: 5, drawn: 5, lost: 4, goalsFor: 12, goalsAgainst: 12, goalDiff: 0, points: 20, fairPlayPoints: -12 },
      { position: 2, teamId: 'CLUB_INDISCIPLINADO', played: 14, won: 5, drawn: 5, lost: 4, goalsFor: 12, goalsAgainst: 12, goalDiff: 0, points: 20, fairPlayPoints: -28 },
    ];
    const sorted = resolveZoneTie(teams);
    const passed = sorted[0].teamId === 'CLUB_DISCIPLINADO' && sorted[0].tieBreak?.appliedCriterion === 'fair_play';
    results.push({
      testName: 'resolveZoneTie: Fair Play disciplinario (mayor saldo de puntos reglamentarios)',
      category: 'Desempates de Zona',
      passed,
      details: passed ? 'Prevalece el club con -12 pts de saldo vs -28 pts (-12 > -28)' : 'Fallo en Fair Play',
    });
  } catch (e: any) {
    results.push({ testName: 'resolveZoneTie: Fair Play', category: 'Desempates de Zona', passed: false, details: e.message });
  }

  // Test 1.5b: Valores reglamentarios exactos de Fair Play (amarilla: -1, 2da amarilla: -3 adicionales, roja directa: -5)
  try {
    const yellowOnly = calculateOfficialFairPlayPoints({ yellowCards: 1, secondYellowCards: 0, directRedCards: 0 });
    const secondYellow = calculateOfficialFairPlayPoints({ yellowCards: 1, secondYellowCards: 1, directRedCards: 0 });
    const directRed = calculateOfficialFairPlayPoints({ yellowCards: 0, secondYellowCards: 0, directRedCards: 1 });
    const combined = calculateOfficialFairPlayPoints({ yellowCards: 3, secondYellowCards: 1, directRedCards: 1 }); // -3 + -3 + -5 = -11

    const passed =
      yellowOnly === -1 &&
      secondYellow === -4 &&
      directRed === -5 &&
      combined === -11;

    results.push({
      testName: 'Fair Play: Puntuación reglamentaria (Amarilla -1, 2da Amarilla -3 adicionales, Roja Directa -5)',
      category: 'Desempates de Zona',
      passed,
      details: passed
        ? 'Valores reglamentarios exactos: 1A=-1, 2A=-4 (-1+-3), RD=-5, Combinada=-11'
        : `Fallo en cálculo: 1A=${yellowOnly}, 2A=${secondYellow}, RD=${directRed}, Comb=${combined}`,
    });
  } catch (e: any) {
    results.push({ testName: 'Fair Play: Puntuación reglamentaria', category: 'Desempates de Zona', passed: false, details: e.message });
  }

  // Test 1.6: Igualdad absoluta -> Sorteo de AFA (sin ganador aleatorio automático ni alfabético)
  try {
    const teams: StandingRow[] = [
      { position: 1, teamId: 'ZETA_FC', played: 14, won: 5, drawn: 5, lost: 4, goalsFor: 12, goalsAgainst: 12, goalDiff: 0, points: 20, fairPlayPoints: 10 },
      { position: 2, teamId: 'ALPHA_FC', played: 14, won: 5, drawn: 5, lost: 4, goalsFor: 12, goalsAgainst: 12, goalDiff: 0, points: 20, fairPlayPoints: 10 },
    ];
    const sorted = resolveZoneTie(teams);
    const passed = sorted[0].tieBreak?.appliedCriterion === 'lottery_pending' && sorted[0].tieBreak?.requiresLottery === true;
    results.push({
      testName: 'resolveZoneTie: Sorteo Oficial AFA explícito ante paridad absoluta (sin invención)',
      category: 'Desempates de Zona',
      passed,
      details: passed ? 'Estado lottery_pending establecido correctamente sin inventar ganador aleatorio' : 'Fallo en sorteo reglamentario',
    });
  } catch (e: any) {
    results.push({ testName: 'resolveZoneTie: Sorteo Oficial', category: 'Desempates de Zona', passed: false, details: e.message });
  }

  // =========================================================================
  // 2. AUDITORÍA PLAYOFFS: Cuadro Oficial de Octavos a Final
  // =========================================================================

  const mockZoneA: StandingRow[] = Array.from({ length: 15 }, (_, i) => ({
    position: i + 1,
    teamId: `A_${i + 1}`,
    team: { id: `A_${i + 1}`, name: `Club A${i + 1}`, zone: 'A' } as any,
    played: 16,
    won: 15 - i,
    drawn: 0,
    lost: i + 1,
    goalsFor: 30 - i,
    goalsAgainst: 10 + i,
    goalDiff: 20 - 2 * i,
    points: (15 - i) * 3,
  }));

  const mockZoneB: StandingRow[] = Array.from({ length: 15 }, (_, i) => ({
    position: i + 1,
    teamId: `B_${i + 1}`,
    team: { id: `B_${i + 1}`, name: `Club B${i + 1}`, zone: 'B' } as any,
    played: 16,
    won: 15 - i,
    drawn: 0,
    lost: i + 1,
    goalsFor: 30 - i,
    goalsAgainst: 10 + i,
    goalDiff: 20 - 2 * i,
    points: (15 - i) * 3,
  }));

  const allTeamsMap = new Map<string, StandingRow>();
  mockZoneA.forEach((t) => allTeamsMap.set(t.teamId, t));
  mockZoneB.forEach((t) => allTeamsMap.set(t.teamId, t));

  // Test 2.1: Cruces exactos de Octavos y Localía reglamentaria
  try {
    const octavos = generateRoundOf16Matchups(mockZoneA, mockZoneB);
    const expectedPairings = [
      { home: 'A_1', away: 'B_8' }, // 1A vs 8B
      { home: 'B_1', away: 'A_8' }, // 1B vs 8A
      { home: 'A_2', away: 'B_7' }, // 2A vs 7B
      { home: 'B_2', away: 'A_7' }, // 2B vs 7A
      { home: 'A_3', away: 'B_6' }, // 3A vs 6B
      { home: 'B_3', away: 'A_6' }, // 3B vs 6A
      { home: 'A_4', away: 'B_5' }, // 4A vs 5B
      { home: 'B_4', away: 'A_5' }, // 4B vs 5A
    ];

    const passed =
      octavos.length === 8 &&
      expectedPairings.every(
        (pair, idx) =>
          octavos[idx].homeTeam.teamId === pair.home &&
          octavos[idx].awayTeam.teamId === pair.away &&
          octavos[idx].homeAdvantageTeamId === pair.home
      );

    results.push({
      testName: 'Playoffs: Cruces reglamentarios de Octavos (1A vs 8B, 1B vs 8A, etc.) y localías',
      category: 'Playoffs',
      passed,
      details: passed ? 'Los 8 cruces y localías corresponden exactamente al reglamento AFA' : 'Cruces o localías incorrectas',
    });
  } catch (e: any) {
    results.push({ testName: 'Playoffs: Cruces de Octavos', category: 'Playoffs', passed: false, details: e.message });
  }

  // Test 2.2: Definición en Octavos (Regular, Empate y Penales)
  try {
    const octavos = generateRoundOf16Matchups(mockZoneA, mockZoneB);
    // Partido 1: Victoria en 90 min
    const res1 = resolvePlayoffMatch(octavos[0], 2, 0);
    // Partido 2: Empate 1-1 y definición por penales 4-3
    const res2 = resolvePlayoffMatch(octavos[1], 1, 1, undefined, { home: 4, away: 3 });

    const passed =
      res1.winnerTeamId === 'A_1' &&
      res1.method === 'regular' &&
      res2.winnerTeamId === 'B_1' &&
      res2.method === 'penalties';

    results.push({
      testName: 'Playoffs: Resolución en 90 min y penales en caso de empate',
      category: 'Playoffs',
      passed,
      details: passed ? 'Resolución 90m regular y penales verificada con éxito' : 'Fallo en resolución de partido',
    });
  } catch (e: any) {
    results.push({ testName: 'Playoffs: Resolución 90 min y penales', category: 'Playoffs', passed: false, details: e.message });
  }

  // Test 2.3: Alimentación completa a Cuartos, Semis y Final con alargue
  try {
    const octavos = generateRoundOf16Matchups(mockZoneA, mockZoneB);
    const r16Results = octavos.map((matchup) =>
      resolvePlayoffMatch(matchup, 1, 0) // Gana el local en todos los cruces
    );

    const qf = generateQuarterFinalMatchups(r16Results, allTeamsMap);
    const qfResults = qf.map((m) => resolvePlayoffMatch(m, 2, 1));

    const semis = generateSemiFinalMatchups(qfResults, allTeamsMap);
    const semiResults = semis.map((m) => resolvePlayoffMatch(m, 1, 0));

    const finalMatch = generateFinalMatchup(semiResults, allTeamsMap);
    // Final con empate 2-2 en los 90 min y definición en tiempo suplementario 1-0 (total 3-2)
    const finalResult = resolvePlayoffMatch(finalMatch, 2, 2, { home: 1, away: 0 });

    const passed =
      qf.length === 4 &&
      semis.length === 2 &&
      finalMatch.isNeutralVenue === true &&
      finalResult.method === 'extra_time' &&
      finalResult.winnerTeamId === finalMatch.homeTeam.teamId;

    results.push({
      testName: 'Playoffs: Progresión completa Cuartos -> Semifinales -> Final con alargue',
      category: 'Playoffs',
      passed,
      details: passed ? 'El cuadro eliminatorio alimenta fielmente cada instancia hasta el campeón' : 'Fallo en la progresión',
    });
  } catch (e: any) {
    results.push({ testName: 'Playoffs: Progresión completa', category: 'Playoffs', passed: false, details: e.message });
  }

  // =========================================================================
  // 3. REGLA ESPECIAL CLAUSURA Y DESCENSO
  // =========================================================================

  // Test 3.1: Equipo 8° afectado -> reemplazado por 9°
  try {
    const matchups = generateRoundOf16Matchups(mockZoneA, mockZoneB, {
      isClausura: true,
      relegatedOrTiebreakTeamIds: ['A_8'],
    });
    // En 1B vs 8A (matchup 2), el rival de B_1 debe ser A_9
    const passed = matchups[1].awayTeam.teamId === 'A_9';
    results.push({
      testName: 'Clausura Descenso: Equipo 8° en zona de descenso es reemplazado por el 9°',
      category: 'Clausura y Descenso',
      passed,
      details: passed ? 'A_8 excluido y reemplazado por A_9' : 'Fallo al reemplazar 8°',
    });
  } catch (e: any) {
    results.push({ testName: 'Clausura Descenso: Equipo 8° afectado', category: 'Clausura y Descenso', passed: false, details: e.message });
  }

  // Test 3.2: Equipo 7° afectado -> reemplazado por el siguiente elegible
  try {
    const matchups = generateRoundOf16Matchups(mockZoneA, mockZoneB, {
      isClausura: true,
      relegatedOrTiebreakTeamIds: ['A_7'],
    });
    // El puesto 7 de la zona A pasa a ser A_8, y el puesto 8 de la zona A pasa a ser A_9
    const passed = matchups[3].awayTeam.teamId === 'A_8' && matchups[1].awayTeam.teamId === 'A_9';
    results.push({
      testName: 'Clausura Descenso: Equipo 7° en descenso corre la lista al siguiente elegible',
      category: 'Clausura y Descenso',
      passed,
      details: passed ? 'A_7 excluido; entran A_8 y A_9 en los cruces respectivos' : 'Fallo en corrimiento de 7°',
    });
  } catch (e: any) {
    results.push({ testName: 'Clausura Descenso: Equipo 7° afectado', category: 'Clausura y Descenso', passed: false, details: e.message });
  }

  // Test 3.3: Múltiples equipos afectados y el 9° también está en descenso -> Salta al 10° y 11°
  try {
    const matchups = generateRoundOf16Matchups(mockZoneA, mockZoneB, {
      isClausura: true,
      relegatedOrTiebreakTeamIds: ['A_7', 'A_8', 'A_9'], // 7°, 8° y 9° comprometidos
    });
    // En la zona A deben clasificar A_1, A_2, A_3, A_4, A_5, A_6, A_10, A_11
    const passed = matchups[3].awayTeam.teamId === 'A_10' && matchups[1].awayTeam.teamId === 'A_11';
    results.push({
      testName: 'Clausura Descenso: Múltiples afectados con 9° también descendido (clasifican 10° y 11°)',
      category: 'Clausura y Descenso',
      passed,
      details: passed ? 'La regla no asume que entra el 9°; selecciona correctamente al 10° y 11°' : 'Fallo en filtro estricto',
    });
  } catch (e: any) {
    results.push({ testName: 'Clausura Descenso: Múltiples afectados', category: 'Clausura y Descenso', passed: false, details: e.message });
  }

  // Test 3.4: getEligiblePlayoffTeams - Comprobaciones unitarias de avance secuencial (8->9, 7->8->9, 8y9->10, varios consecutivos)
  try {
    // 8° inelegible
    const res8 = getEligiblePlayoffTeams(mockZoneA, ['A_8']);
    const pass8 = res8.length === 8 && res8[7].teamId === 'A_9';

    // 7° inelegible
    const res7 = getEligiblePlayoffTeams(mockZoneA, ['A_7']);
    const pass7 = res7.length === 8 && res7[6].teamId === 'A_8' && res7[7].teamId === 'A_9';

    // 8° y 9° inelegibles
    const res89 = getEligiblePlayoffTeams(mockZoneA, ['A_8', 'A_9']);
    const pass89 = res89.length === 8 && res89[7].teamId === 'A_10';

    // Varios consecutivos inelegibles: 6°, 7°, 8°, 9°
    const resConsec = getEligiblePlayoffTeams(mockZoneA, ['A_6', 'A_7', 'A_8', 'A_9']);
    const passConsec = resConsec.length === 8 && resConsec[5].teamId === 'A_10' && resConsec[6].teamId === 'A_11' && resConsec[7].teamId === 'A_12';

    const passed = pass8 && pass7 && pass89 && passConsec;
    results.push({
      testName: 'getEligiblePlayoffTeams: Avance secuencial reglamentario (8°, 7°, 8°+9° y varios consecutivos)',
      category: 'Clausura y Descenso',
      passed,
      details: passed
        ? 'Avanza correctamente 8->9, 7->8->9, 8y9->10 y múltiples consecutivos hasta cubrir los 8 cupos'
        : 'Fallo en función getEligiblePlayoffTeams',
    });
  } catch (e: any) {
    results.push({ testName: 'getEligiblePlayoffTeams: Avance secuencial', category: 'Clausura y Descenso', passed: false, details: e.message });
  }

  // =========================================================================
  // 4. TABLA GENERAL ANUAL & CAMPEÓN DE LIGA
  // =========================================================================

  // Test 4.1: Suma estricta de Apertura y Clausura (30 + 28 = 58 pts, 32 fechas)
  try {
    const aperturaRow: StandingRow = {
      position: 1,
      teamId: 'EQUIPO_X',
      played: 16,
      won: 9,
      drawn: 3,
      lost: 4,
      goalsFor: 25,
      goalsAgainst: 15,
      goalDiff: 10,
      points: 30,
    };
    const clausuraRow: StandingRow = {
      position: 2,
      teamId: 'EQUIPO_X',
      played: 16,
      won: 8,
      drawn: 4,
      lost: 4,
      goalsFor: 22,
      goalsAgainst: 14,
      goalDiff: 8,
      points: 28,
    };

    // Partidos de playoff disputados (4 partidos extras ganados)
    const playoffMatchesFicticios = [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }, { id: 'p4' }];

    const { annualTable, leagueChampionId } = calculateAnnualTable(
      [aperturaRow],
      [clausuraRow],
      playoffMatchesFicticios
    );

    const rowX = annualTable.find((t) => t.teamId === 'EQUIPO_X')!;
    const passed =
      rowX.points === 58 &&
      rowX.played === 32 &&
      rowX.goalDiff === 18 &&
      rowX.goalsFor === 47 &&
      leagueChampionId === 'EQUIPO_X';

    results.push({
      testName: 'Tabla Anual: 30 pts Apertura + 28 pts Clausura = 58 pts (Playoffs no suman)',
      category: 'Tabla Anual',
      passed,
      details: passed ? '58 pts y 32 PJ exactos. Los playoffs no alteraron la tabla anual.' : 'Fallo en cómputo de Tabla Anual',
    });
  } catch (e: any) {
    results.push({ testName: 'Tabla Anual: Cómputo exacto', category: 'Tabla Anual', passed: false, details: e.message });
  }

  // =========================================================================
  // 5. MATRIZ DE ESCENARIOS DE CLASIFICACIÓN A LIBERTADORES
  // =========================================================================

  const baseAnnualTable: StandingRow[] = Array.from({ length: 30 }, (_, i) => ({
    position: i + 1,
    teamId: `club_${i + 1}`,
    team: { id: `club_${i + 1}`, name: `Club ${i + 1}` } as any,
    played: 32,
    won: 28 - i,
    drawn: 2,
    lost: 2 + i,
    goalsFor: 50 - i,
    goalsAgainst: 20 + i,
    goalDiff: 30 - 2 * i,
    points: (28 - i) * 3 + 2,
  }));

  // Caso A: Tres campeones diferentes
  try {
    const auditA = calculateContinentalPlacesWithAudit(
      baseAnnualTable,
      { aperturaChampionId: 'club_1', clausuraChampionId: 'club_2', copaArgentinaChampionId: 'club_3' },
      [],
      'Caso A: Campeones Diferentes'
    );
    const libTeams = auditA.finalLibertadores.map((p) => p.teamId);
    const passed =
      auditA.finalLibertadores.length === 6 &&
      libTeams[0] === 'club_1' &&
      libTeams[1] === 'club_2' &&
      libTeams[2] === 'club_3' &&
      libTeams[3] === 'club_4'; // 4° de Anual completa

    results.push({
      testName: 'Libertadores Caso A: Campeones Apertura ≠ Clausura ≠ Copa Argentina',
      category: 'Copa Libertadores',
      passed,
      details: passed ? 'Asignación estándar de Arg 1, 2, 3 + 3 mejores de Tabla Anual' : 'Fallo en Caso A',
    });
  } catch (e: any) {
    results.push({ testName: 'Libertadores Caso A', category: 'Copa Libertadores', passed: false, details: e.message });
  }

  // Caso B: Mismo equipo gana Apertura y Clausura (Bicampeón)
  try {
    const auditB = calculateContinentalPlacesWithAudit(
      baseAnnualTable,
      { aperturaChampionId: 'club_1', clausuraChampionId: 'club_1', copaArgentinaChampionId: 'club_2' },
      [],
      'Caso B: Bicampeón'
    );
    const libTeams = auditB.finalLibertadores.map((p) => p.teamId);
    const countClub1 = libTeams.filter((id) => id === 'club_1').length;
    const passed =
      auditB.finalLibertadores.length === 6 &&
      countClub1 === 1 &&
      auditB.duplicateOrIneligibleDetected.some((d) => d.teamId === 'club_1') &&
      libTeams.includes('club_5'); // Cupo extra baja a club_5

    results.push({
      testName: 'Libertadores Caso B: Bicampeón Apertura + Clausura (reasignación a Tabla Anual)',
      category: 'Copa Libertadores',
      passed,
      details: passed ? 'Sin duplicación de plaza; vacante reasignada al siguiente mejor anual' : 'Fallo en Caso B',
    });
  } catch (e: any) {
    results.push({ testName: 'Libertadores Caso B', category: 'Copa Libertadores', passed: false, details: e.message });
  }

  // Caso C: Campeón Apertura también gana Copa Argentina
  try {
    const auditC = calculateContinentalPlacesWithAudit(
      baseAnnualTable,
      { aperturaChampionId: 'club_1', clausuraChampionId: 'club_2', copaArgentinaChampionId: 'club_1' },
      [],
      'Caso C: Campeón Apertura + Copa Argentina'
    );
    const libTeams = auditC.finalLibertadores.map((p) => p.teamId);
    const countClub1 = libTeams.filter((id) => id === 'club_1').length;
    const passed = auditC.finalLibertadores.length === 6 && countClub1 === 1;

    results.push({
      testName: 'Libertadores Caso C: Campeón Apertura gana también Copa Argentina',
      category: 'Copa Libertadores',
      passed,
      details: passed ? 'Reasignación inmediata de la plaza de Copa Argentina a la Tabla Anual' : 'Fallo en Caso C',
    });
  } catch (e: any) {
    results.push({ testName: 'Libertadores Caso C', category: 'Copa Libertadores', passed: false, details: e.message });
  }

  // Caso C2: Campeón Clausura también gana Copa Argentina
  try {
    const auditC2 = calculateContinentalPlacesWithAudit(
      baseAnnualTable,
      { aperturaChampionId: 'club_1', clausuraChampionId: 'club_2', copaArgentinaChampionId: 'club_2' },
      [],
      'Caso C2: Campeón Clausura + Copa Argentina'
    );
    const libTeams = auditC2.finalLibertadores.map((p) => p.teamId);
    const countClub2 = libTeams.filter((id) => id === 'club_2').length;
    const passed = auditC2.finalLibertadores.length === 6 && countClub2 === 1 && libTeams.includes('club_5');

    results.push({
      testName: 'Libertadores Caso C2: Campeón Clausura gana también Copa Argentina',
      category: 'Copa Libertadores',
      passed,
      details: passed ? 'Plaza de Copa Argentina reasignada a la Tabla Anual (ingresa club_5)' : 'Fallo en Caso C2',
    });
  } catch (e: any) {
    results.push({ testName: 'Libertadores Caso C2', category: 'Copa Libertadores', passed: false, details: e.message });
  }

  // Caso D: Campeón termina descendido
  try {
    const auditD = calculateContinentalPlacesWithAudit(
      baseAnnualTable,
      { aperturaChampionId: 'club_30', clausuraChampionId: 'club_1', copaArgentinaChampionId: 'club_2' },
      ['club_30'], // club_30 descendió
      'Caso D: Campeón Descendido'
    );
    const libTeams = auditD.finalLibertadores.map((p) => p.teamId);
    const passed = !libTeams.includes('club_30') && auditD.finalLibertadores.length === 6;

    results.push({
      testName: 'Libertadores Caso D: Campeón descendido queda inhabilitado de copas internacionales',
      category: 'Copa Libertadores',
      passed,
      details: passed ? 'club_30 excluido reglamentariamente; cupo reasignado por Tabla Anual' : 'Fallo en Caso D',
    });
  } catch (e: any) {
    results.push({ testName: 'Libertadores Caso D', category: 'Copa Libertadores', passed: false, details: e.message });
  }

  // =========================================================================
  // 6. COPA SUDAMERICANA: Siguientes 6 plazas sin duplicados ni descendidos
  // =========================================================================

  try {
    const auditSuda = calculateContinentalPlacesWithAudit(
      baseAnnualTable,
      { aperturaChampionId: 'club_1', clausuraChampionId: 'club_2', copaArgentinaChampionId: 'club_3' },
      ['club_7'] // club_7 está descendido por promedio
    );

    const sudaTeams = auditSuda.finalSudamericana.map((p) => p.teamId);
    const libTeams = auditSuda.finalLibertadores.map((p) => p.teamId);

    // Libertadores: club_1, 2, 3, 4, 5, 6
    // Sudamericana: debería tomar club_8, 9, 10, 11, 12, 13 (saltando club_7)
    const passed =
      auditSuda.finalSudamericana.length === 6 &&
      !sudaTeams.some((t) => libTeams.includes(t)) &&
      !sudaTeams.includes('club_7') &&
      sudaTeams[0] === 'club_8';

    results.push({
      testName: 'Sudamericana: 6 plazas siguientes en Tabla Anual excluyendo Libertadores y descendidos',
      category: 'Copa Sudamericana',
      passed,
      details: passed ? 'Asignadas plazas Sudamericana exactas saltando a club_7 descendido' : 'Fallo en Sudamericana',
    });
  } catch (e: any) {
    results.push({ testName: 'Sudamericana: Plazas', category: 'Copa Sudamericana', passed: false, details: e.message });
  }

  // Test 6.2: Función explícita getEligibleSudamericanaTeams
  try {
    const mockLibertadoresAssignments = [
      { placeNumber: 1, competition: 'libertadores' as const, teamId: 'club_1', teamName: 'Club 1', reason: 'Arg 1' },
      { placeNumber: 2, competition: 'libertadores' as const, teamId: 'club_2', teamName: 'Club 2', reason: 'Arg 2' },
      { placeNumber: 3, competition: 'libertadores' as const, teamId: 'club_3', teamName: 'Club 3', reason: 'Arg 3' },
      { placeNumber: 4, competition: 'libertadores' as const, teamId: 'club_4', teamName: 'Club 4', reason: 'Arg 4' },
      { placeNumber: 5, competition: 'libertadores' as const, teamId: 'club_5', teamName: 'Club 5', reason: 'Arg 5' },
      { placeNumber: 6, competition: 'libertadores' as const, teamId: 'club_6', teamName: 'Club 6', reason: 'Arg 6' },
    ];
    // Excluimos club_7 por estar descendido o inhabilitado
    const eligibleSuda = getEligibleSudamericanaTeams(baseAnnualTable, mockLibertadoresAssignments, ['club_7']);
    const ids = eligibleSuda.map((s) => s.teamId);

    const passed =
      eligibleSuda.length === 6 &&
      ids[0] === 'club_8' &&
      ids[1] === 'club_9' &&
      ids[2] === 'club_10' &&
      ids[3] === 'club_11' &&
      ids[4] === 'club_12' &&
      ids[5] === 'club_13' &&
      !ids.includes('club_7');

    results.push({
      testName: 'getEligibleSudamericanaTeams: Exclusión explícita de clasificados a Libertadores e inelegibles',
      category: 'Copa Sudamericana',
      passed,
      details: passed
        ? 'Función reglamentaria extrae exactamente los 6 clubes elegibles de Tabla Anual'
        : 'Fallo en función getEligibleSudamericanaTeams',
    });
  } catch (e: any) {
    results.push({ testName: 'getEligibleSudamericanaTeams: Exclusión explícita', category: 'Copa Sudamericana', passed: false, details: e.message });
  }

  // =========================================================================
  // 7. DESCENSO: Distinción estricta de Estados
  // =========================================================================

  // Test 7.1: Descenso directo (último en Anual y último en Promedios)
  try {
    const annualRows: StandingRow[] = [
      { position: 29, teamId: 'PENULTIMO_ANUAL', points: 30 } as any,
      { position: 30, teamId: 'ULTIMO_ANUAL', points: 25 } as any,
    ];
    const promRows = [
      { teamId: 'ULTIMO_PROMEDIO', average: 0.85, played: 90, points: 76 },
      { teamId: 'ULTIMO_ANUAL', average: 1.25, played: 90, points: 112 },
      { teamId: 'PENULTIMO_ANUAL', average: 1.30, played: 90, points: 117 },
    ];

    const evals = evaluateRelegation(annualRows, promRows, true);
    const evalAnual = evals.find((e) => e.teamId === 'ULTIMO_ANUAL');
    const evalProm = evals.find((e) => e.teamId === 'ULTIMO_PROMEDIO');

    const passed =
      evalAnual?.status === 'DESCENSO_DIRECTO' &&
      evalProm?.status === 'DESCENSO_DIRECTO';

    results.push({
      testName: 'Descenso: Dos descendidos diferentes por Anual y Promedios (DESCENSO_DIRECTO)',
      category: 'Descenso',
      passed,
      details: passed ? 'Estados de descenso directo determinados correctamente' : 'Fallo en estados de descenso',
    });
  } catch (e: any) {
    results.push({ testName: 'Descenso: Estados directos', category: 'Descenso', passed: false, details: e.message });
  }

  // Test 7.2: Mismo equipo último en ambas tablas -> desciende 29° por Tabla Anual
  try {
    const annualRows: StandingRow[] = [
      { position: 29, teamId: 'CLUB_29', points: 32 } as any,
      { position: 30, teamId: 'CLUB_DOBLE_ULTIMO', points: 20 } as any,
    ];
    const promRows = [
      { teamId: 'CLUB_DOBLE_ULTIMO', average: 0.75, played: 90, points: 67 },
      { teamId: 'CLUB_29', average: 1.15, played: 90, points: 103 },
    ];

    const evals = evaluateRelegation(annualRows, promRows, true);
    const eval29 = evals.find((e) => e.teamId === 'CLUB_29');
    const evalDoble = evals.find((e) => e.teamId === 'CLUB_DOBLE_ULTIMO');

    const passed =
      evalDoble?.status === 'DESCENSO_DIRECTO' &&
      eval29?.status === 'DESCENSO_DIRECTO' &&
      eval29?.verificationStatus === 'REQUIERE_VERIFICACIÓN_REGLAMENTARIA';

    results.push({
      testName: 'Descenso: Mismo equipo último en ambas traslada el cupo al puesto 29 de la Tabla Anual',
      category: 'Escenarios pendientes de verificación reglamentaria',
      passed,
      details: passed
        ? 'Comportamiento técnico validado: asigna DESCENSO_DIRECTO con verificationStatus="REQUIERE_VERIFICACIÓN_REGLAMENTARIA" (pendiente de circular expresa AFA)'
        : 'Fallo en verificación de regla pendiente',
    });
  } catch (e: any) {
    results.push({ testName: 'Descenso: Mismo equipo en ambas', category: 'Descenso', passed: false, details: e.message });
  }

  // Test 7.3: Empate en el último puesto -> Estado DESEMPATE
  try {
    const annualRows: StandingRow[] = [
      { position: 29, teamId: 'CLUB_TIE_1', points: 28, goalDiff: -5 } as any,
      { position: 30, teamId: 'CLUB_TIE_2', points: 28, goalDiff: -12 } as any,
    ];
    const promRows = [
      { teamId: 'OTRO_CLUB', average: 0.80, played: 90, points: 72 },
      { teamId: 'CLUB_TIE_1', average: 1.20, played: 90, points: 108 },
      { teamId: 'CLUB_TIE_2', average: 1.20, played: 90, points: 108 },
    ];

    const evals = evaluateRelegation(annualRows, promRows, true);
    const evalTie1 = evals.find((e) => e.teamId === 'CLUB_TIE_1');
    const evalTie2 = evals.find((e) => e.teamId === 'CLUB_TIE_2');

    const passed =
      evalTie1?.status === 'DESEMPATE' &&
      evalTie2?.status === 'DESEMPATE' &&
      evalTie1.requiresTiebreakMatch === true;

    results.push({
      testName: 'Descenso: Igualdad de puntos en último puesto establece DESEMPATE (no define DG)',
      category: 'Descenso',
      passed,
      details: passed ? 'Estado DESEMPATE asignado con requerimiento de partido de desempate' : 'Fallo en desempate por descenso',
    });
  } catch (e: any) {
    results.push({ testName: 'Descenso: Estado DESEMPATE', category: 'Descenso', passed: false, details: e.message });
  }

  // =========================================================================
  // 8. RECOPA DE CAMPEONES (Triangular Oficial)
  // =========================================================================

  // Test 8.1: Triangular con 3 equipos diferentes
  try {
    const state = setupRecopaTriangular({
      copaArgentina: { championId: 'BOCA', runnerUpId: 'TALLERES' },
      supercopaArgentina: { championId: 'RIVER', runnerUpId: 'RACING' },
      supercopaInternacional: { championId: 'ESTUDIANTES', runnerUpId: 'VELEZ' },
    });

    // P1: RIVER vs ESTUDIANTES -> 2-1 (Gana River)
    // P2: BOCA vs ESTUDIANTES (perdedor P1) -> 1-0 (Gana Boca)
    // P3: BOCA vs RIVER (ganador P1) -> 2-1 (Gana Boca)
    const resolved = resolveRecopaTriangular(
      state,
      { homeScore: 2, awayScore: 1 },
      { homeScore: 1, awayScore: 0 },
      { homeScore: 2, awayScore: 1 }
    );

    const passed =
      resolved.championTeamId === 'BOCA' &&
      resolved.table.find((t) => t.teamId === 'BOCA')?.points === 6;

    results.push({
      testName: 'Recopa de Campeones: Triangular de 3 clubes y coronación oficial',
      category: 'Recopa de Campeones',
      passed,
      details: passed ? 'Boca campeón con 6 puntos tras ganar sus 2 cotejos' : 'Fallo en triangular',
    });
  } catch (e: any) {
    results.push({ testName: 'Recopa de Campeones: 3 clubes', category: 'Recopa de Campeones', passed: false, details: e.message });
  }

  // Test 8.2: Triangular con campeón duplicado (Reemplazo por subcampeón)
  try {
    const state = setupRecopaTriangular({
      copaArgentina: { championId: 'RIVER', runnerUpId: 'TALLERES' },
      supercopaArgentina: { championId: 'RIVER', runnerUpId: 'RACING' }, // River duplicado
      supercopaInternacional: { championId: 'ESTUDIANTES', runnerUpId: 'VELEZ' },
    });

    const partIds = state.participants.map((p) => p.teamId);
    const passed =
      partIds.includes('RIVER') &&
      partIds.includes('RACING') && // Entra Racing en lugar de River
      partIds.includes('ESTUDIANTES') &&
      state.participants.find((p) => p.teamId === 'RACING')?.isReplacement === true;

    results.push({
      testName: 'Recopa de Campeones: Reemplazo reglamentario por subcampeón ante títulos múltiples',
      category: 'Recopa de Campeones',
      passed,
      details: passed ? 'Racing ingresa como subcampeón de Supercopa Argentina' : 'Fallo en reemplazo de Recopa',
    });
  } catch (e: any) {
    results.push({ testName: 'Recopa de Campeones: Reemplazo subcampeón', category: 'Recopa de Campeones', passed: false, details: e.message });
  }

  // =========================================================================
  // 9. CÁLCULO DETERMINISTA DE CLASIFICACIÓN (calculateQualificationScenario)
  // =========================================================================

  try {
    const scenarioTable: StandingRow[] = [
      { position: 1, teamId: 'PUNTERO', played: 14, points: 34 } as any,
      { position: 2, teamId: 'SEGUNDO', played: 14, points: 30 } as any,
      { position: 3, teamId: 'TERCERO', played: 14, points: 28 } as any,
      { position: 4, teamId: 'CUARTO', played: 14, points: 26 } as any,
      { position: 5, teamId: 'QUINTO', played: 14, points: 24 } as any,
      { position: 6, teamId: 'SEXTO', played: 14, points: 22 } as any,
      { position: 7, teamId: 'SEPTIMO', played: 14, points: 20 } as any,
      { position: 8, teamId: 'OCTAVO', played: 14, points: 19 } as any,
      { position: 9, teamId: 'NOVENO', played: 14, points: 16 } as any,
      { position: 15, teamId: 'ULTIMO', played: 14, points: 8 } as any,
    ];

    // Noveno tiene 16 pts y le quedan 2 fechas -> Techo máximo: 22 pts
    // Puntero tiene 34 pts -> Ya clasificado (CLINCHED)
    // Ultimo tiene 8 pts y le quedan 2 fechas -> Techo máximo: 14 pts < 19 pts del 8° -> Eliminado (ELIMINATED)
    // Sexto tiene 22 pts -> En carrera (IN_CONTENTION)
    const clincher = calculateQualificationScenario(scenarioTable, 'PUNTERO', 16);
    const eliminated = calculateQualificationScenario(scenarioTable, 'ULTIMO', 16);
    const contender = calculateQualificationScenario(scenarioTable, 'SEXTO', 16);

    const passed =
      clincher.status === 'CLINCHED' &&
      eliminated.status === 'ELIMINATED' &&
      contender.status === 'IN_CONTENTION' &&
      contender.pointsNeededToClinch === 1; // 22 + 1 - 22 = 1 pt

    results.push({
      testName: 'IA Grounding: Cálculo determinista de clasificación matemática (CLINCHED / ELIMINATED / IN_CONTENTION)',
      category: 'Herramientas de IA',
      passed,
      details: passed ? 'Estados y puntos necesarios calculados con precisión matemática exacta' : 'Fallo en cálculo de clasificación',
    });
  } catch (e: any) {
    results.push({ testName: 'IA Grounding: Cálculo de clasificación', category: 'Herramientas de IA', passed: false, details: e.message });
  }

  const pendingCategory = 'Escenarios pendientes de verificación reglamentaria';
  const verifiedResults = results.filter((r) => r.category !== pendingCategory);
  const pendingVerificationResults = results.filter((r) => r.category === pendingCategory);

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    allPassed: failedCount === 0,
    total: results.length,
    passedCount,
    failedCount,
    verifiedCount: verifiedResults.filter((r) => r.passed).length,
    pendingCount: pendingVerificationResults.filter((r) => r.passed).length,
    results,
    verifiedResults,
    pendingVerificationResults,
  };
}

export const runCompetitionRulesTests = runComprehensiveCompetitionTests;

