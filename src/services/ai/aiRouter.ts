import { AIResponse, getAIProvider } from './aiProvider';
import { cabalaFootballTools } from './aiTools';

export type AIModelTarget = 'fast' | 'reasoning' | 'tactical';

/**
 * AI Router
 * Desacoplado: Dirige la consulta al proveedor correspondiente (Nemotron, Kimi o DeepSeek)
 * GARANTÍA DE AUDITORÍA:
 * 1. NUNCA calcula por su cuenta clasificaciones si existe una función determinista.
 * 2. Consulta obligatoriamente cabalaFootballTools antes de responder.
 * 3. La IA actúa como explicador e intérprete riguroso de los datos oficiales.
 */
export class AIRouter {
  private activeProviderName: 'nemotron' | 'kimi' | 'deepseek' = 'nemotron';

  public setProvider(provider: 'nemotron' | 'kimi' | 'deepseek') {
    this.activeProviderName = provider;
  }

  public getProviderName() {
    return this.activeProviderName;
  }

  public async askCabala(userQuestion: string): Promise<AIResponse> {
    const lower = userQuestion.toLowerCase();

    let toolResult: any = null;
    let toolName = 'none';
    let chosenProvider: 'nemotron' | 'kimi' | 'deepseek' = 'nemotron';

    // 1. Detección de intención y ejecución obligatoria de herramientas deterministas
    if (
      lower.includes('octavos') ||
      lower.includes('playoff') ||
      lower.includes('clasificando a octavos') ||
      lower.includes('quien clasifica') ||
      lower.includes('quién clasifica') ||
      lower.includes('cruces')
    ) {
      // Cruces y clasificados oficiales a Octavos
      toolName = 'getPlayoffQualifiers';
      const phase = lower.includes('apertura') ? 'apertura' : 'clausura';
      toolResult = await cabalaFootballTools.getPlayoffQualifiers({ phase });
      chosenProvider = 'kimi';
    } else if (
      lower.includes('descenso') ||
      lower.includes('permanencia') ||
      lower.includes('quien desciende') ||
      lower.includes('quién desciende') ||
      lower.includes('zona de descenso')
    ) {
      // Estado de descenso con validación reglamentaria
      toolName = 'getRelegationStatus';
      toolResult = await cabalaFootballTools.getRelegationStatus();
      chosenProvider = 'kimi';
    } else if (
      lower.includes('desempate') ||
      lower.includes('empate') ||
      lower.includes('como se define') ||
      lower.includes('cómo se define')
    ) {
      // Criterios oficiales de desempate en fase zonal o descenso
      toolName = 'getTieBreakExplanation';
      toolResult = cabalaFootballTools.getTieBreakExplanation();
      chosenProvider = 'kimi';
    } else if (
      lower.includes('necesita') ||
      lower.includes('para clasificar') ||
      lower.includes('chances') ||
      lower.includes('puede clasificar')
    ) {
      // Cálculo determinista de clasificación
      toolName = 'calculateQualificationScenario';
      const words = userQuestion.split(' ');
      const queryClub = words.find((w) => w.length > 3 && !['necesita', 'para', 'clasificar', 'cuantos', 'puntos', 'club', 'equipo'].includes(w.toLowerCase())) || 'River';
      toolResult = await cabalaFootballTools.calculateQualificationScenario({ teamQuery: queryClub });
      chosenProvider = 'kimi'; // Razonamiento sobre el cálculo
    } else if (
      lower.includes('tabla') ||
      lower.includes('posicion') ||
      lower.includes('posiciones') ||
      lower.includes('primero') ||
      lower.includes('puntero') ||
      lower.includes('puntos') ||
      lower.includes('libertadores') ||
      lower.includes('sudamericana')
    ) {
      toolName = 'getCurrentStandings';
      const type = lower.includes('promedio')
        ? 'promedios'
        : lower.includes('apertura')
        ? 'apertura'
        : lower.includes('anual')
        ? 'anual'
        : 'clausura';
      toolResult = await cabalaFootballTools.getCurrentStandings({ type });
      chosenProvider = 'nemotron';
    } else if (
      lower.includes('partido') ||
      lower.includes('proximo') ||
      lower.includes('próximo') ||
      lower.includes('hora') ||
      lower.includes('fecha') ||
      lower.includes('en vivo') ||
      lower.includes('cuando juega') ||
      lower.includes('cuándo juega')
    ) {
      toolName = 'getUpcomingMatches';
      toolResult = await cabalaFootballTools.getUpcomingMatches();
      chosenProvider = 'nemotron';
    } else if (
      lower.includes('reglamento') ||
      lower.includes('formato') ||
      lower.includes('recopa') ||
      lower.includes('trofeo de campeones') ||
      lower.includes('bicampeon') ||
      lower.includes('bicampeón')
    ) {
      toolName = 'getRegulationRules';
      let compId = 'apertura';
      if (lower.includes('recopa')) compId = 'recopaDeCampeones';
      else if (lower.includes('trofeo')) compId = 'trofeoDeCampeones';
      else if (lower.includes('supercopa internacional')) compId = 'supercopaInternacional';
      else if (lower.includes('supercopa')) compId = 'supercopaArgentina';
      else if (lower.includes('copa argentina')) compId = 'copaArgentina';
      else if (lower.includes('anual') || lower.includes('campeon de liga')) compId = 'anual';
      else if (lower.includes('promedio')) compId = 'promedios';
      else if (lower.includes('clausura')) compId = 'clausura';

      toolResult = cabalaFootballTools.getRegulationRules({ competitionId: compId });
      chosenProvider = 'kimi';
    } else {
      toolName = 'getClubInfo';
      const words = userQuestion.split(' ');
      const candidateClub = words.find((w) => w.length > 3) || 'Boca';
      toolResult = await cabalaFootballTools.getClubInfo({ query: candidateClub });
      chosenProvider = 'nemotron';
    }

    // 2. Invocar el proveedor correspondiente mediante la interfaz AIProvider desacoplada
    const providerInstance = getAIProvider(chosenProvider);
    return await providerInstance.generateResponse(userQuestion, {
      toolName,
      toolResult,
    });
  }
}

export const aiRouter = new AIRouter();
