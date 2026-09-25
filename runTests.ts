import { runComprehensiveCompetitionTests } from './src/services/competitionRules.test';
import { runIntegrationTests } from './src/services/integration.test';

console.log('====================================================');
console.log('--- 1. SUITE REGLAMENTARIA VERIFICADA AFA / LPF 2026 ---');
console.log('====================================================');
const regReport = runComprehensiveCompetitionTests();

console.log('\n--- TESTS REGLAMENTARIOS VERIFICADOS (AFA / LPF) ---');
for (const res of regReport.verifiedResults) {
  const icon = res.passed ? '✓' : '✗';
  console.log(`${icon} [${res.category}] ${res.testName}: ${res.details}`);
}

console.log('\n--- ESCENARIOS PENDIENTES DE VERIFICACIÓN REGLAMENTARIA ---');
for (const res of regReport.pendingVerificationResults) {
  const icon = res.passed ? '✓' : '✗';
  console.log(`${icon} [${res.category}] ${res.testName}: ${res.details}`);
}

console.log(`\nTests Reglamentarios Verificados: ${regReport.verifiedCount} / ${regReport.verifiedResults.length} pasados.`);
console.log(`Tests de Escenarios Pendientes:    ${regReport.pendingCount} / ${regReport.pendingVerificationResults.length} pasados.`);

console.log('\n====================================================');
console.log('--- 2. SUITE DE INTEGRACIÓN END-TO-END CÁBALA 2026 ---');
console.log('====================================================');
const intReport = runIntegrationTests();

for (const res of intReport.results) {
  const icon = res.passed ? '✓' : '✗';
  console.log(`${icon} [${res.category}] ${res.testName}: ${res.details}`);
}

console.log(`\nTests de Integración: ${intReport.passedCount} / ${intReport.total} pasados.`);

const totalPassed = regReport.passedCount + intReport.passedCount;
const totalCount = regReport.total + intReport.total;
const allPassed = regReport.allPassed && intReport.allPassed;

console.log('\n====================================================');
console.log('--- RESUMEN GLOBAL DE AUDITORÍA ---');
console.log('====================================================');
console.log(`Tests reglamentarios verificados: ${regReport.verifiedCount}`);
console.log(`Tests de escenarios pendientes:   ${regReport.pendingCount}`);
console.log(`Tests de integración:             ${intReport.passedCount}`);
console.log(`Total:                            ${totalPassed} / ${totalCount}`);

if (!allPassed) {
  console.error('\nALERTA: Algunos tests fallaron.');
  process.exit(1);
} else {
  console.log('\nÉxito: Auditoría de integración y verificación reglamentaria completada.');
}
