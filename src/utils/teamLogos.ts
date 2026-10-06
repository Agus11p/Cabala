/**
 * Catálogo Canónico de Escudos Oficiales de la Primera División de Argentina (AFA 2026).
 * Provee URLs oficiales de alta resolución (ESPN CDN 500x500 PNG) y resolución de contingencia.
 */

export interface TeamIdentity {
  id: string;
  name: string;
  shortName: string;
  code: string;
  primaryColor: string;
  secondaryColor: string;
  logo: string;
}

export const OFFICIAL_ARGENTINA_TEAMS: Record<string, TeamIdentity> = {
  // 5: Boca Juniors
  '5': {
    id: '5',
    name: 'Boca Juniors',
    shortName: 'Boca',
    code: 'CABJ',
    primaryColor: '#002B49',
    secondaryColor: '#FFB81C',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/5.png',
  },
  // 16: River Plate
  '16': {
    id: '16',
    name: 'River Plate',
    shortName: 'River',
    code: 'CARP',
    primaryColor: '#FFFFFF',
    secondaryColor: '#E60000',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/16.png',
  },
  // 15: Racing Club
  '15': {
    id: '15',
    name: 'Racing Club',
    shortName: 'Racing',
    code: 'RAC',
    primaryColor: '#75AADB',
    secondaryColor: '#FFFFFF',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/15.png',
  },
  // 11: Independiente
  '11': {
    id: '11',
    name: 'Independiente',
    shortName: 'Independiente',
    code: 'CAI',
    primaryColor: '#D80000',
    secondaryColor: '#FFFFFF',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/11.png',
  },
  // 18: San Lorenzo
  '18': {
    id: '18',
    name: 'San Lorenzo',
    shortName: 'San Lorenzo',
    code: 'CASLA',
    primaryColor: '#002B49',
    secondaryColor: '#C41230',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/18.png',
  },
  // 21: Vélez Sarsfield
  '21': {
    id: '21',
    name: 'Vélez Sarsfield',
    shortName: 'Vélez',
    code: 'CAVS',
    primaryColor: '#003399',
    secondaryColor: '#FFFFFF',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/21.png',
  },
  // 8: Estudiantes de La Plata
  '8': {
    id: '8',
    name: 'Estudiantes de La Plata',
    shortName: 'Estudiantes',
    code: 'EDLP',
    primaryColor: '#DC0000',
    secondaryColor: '#FFFFFF',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/8.png',
  },
  // 9: Gimnasia La Plata
  '9': {
    id: '9',
    name: 'Gimnasia La Plata',
    shortName: 'Gimnasia',
    code: 'GELP',
    primaryColor: '#002B49',
    secondaryColor: '#FFFFFF',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/9.png',
  },
  // 10: Huracán
  '10': {
    id: '10',
    name: 'Huracán',
    shortName: 'Huracán',
    code: 'CAH',
    primaryColor: '#FFFFFF',
    secondaryColor: '#E60000',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/10.png',
  },
  // 12: Lanús
  '12': {
    id: '12',
    name: 'Lanús',
    shortName: 'Lanús',
    code: 'LAN',
    primaryColor: '#800020',
    secondaryColor: '#FFFFFF',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/12.png',
  },
  // 14: Newell's Old Boys
  '14': {
    id: '14',
    name: "Newell's Old Boys",
    shortName: "Newell's",
    code: 'NOB',
    primaryColor: '#E60000',
    secondaryColor: '#000000',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/14.png',
  },
  // 17: Rosario Central
  '17': {
    id: '17',
    name: 'Rosario Central',
    shortName: 'R. Central',
    code: 'CARC',
    primaryColor: '#002B7F',
    secondaryColor: '#FFCC00',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/17.png',
  },
  // 19: Talleres (Córdoba)
  '19': {
    id: '19',
    name: 'Talleres (Córdoba)',
    shortName: 'Talleres',
    code: 'CAT',
    primaryColor: '#0C2340',
    secondaryColor: '#FFFFFF',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/19.png',
  },
  // 4: Belgrano (Córdoba)
  '4': {
    id: '4',
    name: 'Belgrano (Córdoba)',
    shortName: 'Belgrano',
    code: 'CAB',
    primaryColor: '#75AADB',
    secondaryColor: '#FFFFFF',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/4.png',
  },
  // 2975: Instituto (Córdoba)
  '2975': {
    id: '2975',
    name: 'Instituto (Córdoba)',
    shortName: 'Instituto',
    code: 'IACC',
    primaryColor: '#E60000',
    secondaryColor: '#FFFFFF',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/2975.png',
  },
  // 3: Argentinos Juniors
  '3': {
    id: '3',
    name: 'Argentinos Juniors',
    shortName: 'Argentinos',
    code: 'AAAJ',
    primaryColor: '#DC0000',
    secondaryColor: '#FFFFFF',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/3.png',
  },
  // 20: Unión (Santa Fe)
  '20': {
    id: '20',
    name: 'Unión (Santa Fe)',
    shortName: 'Unión',
    code: 'CAU',
    primaryColor: '#DC0000',
    secondaryColor: '#FFFFFF',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/20.png',
  },
  // 7764: Platense
  '7764': {
    id: '7764',
    name: 'Platense',
    shortName: 'Platense',
    code: 'CAP',
    primaryColor: '#5C381E',
    secondaryColor: '#FFFFFF',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/7764.png',
  },
  // 7767: Tigre
  '7767': {
    id: '7767',
    name: 'Tigre',
    shortName: 'Tigre',
    code: 'CAT',
    primaryColor: '#002B7F',
    secondaryColor: '#E60000',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/7767.png',
  },
  // 235: Banfield
  '235': {
    id: '235',
    name: 'Banfield',
    shortName: 'Banfield',
    code: 'CAB',
    primaryColor: '#008000',
    secondaryColor: '#FFFFFF',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/235.png',
  },
  // 8950: Defensa y Justicia
  '8950': {
    id: '8950',
    name: 'Defensa y Justicia',
    shortName: 'Defensa',
    code: 'DYJ',
    primaryColor: '#008000',
    secondaryColor: '#FFCC00',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/8950.png',
  },
  // 9739: Aldosivi
  '9739': {
    id: '9739',
    name: 'Aldosivi',
    shortName: 'Aldosivi',
    code: 'ALDO',
    primaryColor: '#008000',
    secondaryColor: '#FFCC00',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/9739.png',
  },
  // 9744: Independiente Rivadavia
  '9744': {
    id: '9744',
    name: 'Independiente Rivadavia',
    shortName: 'Ind. Rivadavia',
    code: 'CSIR',
    primaryColor: '#002B7F',
    secondaryColor: '#FFFFFF',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/9744.png',
  },
  // 9785: Atlético Tucumán
  '9785': {
    id: '9785',
    name: 'Atlético Tucumán',
    shortName: 'Atl. Tucumán',
    code: 'CAT',
    primaryColor: '#75AADB',
    secondaryColor: '#FFFFFF',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/9785.png',
  },
  // 10060: Barracas Central
  '10060': {
    id: '10060',
    name: 'Barracas Central',
    shortName: 'Barracas',
    code: 'BAR',
    primaryColor: '#DC0000',
    secondaryColor: '#FFFFFF',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/10060.png',
  },
  // 10158: Sarmiento (Junín)
  '10158': {
    id: '10158',
    name: 'Sarmiento (Junín)',
    shortName: 'Sarmiento',
    code: 'CASJ',
    primaryColor: '#008000',
    secondaryColor: '#FFFFFF',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/10158.png',
  },
  // 11972: Gimnasia (Mendoza)
  '11972': {
    id: '11972',
    name: 'Gimnasia (Mendoza)',
    shortName: 'Gimnasia (M)',
    code: 'GYE',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/11972.png',
  },
  // 11989: Central Córdoba (Santiago del Estero)
  '11989': {
    id: '11989',
    name: 'Central Córdoba (Santiago del Estero)',
    shortName: 'Central Cba.',
    code: 'CCSE',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/11989.png',
  },
  // 17702: Deportivo Riestra
  '17702': {
    id: '17702',
    name: 'Deportivo Riestra',
    shortName: 'Riestra',
    code: 'RIE',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/17702.png',
  },
  // 19685: Estudiantes de Río Cuarto
  '19685': {
    id: '19685',
    name: 'Estudiantes de Río Cuarto',
    shortName: 'Estudiantes (RC)',
    code: 'ERC',
    primaryColor: '#75AADB',
    secondaryColor: '#FFFFFF',
    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/19685.png',
  },
};

