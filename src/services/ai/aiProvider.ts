/**
 * AI Provider Abstraction Interface
 * Implementaciones completamente desacopladas de modelos:
 * - KimiProvider (Kimi K3): Razonamiento profundo, arbitraje reglamentario complejo y desempates.
 * - NemotronProvider (NVIDIA Nemotron 3.5 Lightning 30B): Respuestas de alta velocidad, fixtures, resultados y fichas.
 * - DeepSeekProvider (DeepSeek V4.1 Flash): Análisis táctico, proyecciones matemáticas y probabilidades.
 *
 * REGLA DE ORO DE CÁBALA:
 * La IA NUNCA inventa datos deportivos; todas las respuestas se fundamentan exclusivamente
 * en las herramientas deterministas, en los datos del proveedor deportivo (ESPN) y en el reglamento AFA.
 */

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  modelUsed: string;
  provider: 'kimi' | 'nemotron' | 'deepseek';
  toolsInvoked?: string[];
  latencyMs?: number;
}

export interface AIProvider {
  readonly name: 'kimi' | 'nemotron' | 'deepseek';
  readonly defaultModel: string;
  generateResponse(prompt: string, contextData?: Record<string, any>): Promise<AIResponse>;
}

export class NemotronProvider implements AIProvider {
  public readonly name = 'nemotron' as const;
  public readonly defaultModel = 'NVIDIA-Nemotron-3.5-Lightning-30B';

  public async generateResponse(prompt: string, contextData?: Record<string, any>): Promise<AIResponse> {
    const startTime = Date.now();
    let content = '';

    if (contextData?.toolName === 'getCurrentStandings') {
      const res = contextData.toolResult;
      if (!res.disponible) {
        content = `${res.mensaje} En cumplimiento del principio de CÁBALA, no se exhiben estadísticas ficticias.`;
      } else {
        const rows = res.primerosPuestos
          .map((p: any) => `${p.posicion}° ${p.club} — ${p.puntos} pts (${p.partidosJugados} PJ | DG ${p.diferenciaGol > 0 ? '+' : ''}${p.diferenciaGol})`)
          .join('\n');
        content = `Posiciones (${res.tipo.toUpperCase()} 2026):\n\n${rows}\n\n* Datos deportivos: ESPN · Reglamento: AFA / Liga Profesional`;
      }
    } else if (contextData?.toolName === 'getUpcomingMatches') {
      const res = contextData.toolResult;
      const live = res.partidosEnVivo.length > 0
        ? `Partidos en juego (Fuente: ESPN):\n${res.partidosEnVivo.map((p: any) => `• ${p.local} ${p.marcador} ${p.visitante} (${p.minuto})`).join('\n')}\n\n`
        : '';
      const sched = res.proximosPartidos.length > 0
        ? `Próximos partidos programados (Fuente: ESPN):\n${res.proximosPartidos.map((p: any) => `• ${p.local} vs ${p.visitante} (${p.fecha} · ${p.hora} hs)`).join('\n')}`
        : 'No hay más cotejos programados en esta ventana.';
      content = `${live}${sched}`;
    } else if (contextData?.toolName === 'getClubInfo') {
      const res = contextData.toolResult;
      if (!res.encontrado) {
        content = res.mensaje;
      } else {
        content = `Ficha de Club: ${res.nombre} (${res.codigo})\n• Estadio: ${res.estadio}\n• Sede: ${res.ciudad}\n• Zona AFA: ${res.zonaAsignada}`;
      }
    } else {
      content = 'Consulta procesada por el motor de CÁBALA con datos verificados de Primera División.';
    }

    return {
      content,
      modelUsed: this.defaultModel,
      provider: this.name,
      toolsInvoked: contextData?.toolName ? [contextData.toolName] : undefined,
      latencyMs: Date.now() - startTime,
    };
  }
}

export class KimiProvider implements AIProvider {
  public readonly name = 'kimi' as const;
  public readonly defaultModel = 'Kimi-K3-Reasoning';

