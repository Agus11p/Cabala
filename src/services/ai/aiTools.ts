import { footballService } from '../footballService';
import { OFFICIAL_TOURNAMENTS_REGULATION } from '../../types/regulations';
import {
  RuleSet2026,
  calculateQualificationScenario,
  generateRoundOf16Matchups,
  evaluateRelegation,
  StandingRow,
} from '../competitionRules';

/**
 * CÁBALA Grounded Internal Tools
 * La IA ejecuta estas funciones deterministas para consultar datos REALES.
 * NUNCA se inventan datos ni probabilidades artificiales.
 */
export const cabalaFootballTools = {
  // 1. Obtener la tabla de posiciones (anual, clausura, apertura o promedios)
  async getCurrentStandings(args: { type?: 'clausura' | 'apertura' | 'anual' | 'promedios' }) {
    const res = await footballService.getStandings(args.type || 'anual');
    if (!res.available) {
      return {
        disponible: false,
        mensaje: res.message || 'Datos no disponibles en el proveedor de datos (ESPN).',
      };
    }
    return {
      disponible: true,
      tipo: res.type,
      totalEquipos: res.data.length,
      primerosPuestos: res.data.slice(0, 8).map((r: any) => ({
        posicion: r.position,
        club: r.team?.name || r.teamId,
        puntos: r.points ?? r.totalPoints,
        partidosJugados: r.played ?? r.totalPlayed,
        diferenciaGol: r.goalDiff ?? 0,
      })),
      zonaDescenso: res.data.slice(-2).map((r: any) => ({
        posicion: r.position,
        club: r.team?.name || r.teamId,
        puntos: r.points ?? r.totalPoints,
      })),
    };
  },

  // 2. Obtener los 8 clasificados a Octavos de Final de Zona A y Zona B y sus cruces oficiales
  async getPlayoffQualifiers(args?: { phase?: 'apertura' | 'clausura' }) {
    const phase = args?.phase || 'clausura';
    const res = await footballService.getStandings(phase);

    if (!res.available || !res.zoneA || !res.zoneB) {
      return {
        disponible: false,
        mensaje: 'Tablas de zona no disponibles en el proveedor de datos (ESPN).',
      };
    }

    const zoneA = res.zoneA as StandingRow[];
    const zoneB = res.zoneB as StandingRow[];

    const qualifiersA = zoneA.slice(0, 8).map((t, idx) => ({
      posicion: idx + 1,
      club: t.team?.name || t.teamId,
      puntos: t.points,
      diferenciaGol: t.goalDiff,
      ventajaLocalia: idx < 4,
    }));

    const qualifiersB = zoneB.slice(0, 8).map((t, idx) => ({
      posicion: idx + 1,
      club: t.team?.name || t.teamId,
      puntos: t.points,
      diferenciaGol: t.goalDiff,
      ventajaLocalia: idx < 4,
    }));

    const matchups = generateRoundOf16Matchups(zoneA, zoneB, { isClausura: phase === 'clausura' });

    return {
      disponible: true,
      fase: phase,
      zonaAClasificados: qualifiersA,
      zonaBClasificados: qualifiersB,
      crucesOctavos: matchups.map((m) => ({
        llave: `Llave ${m.matchNumber}`,
        local: m.homeTeam.team?.name || m.homeTeam.teamId,
        visita: m.awayTeam.team?.name || m.awayTeam.teamId,
        detalle: m.venueNote,
      })),
    };
  },

  // 3. Evaluar el estado de permanencia y descenso en base a datos reales
  async getRelegationStatus() {
    const standingsRes = await footballService.getStandings('anual');

    if (!standingsRes.available || !standingsRes.data || standingsRes.data.length === 0) {
      return {
        disponible: false,
        mensaje: 'Datos no disponibles en el proveedor de datos (ESPN) para computar descenso.',
      };
    }

    const annualRows = standingsRes.data as StandingRow[];
    // La tabla de promedios no es provista por ESPN; no se inventan promedios simulados.
    const evaluations = evaluateRelegation(annualRows, [], false);

    const enRiesgo = evaluations
      .filter((e) => e.status === 'EN_RIESGO' || e.status === 'DESCENSO_DIRECTO' || e.status === 'DESEMPATE')
      .map((e) => {
        const teamRow = annualRows.find((r) => r.teamId === e.teamId);
        return {
          club: teamRow?.team?.name || `Club ${e.teamId}`,
          posicionAnual: e.annualTablePosition,
          estado: e.status,
          motivo: e.relegationReason,
          verificacionReglamentaria: e.verificationStatus || 'CERTIFICADA',
        };
      });

    return {
      disponible: true,
      totalClubesEvaluados: annualRows.length,
      equiposEnZonaComprometida: enRiesgo,
      notaReglamentaria: 'Régimen de dos descensos: uno por Tabla Anual (30°) y otro por Promedios (30°). La tabla de promedios se encuentra pendiente de disponibilidad en el proveedor; los descensos computados corresponden a la Tabla General Anual. Si el mismo club finaliza último en ambas, la regla de traslación al puesto 29° REQUIERE_VERIFICACIÓN_REGLAMENTARIA expresa de AFA.',
    };
  },

  // 4. Explicar criterios de desempate
  getTieBreakExplanation(args?: { criteria?: string }) {
    return {
      ordenSucesivoDesempateAFA2026: [
        '1. Mayor diferencia de goles general en la fase regular de la zona.',
        '2. Mayor cantidad de goles a favor en la fase regular.',
        '3. Enfrentamientos directos entre sí (Head to Head: puntos, diferencia de gol, goles a favor).',
        '4. Tabla de Fair Play (menor saldo de penalizaciones: amarilla -1, 2da amarilla -3, roja directa -5).',
        '5. Sorteo oficial realizado por la Liga Profesional / AFA (NUNCA se define al azar en la app).',
      ],
      notaDesempateDescenso: 'En caso de igualdad en puntos para el puesto de descenso (último puesto de Tabla Anual o Promedios), NO rige la diferencia de goles; se disputa obligatoriamente un partido de desempate en cancha neutral.',
    };
  },

  // 5. Obtener partidos en curso y próximos
  async getUpcomingMatches() {
    const matches = await footballService.getMatches();
    const live = matches.filter((m) => m.status === 'live');
    const scheduled = matches.filter((m) => m.status === 'scheduled');
    return {
      partidosEnVivo: live.map((m) => ({
        local: m.homeTeam?.name || m.homeTeamId,
        visitante: m.awayTeam?.name || m.awayTeamId,
        marcador: `${m.homeScore ?? 0} - ${m.awayScore ?? 0}`,
        minuto: m.minute ? `${m.minute}'` : 'En juego',
      })),
      proximosPartidos: scheduled.slice(0, 5).map((m) => ({
        local: m.homeTeam?.name || m.homeTeamId,
        visitante: m.awayTeam?.name || m.awayTeamId,
        fecha: m.date,
        hora: m.time,
        torneo: m.tournament,
      })),
    };
  },

  // 6. Consultar datos de un club
  async getClubInfo(args: { query: string }) {
    const teams = await footballService.getTeams();
    const match = teams.find(
      (t) =>
        t.name.toLowerCase().includes(args.query.toLowerCase()) ||
        t.shortName.toLowerCase().includes(args.query.toLowerCase()) ||
        t.code.toLowerCase().includes(args.query.toLowerCase())
    );
    if (!match) {
      return { encontrado: false, mensaje: `No se encontró club que coincida con "${args.query}"` };
    }
    return {
      encontrado: true,
      id: match.id,
      nombre: match.name,
      nombreCorto: match.shortName,
      codigo: match.code,
      estadio: match.stadium,
      ciudad: match.city,
      zonaAsignada: match.zone || 'A / B',
    };
  },

  // 7. Consultar reglamento oficial de una competición o temporada
  getRegulationRules(args: { competitionId?: string; season?: string }) {
    const compId = args.competitionId || 'anual';
    const reg = OFFICIAL_TOURNAMENTS_REGULATION[compId] || OFFICIAL_TOURNAMENTS_REGULATION['apertura'];
    return {
      temporada: reg.seasonYear,
      competicion: reg.name,
      formatoOficial: reg.formatDescription,
      reglasEspeciales: reg.specialRules,
      estructura: reg.structure,
      puntosPorVictoria: RuleSet2026.pointsForWin,
      criterioDesempates: [
        '1. Mayor diferencia de goles general',
        '2. Mayor cantidad de goles a favor general',
        '3. Enfrentamientos directos entre sí (Head to Head: puntos, dif de gol, goles a favor)',
        '4. Fair Play disciplinario (menor cantidad de puntos por amonestaciones y expulsiones)',
        '5. Sorteo por el Comité Ejecutivo de AFA (sin asignación aleatoria automática)',
      ],
    };
  },

  // 8. Calcular qué necesita un equipo para clasificar (Cálculo 100% determinista)
  async calculateQualificationScenario(args: { teamQuery: string; tableType?: 'clausura' | 'apertura' }) {
    const standingsRes = await footballService.getStandings(args.tableType || 'clausura');
    if (!standingsRes.available || !standingsRes.data || standingsRes.data.length === 0) {
      return {
        disponible: false,
        mensaje: 'No hay tabla oficial disponible para calcular el escenario matemático.',
      };
    }

    const rows = standingsRes.data as StandingRow[];
    try {
      const result = calculateQualificationScenario(rows, args.teamQuery, 16);
      return {
        disponible: true,
        ...result,
      };
    } catch (err: any) {
      return {
        disponible: false,
        mensaje: err.message,
      };
    }
  },
};