// Aliases para búsqueda por código, nombre normalizado o variaciones
const TEAM_ALIASES: Record<string, string> = {
  // Boca
  boca: '5',
  bocajuniors: '5',
  cabj: '5',
  boc: '5',
  // River
  river: '16',
  riverplate: '16',
  carp: '16',
  riv: '16',
  // Racing
  racing: '15',
  racingclub: '15',
  rac: '15',
  // Independiente
  independiente: '11',
  cai: '11',
  ind: '11',
  // San Lorenzo
  sanlorenzo: '18',
  lorenzo: '18',
  casla: '18',
  slo: '18',
  // Vélez
  velez: '21',
  velezsarsfield: '21',
  cavs: '21',
  vel: '21',
  // Estudiantes LP
  estudiantes: '8',
  estudiantesdelaplata: '8',
  estudianteslp: '8',
  edlp: '8',
  // Gimnasia LP
  gimnasia: '9',
  gimnasialaplata: '9',
  gelp: '9',
  // Huracán
  huracan: '10',
  cah: '10',
  // Lanús
  lanus: '12',
  lan: '12',
  // Newell's
  newells: '14',
  newell: '14',
  nob: '14',
  // Rosario Central
  rosariocentral: '17',
  central: '17',
  carc: '17',
  cen: '17',
  // Talleres
  talleres: '19',
  tallerescordoba: '19',
  cat: '19',
  tal: '19',
  // Belgrano
  belgrano: '4',
  belgranocordoba: '4',
  cab: '4',
  // Instituto
  instituto: '2975',
  institutocordoba: '2975',
  iacc: '2975',
  // Argentinos
  argentinos: '3',
  argentinosjuniors: '3',
  aaaj: '3',
  // Unión
  union: '20',
  unionsantafe: '20',
  cau: '20',
  // Platense
  platense: '7764',
  cap: '7764',
  // Tigre
  tigre: '7767',
  // Banfield
  banfield: '235',
  // Defensa y Justicia
  defensa: '8950',
  defensayjusticia: '8950',
  dyj: '8950',
  // Aldosivi
  aldosivi: '9739',
  // Independiente Rivadavia
  independienterivadavia: '9744',
  indrivadavia: '9744',
  rivadavia: '9744',
  csir: '9744',
  // Atlético Tucumán
  atleticotucuman: '9785',
  tucuman: '9785',
  // Barracas Central
  barracas: '10060',
  barracascentral: '10060',
  // Sarmiento
  sarmiento: '10158',
  sarmientojunin: '10158',
  // Gimnasia Mendoza
  gimnasiamendoza: '11972',
  gye: '11972',
  // Central Córdoba
  centralcordoba: '11989',
  ccse: '11989',
  // Deportivo Riestra
  riestra: '17702',
  deportivoriestra: '17702',
  // Estudiantes Río Cuarto
  estudiantesriocuarto: '19685',
  estudiantesrc: '19685',
  erc: '19685',
};

