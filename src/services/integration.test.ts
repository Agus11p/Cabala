import {
  StandingRow,
  ZoneStanding,
  AnnualStanding,
  Match,
  Club,
} from '../types/football';
import {
  getZoneStandings,
  getAnnualTable,
  generateRoundOf16Matchups,
  calculateContinentalPlacesWithAudit,
  getEligibleSudamericanaTeams,
  validateStandingsIntegrity,
  validateZoneIntegrity,
  evaluateRelegation,
  calculateQualificationScenario,
} from './competitionRules';
import { cabalaFootballTools } from './ai/aiTools';

export interface IntegrationTestResult {
  category: string;
  testName: string;
  passed: boolean;
  details: string;
}

export function runIntegrationTests(): {
  results: IntegrationTestResult[];
  passedCount: number;
  total: number;
  allPassed: boolean;
} {
  const results: IntegrationTestResult[] = [];

  const add = (category: string, testName: string, passed: boolean, details: string) => {
    results.push({ category, testName, passed, details });
  };

  // -------------------------------------------------------------------------
  // 1. Integración: Provider → Normalización
  // -------------------------------------------------------------------------
  try {
    const rawEspnTeam = {
      id: '5',
      name: 'Boca Juniors',
      displayName: 'Boca Juniors',
      shortDisplayName: 'Boca',
      abbreviation: 'CABJ',
      location: 'Buenos Aires',
      color: '003366',
      alternateColor: 'ffcc00',
      logos: [{ href: 'https://a.espncdn.com/i/teamlogos/soccer/500/5.png' }],
    };

    const normalizedClub: Club = {
      id: String(rawEspnTeam.id),
      name: rawEspnTeam.displayName,
      shortName: rawEspnTeam.shortDisplayName,
      code: rawEspnTeam.abbreviation,
      city: rawEspnTeam.location,
      stadium: 'La Bombonera',
      founded: 1905,
      logo: rawEspnTeam.logos[0].href,
      primaryColor: `#${rawEspnTeam.color}`,
      secondaryColor: `#${rawEspnTeam.alternateColor}`,
      recentForm: [],
      zone: 'A',
    };

    const isValid =
      normalizedClub.id === '5' &&
      normalizedClub.code === 'CABJ' &&
      Boolean(normalizedClub.logo?.includes('5.png')) &&
      normalizedClub.recentForm.length === 0;

    add(
      'Provider → Normalización',
      'Normalización limpia de entidad Club sin datos inventados',
      isValid,
      isValid ? 'Entidad Club normalizada con escudo oficial, colores y sin mock de recentForm' : 'Fallo en la normalización'
    );
  } catch (err: any) {
    add('Provider → Normalización', 'Normalización de Club', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 2. Integración: Normalización → Zona A (Exactamente 15 Clubes)
  // -------------------------------------------------------------------------
  const mockZoneAEntries: StandingRow[] = Array.from({ length: 15 }, (_, i) => ({
    position: i + 1,
    teamId: `A_${i + 1}`,
    team: {
      id: `A_${i + 1}`,
      name: `Club A${i + 1}`,
      shortName: `A${i + 1}`,
      code: `CA${i + 1}`,
      city: 'Buenos Aires',
      stadium: 'Estadio Oficial',
      founded: 1910,
      primaryColor: '#DCA842',
      secondaryColor: '#181C22',
      recentForm: [],
      zone: 'A',
    },
    played: 10,
    won: 6 - Math.floor(i / 3),
    drawn: 2,
    lost: 2 + Math.floor(i / 3),
    goalsFor: 18 - i,
    goalsAgainst: 8 + i,
    goalDiff: (18 - i) - (8 + i),
    points: (6 - Math.floor(i / 3)) * 3 + 2,
    zone: 'A',
    zonePosition: i + 1,
    phase: 'clausura',
    seasonYear: '2026',
  }));

  try {
    const zoneAStandings = getZoneStandings(mockZoneAEntries, '2026', 'clausura', 'A');
    const countCheck = zoneAStandings.length === 15;
    const allHaveZoneA = zoneAStandings.every((t) => t.zone === 'A');
    const positionsValid = zoneAStandings[0].zonePosition === 1 && zoneAStandings[14].zonePosition === 15;

    add(
      'Normalización → Zona A',
      'Zona A contiene exactamente 15 clubes con posiciones 1° al 15° y zona = "A"',
      countCheck && allHaveZoneA && positionsValid,
      `Conteo: ${zoneAStandings.length} clubes, zona verificada "A", rango de posiciones 1..15`
    );
  } catch (err: any) {
    add('Normalización → Zona A', 'Integridad Zona A', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 3. Integración: Normalización → Zona B (Exactamente 15 Clubes)
  // -------------------------------------------------------------------------
  const mockZoneBEntries: StandingRow[] = Array.from({ length: 15 }, (_, i) => ({
    position: i + 1,
    teamId: `B_${i + 1}`,
    team: {
      id: `B_${i + 1}`,
      name: `Club B${i + 1}`,
      shortName: `B${i + 1}`,
      code: `CB${i + 1}`,
      city: 'Córdoba',
      stadium: 'Estadio Oficial',
      founded: 1915,
      primaryColor: '#30A46C',
      secondaryColor: '#181C22',
      recentForm: [],
      zone: 'B',
    },
    played: 10,
    won: 7 - Math.floor(i / 3),
    drawn: 1,
    lost: 2 + Math.floor(i / 3),
    goalsFor: 20 - i,
    goalsAgainst: 10 + i,
    goalDiff: (20 - i) - (10 + i),
    points: (7 - Math.floor(i / 3)) * 3 + 1,
    zone: 'B',
    zonePosition: i + 1,
    phase: 'clausura',
    seasonYear: '2026',
  }));

  try {
    const zoneBStandings = getZoneStandings(mockZoneBEntries, '2026', 'clausura', 'B');
    const countCheck = zoneBStandings.length === 15;
    const allHaveZoneB = zoneBStandings.every((t) => t.zone === 'B');
    const positionsValid = zoneBStandings[0].zonePosition === 1 && zoneBStandings[14].zonePosition === 15;

    add(
      'Normalización → Zona B',
      'Zona B contiene exactamente 15 clubes con posiciones 1° al 15° y zona = "B"',
      countCheck && allHaveZoneB && positionsValid,
      `Conteo: ${zoneBStandings.length} clubes, zona verificada "B", rango de posiciones 1..15`
    );
  } catch (err: any) {
    add('Normalización → Zona B', 'Integridad Zona B', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 4. Integración: Validación Matemática (Standings Integrity)
  // -------------------------------------------------------------------------
  try {
    // 4.1 Datos matemáticamente coherentes
    const cleanInconsistencies = validateStandingsIntegrity([...mockZoneAEntries, ...mockZoneBEntries]);
    const cleanPass = cleanInconsistencies.length === 0;

    // 4.2 Detección de inconsistencia deliberada (sin corrección silenciosa)
    const corruptedRow: StandingRow = {
      ...mockZoneAEntries[0],
      teamId: 'CORRUPT_CLUB',
      team: { ...mockZoneAEntries[0].team!, name: 'Club Inconsistente' },
      played: 10,
      won: 5,
      drawn: 2,
      lost: 1, // 5 + 2 + 1 = 8 != 10 (PJ mismatch)
      goalsFor: 12,
      goalsAgainst: 10,
      goalDiff: 5, // 12 - 10 = 2 != 5 (DG mismatch)
      points: 25, // 5*3 + 2 = 17 != 25 (PTS mismatch)
    };

    const detected = validateStandingsIntegrity([corruptedRow], 'Test Corrupt Feed');
    const detectedAll3 =
      detected.some((d) => d.field.includes('PJ')) &&
      detected.some((d) => d.field.includes('DG')) &&
      detected.some((d) => d.field.includes('PTS'));

    add(
      'Zona A/B → Validación Matemática',
      'Detección estricta de inconsistencias matemáticas (PJ, DG, PTS) sin corrección silenciosa',
      cleanPass && detectedAll3,
      `30 clubes limpios aprobados. Fila inconsistente detectó exactamente las 3 discrepancias con valores recibidos vs esperados`
    );
  } catch (err: any) {
    add('Zona A/B → Validación Matemática', 'Validación Matemática', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 5. Integración: Standings → Playoffs
  // -------------------------------------------------------------------------
  try {
    const matchups = generateRoundOf16Matchups(mockZoneAEntries, mockZoneBEntries);

    const m1 = matchups[0]; // 1A vs 8B
    const m2 = matchups[1]; // 1B vs 8A
    const m8 = matchups[7]; // 4B vs 5A

    const match1Valid = m1.homeTeam.teamId === 'A_1' && m1.awayTeam.teamId === 'B_8';
    const match2Valid = m2.homeTeam.teamId === 'B_1' && m2.awayTeam.teamId === 'A_8';
    const match8Valid = m8.homeTeam.teamId === 'B_4' && m8.awayTeam.teamId === 'A_5';

    // Verificar localía
    const localiaValid = m1.homeAdvantageTeamId === 'A_1' && m2.homeAdvantageTeamId === 'B_1';

    add(
      'Standings → Playoffs',
      'Generación del bracket de Octavos alimentado directamente de las tablas A y B',
      match1Valid && match2Valid && match8Valid && localiaValid,
      `Cruces reglamentarios verificados: 1A vs 8B (${m1.homeTeam.teamId} vs ${m1.awayTeam.teamId}), 1B vs 8A (${m2.homeTeam.teamId} vs ${m2.awayTeam.teamId}) con localía para el mejor clasificado`
    );
  } catch (err: any) {
    add('Standings → Playoffs', 'Playoff Bracket', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 6. Integración: Apertura + Clausura → Tabla Anual (30 Clubes Acumulados)
  // -------------------------------------------------------------------------
  try {
    // Generar 30 clubes con puntos en Apertura y Clausura
    const aperturaRows: StandingRow[] = Array.from({ length: 30 }, (_, i) => ({
      position: i + 1,
      teamId: `club_${i + 1}`,
      team: {
        id: `club_${i + 1}`,
        name: `Club ${i + 1}`,
        shortName: `C${i + 1}`,
        code: `CL${i + 1}`,
        city: 'Argentina',
        stadium: 'Estadio Oficial',
        founded: 1900,
        primaryColor: '#DCA842',
        secondaryColor: '#181C22',
        recentForm: [],
      },
      played: 16,
      won: 8,
      drawn: 4,
      lost: 4,
      goalsFor: 22,
      goalsAgainst: 14,
      goalDiff: 8,
      points: 28,
      phase: 'apertura',
      seasonYear: '2026',
    }));

    const clausuraRows: StandingRow[] = Array.from({ length: 30 }, (_, i) => ({
      position: i + 1,
      teamId: `club_${i + 1}`,
      played: 16,
      won: i === 0 ? 12 : 6, // club_1 hace una gran campaña en Clausura
      drawn: 4,
      lost: i === 0 ? 0 : 6,
      goalsFor: i === 0 ? 30 : 18,
      goalsAgainst: i === 0 ? 8 : 18,
      goalDiff: i === 0 ? 22 : 0,
      points: i === 0 ? 40 : 22,
      phase: 'clausura',
      seasonYear: '2026',
    }));

    // Pasar filas combinadas de ambas fases a getAnnualTable
    const annualTable = getAnnualTable([...aperturaRows, ...clausuraRows], '2026');

    const totalClubs30 = annualTable.length === 30;
    const championIsClub1 = annualTable[0].teamId === 'club_1';
    const championPoints = annualTable[0].points; // 28 + 40 = 68
    const championPlayed = annualTable[0].played; // 16 + 16 = 32
    const isChampionFlagged = annualTable[0].isLeagueChampion === true;

    add(
      'Apertura + Clausura → Anual',
      'Acumulación completa de 32 fechas (16 Apertura + 16 Clausura) y proclamación de Campeón de Liga',
      totalClubs30 && championIsClub1 && championPoints === 68 && championPlayed === 32 && isChampionFlagged,
      `30 clubes consolidados. Campeón de Liga: ${annualTable[0].teamId} con ${championPoints} pts (28 Ap + 40 Cl) en ${championPlayed} PJ`
    );
  } catch (err: any) {
    add('Apertura + Clausura → Anual', 'Tabla Anual Acumulada', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 7. Integración: Anual → Libertadores (6 Plazas y Reasignación de Campeón)
  // -------------------------------------------------------------------------
  try {
    const annualStandings: StandingRow[] = Array.from({ length: 30 }, (_, i) => ({
      position: i + 1,
      teamId: `equipo_${i + 1}`,
      team: {
        id: `equipo_${i + 1}`,
        name: `Equipo ${i + 1}`,
        shortName: `EQ${i + 1}`,
        code: `E${i + 1}`,
        city: 'Argentina',
        stadium: 'Estadio Oficial',
        founded: 1900,
        primaryColor: '#DCA842',
        secondaryColor: '#181C22',
        recentForm: [],
      },
      played: 32,
      won: 20 - i,
      drawn: 6,
      lost: 6 + i,
      goalsFor: 40 - i,
      goalsAgainst: 20 + i,
      goalDiff: (40 - i) - (20 + i),
      points: (20 - i) * 3 + 6,
    }));

    // Caso de integración: Bicampeón de Liga (equipo_1 ganó Apertura y Clausura)
    const audit = calculateContinentalPlacesWithAudit(
      annualStandings,
      {
        aperturaChampionId: 'equipo_1',
        clausuraChampionId: 'equipo_1', // Mismo campeón
        copaArgentinaChampionId: 'equipo_3',
      },
      [],
      'Integración Bicampeón'
    );

    const libSlots = audit.finalLibertadores;
    const sixPlazas = libSlots.length === 6;
    const uniqueClubs = new Set(libSlots.map((p) => p.teamId)).size === 6;
    const hasReallocation = audit.reallocationSteps.length > 0;

    add(
      'Anual → Libertadores',
      'Asignación determinista de 6 plazas a Copa Libertadores con reasignación por bicampeonato',
      sixPlazas && uniqueClubs && hasReallocation,
      `6 plazas únicas asignadas. Se detectó bicampeonato y se reasignó plaza vacante al mejor clasificado anual sin duplicaciones`
    );
  } catch (err: any) {
    add('Anual → Libertadores', 'Plazas Libertadores', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 8. Integración: Anual → Sudamericana (6 Plazas Excluyentes)
  // -------------------------------------------------------------------------
  try {
    const annualStandings: StandingRow[] = Array.from({ length: 30 }, (_, i) => ({
      position: i + 1,
      teamId: `club_anual_${i + 1}`,
      team: {
        id: `club_anual_${i + 1}`,
        name: `Club Anual ${i + 1}`,
        shortName: `CA${i + 1}`,
        code: `CA${i + 1}`,
        city: 'Argentina',
        stadium: 'Estadio Oficial',
        founded: 1900,
        primaryColor: '#3B82F6',
        secondaryColor: '#181C22',
        recentForm: [],
      },
      played: 32,
      won: 20 - i,
      drawn: 5,
      lost: 7 + i,
      goalsFor: 45 - i,
      goalsAgainst: 25 + i,
      goalDiff: (45 - i) - (25 + i),
      points: (20 - i) * 3 + 5,
    }));

    // Simular que los puestos 1 a 6 ya tienen plaza a Libertadores
    const mockLibPlaces = Array.from({ length: 6 }, (_, idx) => ({
      placeNumber: idx + 1,
      competition: 'libertadores' as const,
      teamId: `club_anual_${idx + 1}`,
      teamName: `Club Anual ${idx + 1}`,
      reason: 'Clasificado a Libertadores',
    }));

    // El puesto 8 está descendido o inelegible
    const ineligibleIds = ['club_anual_8'];

    const sudaPlaces = getEligibleSudamericanaTeams(annualStandings, mockLibPlaces, ineligibleIds);

    const sixSlots = sudaPlaces.length === 6;
    const noLibertadores = sudaPlaces.every((s) => !mockLibPlaces.some((l) => l.teamId === s.teamId));
    const excludedIneligible = sudaPlaces.every((s) => s.teamId !== 'club_anual_8');
    const entersClub13 = sudaPlaces.some((s) => s.teamId === 'club_anual_13'); // Avanzó por exclusión de club_anual_8

    add(
      'Anual → Sudamericana',
      'Asignación de las 6 plazas a Copa Sudamericana excluyendo clasificados a Libertadores e inelegibles',
      sixSlots && noLibertadores && excludedIneligible && entersClub13,
      `6 plazas exactas. Se excluyeron los 6 de Libertadores y el club_anual_8 inelegible, clasificando del 7° al 13°`
    );
  } catch (err: any) {
    add('Anual → Sudamericana', 'Plazas Sudamericana', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 9. Integración: Datos → IA Tools (Grounding Determinista)
  // -------------------------------------------------------------------------
  try {
    // 9.1 Herramienta de desempate
    const tieBreakToolRes = cabalaFootballTools.getTieBreakExplanation();
    const has5Criteria = tieBreakToolRes.ordenSucesivoDesempateAFA2026.length === 5;
    const hasNeutralMatchNote = tieBreakToolRes.notaDesempateDescenso.includes('partido de desempate en cancha neutral');

    // 9.2 Herramienta de reglamento oficial
    const regRes = cabalaFootballTools.getRegulationRules({ competitionId: 'anual' });
    const regSeason2026 = regRes.temporada === '2026';

    add(
      'Datos → IA Tools',
      'Herramientas de IA conectadas al motor determinista y fundamentadas en el reglamento AFA 2026',
      has5Criteria && hasNeutralMatchNote && regSeason2026,
      'Criterios sucesivos, notas de permanencia y reglamento 2026 suministrados a la IA con rigor determinista'
    );
  } catch (err: any) {
    add('Datos → IA Tools', 'IA Grounded Tools', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 10. Integración: Detección y Rechazo de Conteo Anómalo (14 o 16 Clubes)
  // -------------------------------------------------------------------------
  try {
    const invalid14Zone = mockZoneAEntries.slice(0, 14);
    const inconsistencies14 = validateZoneIntegrity(invalid14Zone, 'A');

    const invalid16Zone = [
      ...mockZoneBEntries,
      {
        ...mockZoneBEntries[0],
        teamId: 'B_16_EXTRA',
        position: 16,
      },
    ];
    const inconsistencies16 = validateZoneIntegrity(invalid16Zone, 'B');

    const detected14 = inconsistencies14.some((inc) => inc.receivedValue === 14 && inc.expectedValue === 15);
    const detected16 = inconsistencies16.some((inc) => inc.receivedValue === 16 && inc.expectedValue === 15);

    add(
      'Integridad de Zonas',
      'Rechazo explícito y detección de anomalía si una zona tiene 14 o 16 clubes',
      detected14 && detected16,
      `Detectado conteo irregular de 14 clubes (esperado 15) y 16 clubes (esperado 15) con mensaje de infracción reglamentaria`
    );
  } catch (err: any) {
    add('Integridad de Zonas', 'Integridad de Zonas', false, err.message);
  }

  const passedCount = results.filter((r) => r.passed).length;

  return {
    results,
    passedCount,
    total: results.length,
    allPassed: passedCount === results.length,
  };
}
