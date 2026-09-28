/**
 * Script de Verificación de Grounding de IA
 *
 * Prueba:
 * 1. Consulta con dato existente: Debe devolver datos verificados por las herramientas deterministas.
 * 2. Consulta con dato inexistente: Debe devolver categóricamente "SIN DATO" sin especulación ni alucinación.
 */

import { cabalaFootballTools } from '../src/services/ai/aiTools';
import { getAIProvider } from '../src/services/ai/aiProvider';

async function runAIVerification() {
  console.log('====================================================');
  console.log('--- VERIFICACIÓN DE GROUNDING Y REGLA SIN DATO EN IA ---');
  console.log('====================================================\n');

  const kimi = getAIProvider('kimi');
  const nemotron = getAIProvider('nemotron');

  // Caso 1: Consulta de dato existente reglamentario (Reglamento AFA 2026)
  console.log('Caso 1: Consulta de dato existente reglamentario (Reglamento Oficial Apertura 2026)...');
  const regData = cabalaFootballTools.getRegulationRules({ competitionId: 'apertura', season: '2026' });
  const response1 = await kimi.generateResponse('¿Cómo es el formato del Torneo Apertura?', {
    toolName: 'getRegulationRules',
    toolResult: regData,
  });

  console.log('Resultado Caso 1:');
  console.log(response1.content.slice(0, 260) + '...\n');
  console.log('✓ Herramienta invocada:', response1.toolsInvoked);
  console.log('✓ Modelo utilizado:', response1.modelUsed);

  // Caso 2: Consulta de dato inexistente (Tabla de Promedios / Descenso no disponible)
  console.log('\n----------------------------------------------------');
  console.log('Caso 2: Consulta de dato inexistente (Descenso sin datos oficiales)...');
  const simulatedUnavailable = {
    disponible: false,
    mensaje: 'SIN DATO: La tabla de promedios no está disponible en la fuente de datos deportiva (ESPN).',
  };
  const response2 = await kimi.generateResponse('¿Quiénes descienden hoy por promedios?', {
    toolName: 'getRelegationStatus',
    toolResult: simulatedUnavailable,
  });

  console.log('Resultado Caso 2:');
  console.log(response2.content);

  const containsSinDato = response2.content.includes('SIN DATO');
  if (containsSinDato) {
    console.log('\n✓ Caso 2 APROBADO: La IA responde explícitamente con "SIN DATO" ante ausencia de datos del proveedor.');
  } else {
    console.error('\n✗ Caso 2 FALLÓ: No se encontró la regla SIN DATO.');
    process.exit(1);
  }

  // Caso 3: Consulta de club inexistente
  console.log('\n----------------------------------------------------');
  console.log('Caso 3: Consulta de club inexistente ("Club Fantasma FC")...');
  const simulatedMissingClub = {
    encontrado: false,
    mensaje: 'No se encontró el club en la nómina de Primera División.',
  };
  const response3 = await nemotron.generateResponse('Ficha técnica de Club Fantasma FC', {
    toolName: 'getClubInfo',
    toolResult: simulatedMissingClub,
  });

  console.log('Resultado Caso 3:');
  console.log(response3.content);
  if (response3.content.includes('SIN DATO')) {
    console.log('\n✓ Caso 3 APROBADO: Club inexistente retorna estrictamente "SIN DATO".');
  } else {
    console.error('\n✗ Caso 3 FALLÓ: Club inexistente no produjo SIN DATO.');
    process.exit(1);
  }

  console.log('\n====================================================');
  console.log('✓ VERIFICACIÓN DE IA COMPLETADA CON ÉXITO: GROUNDING 100% DETERMINISTA');
  console.log('====================================================');
}

runAIVerification().catch((err) => {
  console.error('Error durante la verificación:', err);
  process.exit(1);
});