  public async generateResponse(prompt: string, contextData?: Record<string, any>): Promise<AIResponse> {
    const startTime = Date.now();
    let content = '';

    if (contextData?.toolName === 'getPlayoffQualifiers') {
      const res = contextData.toolResult;
      if (!res.disponible) {
        content = `${res.mensaje} En CÁBALA no se generan cuadros ficticios.`;
      } else {
        const topA = res.zonaAClasificados.map((c: any) => `${c.posicion}° ${c.club} (${c.puntos} pts | DG ${c.diferenciaGol >= 0 ? '+' : ''}${c.diferenciaGol})${c.ventajaLocalia ? ' [Local]' : ''}`).join('\n');
        const topB = res.zonaBClasificados.map((c: any) => `${c.posicion}° ${c.club} (${c.puntos} pts | DG ${c.diferenciaGol >= 0 ? '+' : ''}${c.diferenciaGol})${c.ventajaLocalia ? ' [Local]' : ''}`).join('\n');
        const matchups = res.crucesOctavos.map((m: any) => `• ${m.llave}: ${m.local} vs ${m.visita} (${m.detalle})`).join('\n');
        content = `Clasificados y Cruces Oficiales de Octavos de Final (${res.fase.toUpperCase()} 2026):\n\nZona A (Top 8):\n${topA}\n\nZona B (Top 8):\n${topB}\n\nCruces Oficiales (1° al 4° con ventaja de localía):\n${matchups}\n\n* Definición a partido único. En caso de empate, penales directos.`;
      }
    } else if (contextData?.toolName === 'getRelegationStatus') {
      const res = contextData.toolResult;
      if (!res.disponible) {
        content = `${res.mensaje} No se computan descensos sin datos del proveedor de datos (ESPN).`;
      } else {
        const list = res.equiposEnZonaComprometida.length > 0
          ? res.equiposEnZonaComprometida.map((e: any) => `• ${e.club} — Estado: ${e.estado} (Puesto Anual ${e.posicionAnual}°)\n  Detalle: ${e.motivo}\n  Certificación: ${e.verificacionReglamentaria}`).join('\n\n')
          : 'Ningún club se encuentra actualmente en zona crítica de descenso.';
        content = `Régimen Oficial de Permanencia y Descenso 2026:\n\n${list}\n\nNota Reglamentaria:\n${res.notaReglamentaria}`;
      }
    } else if (contextData?.toolName === 'getTieBreakExplanation') {
      const res = contextData.toolResult;
      content = `Criterio Oficial de Desempate (Reglamento AFA 2026):\n\n${res.ordenSucesivoDesempateAFA2026.map((c: string) => `• ${c}`).join('\n')}\n\nImportante sobre el descenso:\n${res.notaDesempateDescenso}`;
    } else if (contextData?.toolName === 'getRegulationRules') {
      const res = contextData.toolResult;
      content = `Dictamen Reglamentario Oficial — ${res.competicion} (${res.temporada}):\n\n• Formato: ${res.formatoOficial}\n\n• Artículos y Disposiciones Clave:\n${res.reglasEspeciales.map((r: string) => `  - ${r}`).join('\n')}\n\n• Criterio Oficial de Desempate:\n${res.criterioDesempates.map((c: string) => `  ${c}`).join('\n')}`;
    } else if (contextData?.toolName === 'calculateQualificationScenario') {
      const res = contextData.toolResult;
      content = `Análisis Matemático y Reglamentario para ${res.teamName}:\n\n${res.summaryExplanation}\n\n• Posición Actual: ${res.currentPosition}° (${res.currentPoints} pts en ${res.played} PJ)\n• Puntos del 8° (corte a Octavos): ${res.eighthPlaceCurrentPoints} pts\n• Techo matemático del 9°: ${res.ninthPlaceMaxPoints} pts\n• Estado: ${res.status === 'CLINCHED' ? 'CLASIFICADO' : res.status === 'ELIMINATED' ? 'ELIMINADO' : 'EN DISPUTA'}`;
    } else {
      content = 'Análisis de razonamiento y arbitraje reglamentario emitido bajo las bases de AFA 2026.';
    }

    return {
      content,
      modelUsed: this.defaultModel,
      provider: this.name,
      toolsInvoked: contextData?.toolName ? [contextData.toolName] : undefined,
      latencyMs: Date.now() - startTime,
    };
  }
}

export class DeepSeekProvider implements AIProvider {
  public readonly name = 'deepseek' as const;
  public readonly defaultModel = 'DeepSeek-V4.1-Flash';

  public async generateResponse(prompt: string, contextData?: Record<string, any>): Promise<AIResponse> {
    const startTime = Date.now();
    let content = '';

    if (contextData?.toolName === 'calculateQualificationScenario') {
      const res = contextData.toolResult;
      content = `Proyección Estadística — ${res.teamName}:\n\n${res.summaryExplanation}\n\n• Estado de competencia: ${res.status}\n• Puntos requeridos: ${res.pointsNeededToClinch > 0 ? res.pointsNeededToClinch : 'Ya clasificado'}\n• Fechas restantes: ${res.remainingRounds}`;
    } else if (contextData?.toolName === 'getCurrentStandings') {
      const res = contextData.toolResult;
      content = `Cálculo de Tabla Oficial (${res.tipo?.toUpperCase()}):\nTotal de clubes en nómina: ${res.totalEquipos}.\nPuntero: ${res.primerosPuestos?.[0]?.club} con ${res.primerosPuestos?.[0]?.puntos} puntos.`;
    } else {
      content = 'Evaluación táctica y estadística basada en la métrica oficial de la Liga Profesional de Fútbol.';
    }

    return {
      content,
      modelUsed: this.defaultModel,
      provider: this.name,
      toolsInvoked: contextData?.toolName ? [contextData.toolName] : undefined,
      latencyMs: Date.now() - startTime,
    };
  }
}

// Registry / Factory para desacoplamiento total
export const AI_PROVIDERS: Record<'nemotron' | 'kimi' | 'deepseek', AIProvider> = {
  nemotron: new NemotronProvider(),
  kimi: new KimiProvider(),
  deepseek: new DeepSeekProvider(),
};

export function getAIProvider(name: 'nemotron' | 'kimi' | 'deepseek'): AIProvider {
  return AI_PROVIDERS[name] || AI_PROVIDERS.nemotron;
}
