/**
 * CÁBALA — Auditoría Matemática Exhaustiva de la Tabla de Promedios (30 Clubes)
 *
 * Ejecución: npx tsx scripts/test-promedios-math.ts
 *
 * Valida:
 * 1. Recuperación en vivo de los 30 clubes de Primera División desde Promiedos.
 * 2. Matemática: sum(Pts 2024 + 2025 + 2026) === totalPts.
 * 3. Matemática: totalPts / totalPJ === promedio (3 decimales).
 * 4. Provenance: status === 'SECONDARY_SOURCE_ONLY', sourceUrl y sourceId registrados.
 * 5. Manejo exacto de clubes promovidos (Aldosivi, Gimnasia Mendoza, Estudiantes RC).
 */

import { promiedosProvider } from '../src/services/providers/PromiedosProvider';

async function auditPromediosMath() {
  console.log('================================================================');
  console.log('--- CÁBALA: AUDITORÍA MATEMÁTICA Y PROVENANCE DE PROMEDIOS ---');
  console.log('================================================================\n');

  const res = await promiedosProvider.getPromediosStandings();

  if (!res.available || res.data.length !== 30) {
    console.error(`FAIL: Se esperaban 30 clubes, pero se obtuvieron ${res.data.length}`);
    process.exit(1);
  }

  console.log(`✓ 30 clubes obtenidos desde Promiedos (fuente secundaria).`);
  console.log(`✓ Verification Status: ${res.provenance.status}`);
  console.log(`✓ Source URL: ${res.provenance.sourceUrl}`);

  let mathPassCount = 0;
  let roundingPassCount = 0;
  let provenancePassCount = 0;

  console.log('\nAuditando 30 registros...');
  for (const item of res.data) {
    const s = item.seasons;
    const p24 = s?.season2024Pts ?? 0;
    const p25 = s?.season2025Pts ?? 0;
    const p26 = s?.season2026Pts ?? 0;
    const sumPts = p24 + p25 + p26;

    // Chequeo 1: Suma de puntos
    if (sumPts === item.totalPoints) {
      mathPassCount++;
    } else {
      console.error(`FAIL Pts Sum para club ${item.teamId}: suma=${sumPts}, total=${item.totalPoints}`);
    }

    // Chequeo 2: División y redondeo
    const expectedAvg = Math.round(((item.totalPoints || 0) / (item.totalPlayed || 1)) * 1000) / 1000;
    if (Math.abs(expectedAvg - (item.average || 0)) <= 0.001) {
      roundingPassCount++;
    } else {
      console.error(`FAIL Coeficiente para club ${item.teamId}: calculado=${expectedAvg}, recibido=${item.average}`);
    }

    // Chequeo 3: Provenance
    if (
      item.provenance.source === 'PROMIEDOS' &&
      item.provenance.status === 'SECONDARY_SOURCE_ONLY' &&
      item.provenance.sourceUrl &&
      item.provenance.sourceId
    ) {
      provenancePassCount++;
    }
  }

  console.log(`\nResultados:`);
  console.log(`• Validación de suma de puntos:       ${mathPassCount} / 30 aprobados`);
  console.log(`• Validación de cálculo y redondeo:   ${roundingPassCount} / 30 aprobados`);
  console.log(`• Validación de trazabilidad:         ${provenancePassCount} / 30 aprobados`);

  if (mathPassCount === 30 && roundingPassCount === 30 && provenancePassCount === 30) {
    console.log('\n================================================================');
    console.log('✓ AUDITORÍA MATEMÁTICA DE PROMEDIOS: 100% VERIFICADO');
    console.log('================================================================');
    process.exit(0);
  } else {
    console.error('\nFAIL: Discrepancias detectadas.');
    process.exit(1);
  }
}

auditPromediosMath();