/**
 * Normaliza un string para lookup: minúsculas, sin tildes ni caracteres especiales.
 */
function normalizeString(str?: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Resuelve la URL del escudo oficial en alta resolución para cualquier club de Primera División.
 */
export function getTeamOfficialLogo(
  teamId?: string,
  teamCode?: string,
  teamName?: string
): string | null {
  // 1. Búsqueda directa por ID oficial
  if (teamId && OFFICIAL_ARGENTINA_TEAMS[teamId]) {
    return OFFICIAL_ARGENTINA_TEAMS[teamId].logo;
  }

  // 2. Búsqueda por alias normalizado de ID
  const normId = normalizeString(teamId);
  if (normId && TEAM_ALIASES[normId] && OFFICIAL_ARGENTINA_TEAMS[TEAM_ALIASES[normId]]) {
    return OFFICIAL_ARGENTINA_TEAMS[TEAM_ALIASES[normId]].logo;
  }

  // 3. Búsqueda por código oficial
  const normCode = normalizeString(teamCode);
  if (normCode && TEAM_ALIASES[normCode] && OFFICIAL_ARGENTINA_TEAMS[TEAM_ALIASES[normCode]]) {
    return OFFICIAL_ARGENTINA_TEAMS[TEAM_ALIASES[normCode]].logo;
  }

  // 4. Búsqueda por nombre de club
  const normName = normalizeString(teamName);
  if (normName && TEAM_ALIASES[normName] && OFFICIAL_ARGENTINA_TEAMS[TEAM_ALIASES[normName]]) {
    return OFFICIAL_ARGENTINA_TEAMS[TEAM_ALIASES[normName]].logo;
  }

  // Si teamId es numérico, construir URL oficial ESPN
  if (teamId && /^\d+$/.test(teamId)) {
    return `https://a.espncdn.com/i/teamlogos/soccer/500/${teamId}.png`;
  }

  return null;
}

/**
 * Obtiene la identidad visual canónica (colores, siglas, nombres).
 */
export function getTeamIdentity(
  teamId?: string,
  teamCode?: string,
  teamName?: string
): TeamIdentity | null {
  const normId = normalizeString(teamId);
  const targetId =
    (teamId && OFFICIAL_ARGENTINA_TEAMS[teamId] ? teamId : null) ||
    TEAM_ALIASES[normId] ||
    TEAM_ALIASES[normalizeString(teamCode)] ||
    TEAM_ALIASES[normalizeString(teamName)];

  if (targetId && OFFICIAL_ARGENTINA_TEAMS[targetId]) {
    return OFFICIAL_ARGENTINA_TEAMS[targetId];
  }

  return null;
}
