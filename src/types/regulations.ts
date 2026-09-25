import { StandingRow, PromediosRow, TableType } from './football';

export interface HeadToHeadMatch {
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
}

export interface CompetitionRegulationInfo {
  id: string;
  seasonYear: string;
  name: string;
  shortName: string;
  status: 'disputing' | 'upcoming' | 'finished';
  formatDescription: string;
  structure: {
    totalClubs: number;
    zones?: number;
    clubsPerZone?: number;
    fixtureRounds?: number;
    playoffRounds?: string[];
  };
  specialRules: string[];
}

export const OFFICIAL_TOURNAMENTS_REGULATION: Record<string, CompetitionRegulationInfo> = {
  apertura: {
    id: 'apertura',
    seasonYear: '2026',
    name: 'Torneo Apertura 2026',
    shortName: 'Apertura',
    status: 'disputing',
    formatDescription:
      '30 clubes divididos en dos zonas de 15 (Zona A y Zona B). 16 fechas de fase de zonas (14 partidos dentro de la zona + clásicos e interzonales). Los 8 primeros de cada zona acceden a los Octavos de Final.',
    structure: {
      totalClubs: 30,
      zones: 2,
      clubsPerZone: 15,
      fixtureRounds: 16,
      playoffRounds: ['Octavos de Final', 'Cuartos de Final', 'Semifinales', 'Final'],
    },
    specialRules: [
      'Octavos de final a partido único con localía al mejor ubicado en la zona (1A vs 8B, 1B vs 8A, etc.).',
      'Desempate en playoffs: 90 min reglamentarios → tiempo extra de 30 min → tiros desde el punto del penal.',
      'La final se juega en sede neutral designada por la Liga Profesional.',
      'El Campeón adquiere la plaza directa (Argentina 1) a la Copa Libertadores 2027.',
    ],
  },
  clausura: {
    id: 'clausura',
    seasonYear: '2026',
    name: 'Torneo Clausura 2026',
    shortName: 'Clausura',
    status: 'upcoming',
    formatDescription:
      'Misma estructura general del Apertura con localías invertidas en la fase regular. Clasifican los 8 primeros de cada zona a playoffs.',
    structure: {
      totalClubs: 30,
      zones: 2,
      clubsPerZone: 15,
      fixtureRounds: 16,
      playoffRounds: ['Octavos de Final', 'Cuartos de Final', 'Semifinales', 'Final'],
    },
    specialRules: [
      'Inversión exacta de las localías respecto al programa del Torneo Apertura.',
      'REGLA OFICIAL DE PERMANENCIA: Si un club finaliza en zona de descenso o debe disputar un desempate por descenso en la Tabla Anual o Promedios, NO puede disputar la fase final del Clausura; su vacante es otorgada al siguiente equipo mejor ubicado en su zona.',
      'El Campeón obtiene cupo directo a la Copa Libertadores 2027.',
    ],
  },
  anual: {
    id: 'anual',
    seasonYear: '2026',
    name: 'Tabla General Anual 2026',
    shortName: 'Tabla Anual',
    status: 'disputing',
    formatDescription:
      'Acumula estrictamente los puntos obtenidos durante la fase regular de 16 fechas del Apertura más la fase regular del Clausura (32 partidos oficiales en total). Los playoffs no suman puntos para la Tabla Anual.',
    structure: {
      totalClubs: 30,
      fixtureRounds: 32,
    },
    specialRules: [
      'El equipo que finaliza en el 1° puesto de la Tabla Anual es proclamado CAMPEÓN DE LIGA 2026.',
      'Otorga plazas a la Copa Libertadores 2027 a los mejores clasificados no campeones de Apertura/Clausura/Copa Argentina.',
      'Otorga plazas a la Copa Sudamericana 2027 a los siguientes 6 equipos mejor posicionados.',
      'El último clasificado desciende a la Primera Nacional (sujeto a desempate si hay igualdad en puntos).',
    ],
  },
  promedios: {
    id: 'promedios',
    seasonYear: '2026',
    name: 'Tabla de Promedios de Descenso',
    shortName: 'Promedios',
    status: 'disputing',
    formatDescription:
      'Cociente entre el total de puntos obtenidos y los partidos disputados a lo largo de las últimas 3 temporadas de Primera División (2024, 2025 y 2026).',
    structure: {
      totalClubs: 30,
    },
    specialRules: [
      'El club con el coeficiente más bajo al término de la temporada regular desciende a la Primera Nacional.',
      'Si coincide el club que finaliza último en la Tabla Anual con el último de los Promedios, el club desciende por la vía de Promedios y la plaza de descenso por Tabla Anual se traslada al siguiente peor ubicado de la Tabla General Anual (puesto 29).',
      'En caso de igualdad en el último puesto de la tabla, se disputa un partido de desempate en cancha neutral dentro de las 72 horas.',
    ],
  },
  copaArgentina: {
    id: 'copaArgentina',
    seasonYear: '2026',
    name: 'Copa Argentina 2026',
    shortName: 'Copa Argentina',
    status: 'disputing',
    formatDescription:
      'Competición federal de eliminación directa a partido único que reúne a clubes de todas las categorías del fútbol argentino (Primera División, Primera Nacional, B Metropolitana, Federal A y Primera C).',
    structure: {
      totalClubs: 64,
      playoffRounds: ['32avos', '16avos', 'Octavos', 'Cuartos', 'Semifinales', 'Final'],
    },
    specialRules: [
      'El Campeón clasifica a la Copa Libertadores 2027.',
      'Disputa la Supercopa Argentina contra el Campeón del Trofeo de Campeones.',
      'Clasifica a la Recopa de Campeones.',
    ],
  },
  trofeoDeCampeones: {
    id: 'trofeoDeCampeones',
    seasonYear: '2026',
    name: 'Trofeo de Campeones 2026',
    shortName: 'Trofeo de Campeones',
    status: 'upcoming',
    formatDescription: 'Final anual entre el Campeón del Torneo Apertura y el Campeón del Torneo Clausura.',
    structure: {
      totalClubs: 2,
    },
    specialRules: [
      'Partido único en cancha neutral con alargue y penales.',
      'REGLA DE BICAMPEÓN: Si el mismo club gana el Apertura y el Clausura, el segundo finalista surge de un partido de desempate entre los subcampeones del Apertura y Clausura.',
    ],
  },
  supercopaArgentina: {
    id: 'supercopaArgentina',
    seasonYear: '2026',
    name: 'Supercopa Argentina',
    shortName: 'Supercopa Arg.',
    status: 'upcoming',
    formatDescription: 'Cotejo oficial único entre el Campeón del Trofeo de Campeones y el Campeón de la Copa Argentina.',
    structure: {
      totalClubs: 2,
    },
    specialRules: [
      'Si el mismo equipo gana el Trofeo de Campeones y la Copa Argentina, su rival será el subcampeón de la Copa Argentina.',
    ],
  },
  supercopaInternacional: {
    id: 'supercopaInternacional',
    seasonYear: '2026',
    name: 'Supercopa Internacional',
    shortName: 'Supercopa Int.',
    status: 'upcoming',
    formatDescription: 'Encuentro anual entre el Campeón del Trofeo de Campeones y el Campeón de Liga (1° de la Tabla Anual).',
    structure: {
      totalClubs: 2,
    },
    specialRules: [
      'Si coincide el Campeón del Trofeo de Campeones con el 1° de la Tabla Anual, la vacante pasa al 2° de la Tabla Anual.',
    ],
  },
  recopaDeCampeones: {
    id: 'recopaDeCampeones',
    seasonYear: '2027',
    name: 'Recopa de Campeones (Triangular Oficial)',
    shortName: 'Recopa de Campeones',
    status: 'upcoming',
    formatDescription:
      'Triangular de 3 clubes campeones: Ganador Copa Argentina, Ganador Supercopa Argentina y Ganador Supercopa Internacional.',
    structure: {
      totalClubs: 3,
    },
    specialRules: [
      'Partido 1: Ganador Supercopa Argentina vs Ganador Supercopa Internacional.',
      'Partido 2: Ganador Copa Argentina vs Perdedor Partido 1.',
      'Partido 3: Ganador Copa Argentina vs Ganador Partido 1.',
      'Definición de campeón por sistema de puntos y desempate reglamentario.',
    ],
  },
};
