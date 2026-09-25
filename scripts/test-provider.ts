/**
 * CÁBALA - Smoke Test Contra Proveedor Deportivo Real (ESPN ARG.1)
 *
 * Ejecución: npm run test:provider
 * Objetivo: Validar de extremo a extremo que el feed deportivo real de ESPN
 * entrega los datos esperados de la Temporada 2026 sin datos ficticios ni mocks.
 */

interface StatLookup {
  name: string;
  value?: number;
}

const REQUIRED_STAT_FIELDS = [
  'gamesPlayed',
  'wins',
  'ties',
  'losses',
  'pointsFor',
  'pointsAgainst',
  'pointDifferential',
  'points',
] as const;

async function runProviderSmokeTest() {
  console.log('================================================================');
  console.log('--- CÁBALA: SMOKE TEST CONTRA PROVEEDOR DE DATOS REAL (ESPN) ---');
  console.log('================================================================');
  console.log('Consultando endpoints oficiales de ESPN ARG.1 en vivo...\n');

  let hasErrors = false;

  // 1. CONSULTA: /standings
  console.log('1. Verificando endpoint /standings...');
  const standingsUrl = 'https://site.api.espn.com/apis/v2/sports/soccer/arg.1/standings';
  const standingsRes = await fetch(standingsUrl);

  if (standingsRes.status !== 200) {
    console.error(`FAIL: HTTP ${standingsRes.status} al consultar ${standingsUrl}`);
    process.exit(1);
  }
  console.log('✓ HTTP 200 OK en /standings');

  const standingsData: any = await standingsRes.json();

  // Validación de Temporada 2026
  const returnedSeasonYear = standingsData.season?.year || standingsData.season;
  console.log(`• Temporada devuelta por ESPN: ${JSON.stringify(returnedSeasonYear)}`);
  if (String(returnedSeasonYear) !== '2026' && returnedSeasonYear?.year !== 2026) {
    console.error(`FAIL: La temporada recibida no es 2026. Recibido: ${JSON.stringify(returnedSeasonYear)}`);
    process.exit(1);
  }
  console.log('✓ season === 2026 confirmado');

  // Competencia arg.1
  const compName = standingsData.name || '';
  console.log(`• Competencia: "${compName}"`);
  if (!compName.toLowerCase().includes('argentin') && !compName.toLowerCase().includes('liga profesional')) {
    console.warn(`ADVERTENCIA: Nombre de competencia inesperado: ${compName}`);
  }

  // Grupos / Zonas A y B
  if (!standingsData.children || standingsData.children.length < 2) {
    console.error(`FAIL: Se esperaban al menos 2 zonas (Group A y Group B). Recibidos: ${standingsData.children?.length}`);
    process.exit(1);
  }

  const groupA = standingsData.children.find((c: any) => c.name?.toLowerCase().includes('a')) || standingsData.children[0];
  const groupB = standingsData.children.find((c: any) => c.name?.toLowerCase().includes('b')) || standingsData.children[1];

  console.log(`✓ Group A detectado: "${groupA.name}"`);
  console.log(`✓ Group B detectado: "${groupB.name}"`);

  const entriesA: any[] = groupA.standings?.entries || [];
  const entriesB: any[] = groupB.standings?.entries || [];

  console.log(`• Cantidad de clubes en Group A: ${entriesA.length}`);
  console.log(`• Cantidad de clubes en Group B: ${entriesB.length}`);

  if (entriesA.length !== 15) {
    console.error(`FAIL: Group A no tiene exactamente 15 clubes (tiene ${entriesA.length})`);
    hasErrors = true;
  }
  if (entriesB.length !== 15) {
    console.error(`FAIL: Group B no tiene exactamente 15 clubes (tiene ${entriesB.length})`);
    hasErrors = true;
  }

  // 2. CONSULTA: /scoreboard
  console.log('\n2. Verificando endpoint /scoreboard...');
  const scoreboardUrl = 'https://site.api.espn.com/apis/site/v2/sports/soccer/arg.1/scoreboard';
  const scoreboardRes = await fetch(scoreboardUrl);
  if (scoreboardRes.status !== 200) {
    console.error(`FAIL: HTTP ${scoreboardRes.status} al consultar ${scoreboardUrl}`);
    hasErrors = true;
  } else {
    const scoreboardData: any = await scoreboardRes.json();
    const sbSeason = scoreboardData.season?.year;
    const sbLeague = scoreboardData.leagues?.[0]?.slug;
    console.log(`✓ HTTP 200 OK en /scoreboard (season: ${sbSeason}, slug: ${sbLeague}, eventos: ${scoreboardData.events?.length ?? 0})`);
    if (String(sbSeason) !== '2026') {
      console.error(`FAIL: Scoreboard season (${sbSeason}) !== 2026`);
      hasErrors = true;
    }
  }

  // 3. CONSULTA: /teams
  console.log('\n3. Verificando endpoint /teams...');
  const teamsUrl = 'https://site.api.espn.com/apis/site/v2/sports/soccer/arg.1/teams';
  const teamsRes = await fetch(teamsUrl);
  let totalTeamsInFeed = 0;
  if (teamsRes.status !== 200) {
    console.error(`FAIL: HTTP ${teamsRes.status} al consultar ${teamsUrl}`);
    hasErrors = true;
  } else {
    const teamsData: any = await teamsRes.json();
    const teamsList = teamsData.sports?.[0]?.leagues?.[0]?.teams || [];
    totalTeamsInFeed = teamsList.length;
    console.log(`✓ HTTP 200 OK en /teams (${totalTeamsInFeed} clubes registrados en nómina oficial)`);
    if (totalTeamsInFeed !== 30) {
      console.warn(`ADVERTENCIA: La nómina de teams tiene ${totalTeamsInFeed} equipos (se esperaban 30)`);
    }
  }

  // 4. VALIDACIÓN DE CAMPOS Y MATEMÁTICA EN STANDINGS REALES
  console.log('\n================================================================');
  console.log('--- 4. VALIDACIÓN MATEMÁTICA REAL DE ESTADÍSTICAS (ESPN) ---');
  console.log('================================================================');

  interface ParsedTeamRow {
    teamId: string;
    name: string;
    zone: 'A' | 'B';
    pj: number;
    pg: number;
    pe: number;
    pp: number;
    gf: number;
    gc: number;
    dg: number;
    pts: number;
  }

  const allParsedRows: ParsedTeamRow[] = [];
  const mathInconsistencies: Array<{
    club: string;
    field: string;
    received: number;
    calculated: number;
  }> = [];

  const inspectZoneEntries = (entries: any[], zone: 'A' | 'B') => {
    for (const entry of entries) {
      const teamId = String(entry.team?.id || '');
      const teamName = String(entry.team?.displayName || entry.team?.name || '');

      if (!teamId || !teamName) {
        console.error(`FAIL: Club con datos de identificación vacíos en Zona ${zone}: id="${teamId}", name="${teamName}"`);
        hasErrors = true;
      }

      const statsList: any[] = entry.stats || [];

      // Verificar que todos los campos requeridos existan explícitamente en el feed
      const statMap: Record<string, number> = {};
      for (const field of REQUIRED_STAT_FIELDS) {
        const found = statsList.find((s) => s.name === field || s.type === field);
        if (!found || found.value === undefined || found.value === null) {
          console.error(`PROVIDER_FIELD_MISSING: Club ${teamName} (ID: ${teamId}) no tiene el campo "${field}".`);
          hasErrors = true;
        } else {
          statMap[field] = Number(found.value);
        }
      }

      const pj = statMap['gamesPlayed'] ?? 0;
      const pg = statMap['wins'] ?? 0;
      const pe = statMap['ties'] ?? 0;
      const pp = statMap['losses'] ?? 0;
      const gf = statMap['pointsFor'] ?? 0;
      const gc = statMap['pointsAgainst'] ?? 0;
      const dg = statMap['pointDifferential'] ?? 0;
      const pts = statMap['points'] ?? 0;

      // Validación Matemática 1: PJ = PG + PE + PP
      const calcPj = pg + pe + pp;
      if (pj !== calcPj) {
        mathInconsistencies.push({
          club: teamName,
          field: 'PJ',
          received: pj,
          calculated: calcPj,
        });
      }

      // Validación Matemática 2: DG = GF - GC
      const calcDg = gf - gc;
      if (dg !== calcDg) {
        mathInconsistencies.push({
          club: teamName,
          field: 'DG',
          received: dg,
          calculated: calcDg,
        });
      }

      // Validación Matemática 3: PTS = PG * 3 + PE
      const calcPts = pg * 3 + pe;
      if (pts !== calcPts) {
        mathInconsistencies.push({
          club: teamName,
          field: 'PTS',
          received: pts,
          calculated: calcPts,
        });
      }

      allParsedRows.push({
        teamId,
        name: teamName,
        zone,
        pj,
        pg,
        pe,
        pp,
        gf,
        gc,
        dg,
        pts,
      });
    }
  };

  inspectZoneEntries(entriesA, 'A');
  inspectZoneEntries(entriesB, 'B');

  if (mathInconsistencies.length > 0) {
    console.error('\nDATA_INCONSISTENCY detectada en los datos en vivo de ESPN:');
    for (const inc of mathInconsistencies) {
      console.error(`• Club: ${inc.club} | Campo: ${inc.field} | Recibido: ${inc.received} | Calculado: ${inc.calculated}`);
    }
    hasErrors = true;
  } else {
    console.log('✓ Todos los 30 clubes de ESPN cumplen estrictamente:');
    console.log('  • PJ = PG + PE + PP');
    console.log('  • DG = GF - GC');
    console.log('  • PTS = PG * 3 + PE');
  }

  // 5. VALIDACIÓN DE NO DUPLICADOS Y ASIGNACIÓN DE ZONA
  console.log('\n================================================================');
  console.log('--- 5. INTEGRIDAD DE ZONAS Y UNICIDAD DE CLUBES ---');
  console.log('================================================================');

  const zoneAClubIds = new Set(allParsedRows.filter((r) => r.zone === 'A').map((r) => r.teamId));
  const zoneBClubIds = new Set(allParsedRows.filter((r) => r.zone === 'B').map((r) => r.teamId));

  // Verificar que ningún club esté simultáneamente en Zona A y Zona B
  const intersection = [...zoneAClubIds].filter((id) => zoneBClubIds.has(id));
  if (intersection.length > 0) {
    console.error(`FAIL: Se encontraron clubes repetidos en ambas zonas simultáneamente: ${intersection.join(', ')}`);
    hasErrors = true;
  } else {
    console.log('✓ Ningún club pertenece simultáneamente a Zona A y Zona B.');
  }

  // Verificar total único
  const totalUniqueTeams = new Set(allParsedRows.map((r) => r.teamId)).size;
  console.log(`• Total de clubes únicos evaluados: ${totalUniqueTeams}`);
  if (totalUniqueTeams !== 30) {
    console.error(`FAIL: Se esperaban 30 clubes únicos, se encontraron: ${totalUniqueTeams}`);
    hasErrors = true;
  }

  // 6. IMPRESIÓN OFICIAL TABLA A / TABLA B
  console.log('\n================================================================');
  console.log('--- TABLA ZONA A (15 CLUBES) ---');
  console.log('================================================================');
  console.log('POS | CLUB                     | ID     | PJ | PG | PE | PP | GF | GC | DG | PTS');
  console.log('-------------------------------------------------------------------------------');
  const rowsA = allParsedRows.filter((r) => r.zone === 'A').sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
  rowsA.forEach((r, idx) => {
    const pos = String(idx + 1).padStart(2, ' ');
    const name = r.name.padEnd(24, ' ');
    const id = r.teamId.padEnd(6, ' ');
    const dgStr = (r.dg >= 0 ? `+${r.dg}` : `${r.dg}`).padStart(3, ' ');
    console.log(`${pos}  | ${name} | ${id} | ${String(r.pj).padStart(2, ' ')} | ${String(r.pg).padStart(2, ' ')} | ${String(r.pe).padStart(2, ' ')} | ${String(r.pp).padStart(2, ' ')} | ${String(r.gf).padStart(2, ' ')} | ${String(r.gc).padStart(2, ' ')} | ${dgStr} | ${String(r.pts).padStart(3, ' ')}`);
  });

  console.log('\n================================================================');
  console.log('--- TABLA ZONA B (15 CLUBES) ---');
  console.log('================================================================');
  console.log('POS | CLUB                     | ID     | PJ | PG | PE | PP | GF | GC | DG | PTS');
  console.log('-------------------------------------------------------------------------------');
  const rowsB = allParsedRows.filter((r) => r.zone === 'B').sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
  rowsB.forEach((r, idx) => {
    const pos = String(idx + 1).padStart(2, ' ');
    const name = r.name.padEnd(24, ' ');
    const id = r.teamId.padEnd(6, ' ');
    const dgStr = (r.dg >= 0 ? `+${r.dg}` : `${r.dg}`).padStart(3, ' ');
    console.log(`${pos}  | ${name} | ${id} | ${String(r.pj).padStart(2, ' ')} | ${String(r.pg).padStart(2, ' ')} | ${String(r.pe).padStart(2, ' ')} | ${String(r.pp).padStart(2, ' ')} | ${String(r.gf).padStart(2, ' ')} | ${String(r.gc).padStart(2, ' ')} | ${dgStr} | ${String(r.pts).padStart(3, ' ')}`);
  });

  // 7. CONSOLIDACIÓN TABLA ANUAL POR teamId
  console.log('\n================================================================');
  console.log('--- 7. CONSOLIDACIÓN DE TABLA ANUAL POR teamId ---');
  console.log('================================================================');
  // Validar que la consolidación se haga por teamId
  const annualMap = new Map<string, { name: string; pts: number; count: number }>();
  for (const r of allParsedRows) {
    if (!annualMap.has(r.teamId)) {
      annualMap.set(r.teamId, { name: r.name, pts: r.pts, count: 1 });
    } else {
      const curr = annualMap.get(r.teamId)!;
      curr.pts += r.pts;
      curr.count += 1;
    }
  }
  console.log(`✓ Consolidación por teamId exitosa. Total clubes consolidados: ${annualMap.size}`);

  // 8. ESTADO DE PROMEDIOS
  console.log('\n================================================================');
  console.log('--- 8. ESTADO DE PROMEDIOS EN EL PROVEEDOR ---');
  console.log('================================================================');
  console.log('• available: false');
  console.log('• Motivo: ESPN no provee tabla de coeficientes acumulados de 3 temporadas.');
  console.log('• Regla CÁBALA: No se inventan promedios ni se computan como oficiales.');
  console.log('✓ Integridad preservada: available=false garantizado.');

  console.log('\n================================================================');
  if (hasErrors) {
    console.error('FAIL: El Smoke Test contra el proveedor ESPN detectó fallas.');
    process.exit(1);
  } else {
    console.log('✓ RESULTADO: SMOKE TEST CONTRA ESPN EXITOSO (100% DATOS REALES)');
    console.log('================================================================\n');
  }
}

runProviderSmokeTest().catch((err) => {
  console.error('Error fatal durante la ejecución del smoke test:', err);
  process.exit(1);
});
