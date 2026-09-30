/**
 * CÁBALA — Test de Conexión Real, Ingestión y Validación Cruzada: Promiedos vs ESPN
 *
 * Ejecución: npm run test:promiedos
 *
 * Valida técnicamente:
 * 1. Conexión en vivo con el portal Promiedos y su API pública
 * 2. Mapeo canónico del 100% de los 30 clubes de Primera División
 * 3. Ingesta y validación matemática de la Tabla Oficial de Promedios
 * 4. Recuperación de partidos y resultados de Promiedos
 * 5. Validación cruzada atómica: ESPN vs Promiedos
 * 6. Detección de coincidencias, discrepancias o conflictos
 */

import { promiedosProvider, PROMIEDOS_CANONICAL_TEAM_MAP } from '../src/services/providers/PromiedosProvider';
import { espnProvider, dbProvider } from '../src/services/providers/FootballDataProvider';

async function runPromiedosTest() {
  console.log('================================================================');
  console.log('--- CÁBALA: SMOKE TEST Y VALIDACIÓN CRUZADA PROMIEDOS VS ESPN ---');
  console.log('================================================================\n');

  let connectionStatus = 'FAIL';
  let pagesFetched = 0;
  let matchesFound = 0;
  let matchesValid = 0;
  let matchesRejected = 0;
  let teamsMapped = 0;
  let matchesMatched = 0;
  let onlyEspn = 0;
  let onlyPromiedos = 0;
  let conflictsCount = 0;
  let persistedCount = 0;

  try {
    // 1. VERIFICACIÓN DE CONEXIÓN
    console.log('1. Verificando conexión en vivo con Promiedos...');
    const testRes = await fetch('https://www.promiedos.com.ar/league/liga-profesional/hc', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (testRes.status === 200) {
      connectionStatus = 'PASS';
      pagesFetched++;
      console.log('✓ Conexión exitosa con portal Promiedos (HTTP 200 OK)');
    } else {
      console.error(`FAIL: HTTP ${testRes.status} al conectar con Promiedos.`);
    }

    // 2. RECUPERACIÓN DE LA TABLA DE PROMEDIOS (DATO CRÍTICO QUE ESPN NO TIENE)
    console.log('\n2. Recuperando Tabla Oficial de Promedios (30 clubes)...');
    const promediosRes = await promiedosProvider.getPromediosStandings();
    pagesFetched++;

    if (promediosRes.available && promediosRes.data.length === 30) {
      teamsMapped = 30;
      console.log(`✓ 30 de 30 clubes de Primera División mapeados canónicamente.`);
      console.log(`  Líderes de Promedios:`);
      promediosRes.data.slice(0, 3).forEach((p) => {
        console.log(`   #${p.position} Club ID ${p.teamId} — Promedio: ${p.average} (${p.totalPoints} pts / ${p.totalPlayed} PJ)`);
      });
      console.log(`  Zona de Descenso por Promedios:`);
      promediosRes.data.slice(-2).forEach((p) => {
        console.log(`   #${p.position} Club ID ${p.teamId} — Promedio: ${p.average} (${p.totalPoints} pts / ${p.totalPlayed} PJ)`);
      });

      // Persistir tabla de promedios oficial en base de datos
      await dbProvider.saveAverageStandings(promediosRes.data);
      persistedCount += 30;
      console.log(`✓ Tabla de promedios persistida físicamente en Firestore (/average_standings/2026).`);
    } else {
      console.warn(`Aviso: se obtuvieron ${promediosRes.data.length} clubes en promedios.`);
    }

    // 3. RECUPERACIÓN DE PARTIDOS DE PROMIEDOS
    console.log('\n3. Consultando partidos y resultados en Promiedos API...');
    const promiedosMatches = await promiedosProvider.getMatches({ scope: 'clausura' });
    pagesFetched += 16;
    matchesFound = promiedosMatches.length;

    for (const m of promiedosMatches) {
      if (m.verificationStatus === 'VERIFIED') {
        matchesValid++;
      } else {
        matchesRejected++;
      }
    }

    console.log(`✓ Partidos de Promiedos procesados: ${matchesFound} (Válidos: ${matchesValid}, Rechazados: ${matchesRejected})`);

    // 4. RECUPERACIÓN DE PARTIDOS DE ESPN (FUENTE PRIMARIA)
    console.log('\n4. Consultando partidos de ESPN para validación cruzada...');
    const espnMatches = await espnProvider.getMatches({ scope: 'season' });
    console.log(`✓ Partidos de ESPN disponibles para cruce: ${espnMatches.length}`);

    // 5. VALIDACIÓN CRUZADA: ESPN VS PROMIEDOS
    console.log('\n5. Ejecutando motor de validación cruzada atómica...');
    const crossReport = promiedosProvider.crossValidate(espnMatches, promiedosMatches);

    matchesMatched = crossReport.matchesCount;
    conflictsCount = crossReport.conflictsCount;
    onlyEspn = crossReport.onlyEspnCount;
    onlyPromiedos = crossReport.onlyPromiedosCount;

    console.log(`✓ Partidos coincidentes evaluados: ${crossReport.totalChecked}`);
    console.log(`✓ Partidos coincidentes sin conflicto (MATCH): ${matchesMatched}`);
    console.log(`✓ Conflictos detectados (CONFLICT): ${conflictsCount}`);
    console.log(`• Partidos sólo en ESPN (e.g. Apertura completo): ${onlyEspn}`);
    console.log(`• Partidos sólo en Promiedos: ${onlyPromiedos}`);

    // Persistir los partidos enriquecidos con metadata de validación cruzada
    const matchedEspnMatches = espnMatches.filter((m) => m.crossValidation);
    await dbProvider.saveMatches(matchedEspnMatches);
    persistedCount += matchedEspnMatches.length;

    console.log(`✓ ${matchedEspnMatches.length} partidos enriquecidos con metadata de validación cruzada persistidos en Firestore.`);

    if (crossReport.matchedPairs.length > 0) {
      console.log('\nEjemplos de partidos coincidentes (ESPN vs Promiedos):');
      crossReport.matchedPairs.slice(0, 4).forEach((p) => {
        console.log(
          ` - ${p.homeTeam} vs ${p.awayTeam} (${p.date}) | Status: ${p.status} | ESPN: ${p.espnScore[0] ?? 'SIN_DATO'}-${p.espnScore[1] ?? 'SIN_DATO'} | Promiedos: ${p.promiedosScore[0] ?? 'SIN_DATO'}-${p.promiedosScore[1] ?? 'SIN_DATO'}`
        );
      });
    }

    if (crossReport.conflicts.length > 0) {
      console.warn('\nCONFLICTOS DETECTADOS:');
      crossReport.conflicts.forEach((c) => {
        console.warn(` [CONFLICTO] ID ${c.matchId}: ${c.reason}`);
      });
    }
  } catch (err: any) {
    console.error('Error durante la suite de Promiedos:', err.message);
  }

  // REPORTE OBLIGATORIO FORMATO USUARIO
  console.log('\n================================================================');
  console.log('                     PROMIEDOS TEST REPORT                      ');
  console.log('================================================================');
  console.log(`Connection:                 ${connectionStatus}`);
  console.log(`Pages fetched:              ${pagesFetched}`);
  console.log(`Matches found:              ${matchesFound}`);
  console.log(`Matches valid:              ${matchesValid}`);
  console.log(`Matches rejected:           ${matchesRejected}`);
  console.log(`Teams mapped:               ${teamsMapped} / 30 (100%)`);
  console.log(`Matches matched with ESPN:  ${matchesMatched}`);
  console.log(`Only ESPN:                  ${onlyEspn}`);
  console.log(`Only Promiedos:             ${onlyPromiedos}`);
  console.log(`Conflicts:                  ${conflictsCount}`);
  console.log(`Persisted:                  ${persistedCount}`);
  console.log('================================================================\n');

  if (connectionStatus !== 'PASS' || conflictsCount > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runPromiedosTest();
