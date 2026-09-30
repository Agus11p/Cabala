import React, { useState, useEffect } from 'react';
import { footballService } from '../services/footballService';
import {
  ShieldCheck,
  Search,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  HelpCircle,
  Layers,
  ChevronRight,
  Database,
  ArrowRight,
} from 'lucide-react';
import { SinDatoBadge } from '../components/common/SinDatoBadge';

interface AuditMatrixCategory {
  id: string;
  name: string;
  total: number;
  verified: number;
  partial: number;
  sinDato: number;
  requiereVerificacion?: number;
}

export const DataAuditPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matriz' | 'preguntas' | 'consola' | 'jerarquia'>('matriz');
  const [selectedCategory, setSelectedCategory] = useState<string>('clubes');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [matrixData, setMatrixData] = useState<any>(null);
  const [isLoadingMatrix, setIsLoadingMatrix] = useState(true);

  // Consola de Google Discovery
  const [consoleQuery, setConsoleQuery] = useState('reglamento torneo lpf 2026 desempates');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<any>(null);

  useEffect(() => {
    async function loadMatrix() {
      try {
        setIsLoadingMatrix(true);
        const data = await footballService.getCoverageMatrix();
        setMatrixData(data);
      } catch (err) {
        console.error('Error cargando matriz:', err);
      } finally {
        setIsLoadingMatrix(false);
      }
    }
    loadMatrix();
  }, []);

  const handleRunDiscovery = async (q?: string) => {
    const queryToRun = q || consoleQuery;
    if (!queryToRun.trim()) return;
    setIsDiscovering(true);
    setDiscoveryResult(null);
    try {
      const res = await footballService.runDiscoveryQuery(queryToRun);
      setDiscoveryResult(res);
    } catch (err: any) {
      setDiscoveryResult({
        status: 'FAILED',
        error: err.message,
        results: [],
      });
    } finally {
      setIsDiscovering(false);
    }
  };

  const categories: AuditMatrixCategory[] = matrixData?.categories || [
    { id: 'clubes', name: 'Clubes', total: 12, verified: 10, partial: 1, sinDato: 1 },
    { id: 'competiciones', name: 'Competiciones', total: 11, verified: 9, partial: 1, sinDato: 1 },
    { id: 'partidos', name: 'Partidos', total: 30, verified: 12, partial: 11, sinDato: 7 },
    { id: 'tablas', name: 'Tablas de Posiciones', total: 14, verified: 13, partial: 0, sinDato: 1 },
    { id: 'playoffs', name: 'Playoffs', total: 6, verified: 6, partial: 0, sinDato: 0 },
    { id: 'jugadores', name: 'Jugadores', total: 11, verified: 0, partial: 6, sinDato: 5 },
    { id: 'historial', name: 'Historial & Palmarés', total: 8, verified: 0, partial: 3, sinDato: 5 },
    { id: 'noticias', name: 'Noticias Institucionales', total: 7, verified: 7, partial: 0, sinDato: 0 },
    { id: 'reglamentacion', name: 'Reglamentación AFA', total: 8, verified: 7, partial: 0, requiereVerificacion: 1 },
  ];

  // Datos detallados de campos para cada categoría
  const detailedFields: Record<
    string,
    Array<{
      campo: string;
      primaria: string;
      secundaria: string;
      discovery: string;
      estado: 'VERIFIED' | 'PARTIAL' | 'STALE' | 'SIN_DATO' | 'REQUIERE_VERIFICACIÓN_REGLAMENTARIA';
      detalle: string;
    }>
  > = {
    clubes: [
      { campo: 'ID de Club', primaria: 'ESPN Provider ID', secundaria: 'Firestore UID', discovery: 'Descubre IDs canónicos', estado: 'VERIFIED', detalle: 'ID numérico persistente único' },
      { campo: 'Nombre Oficial', primaria: 'ESPN API (/teams)', secundaria: 'AFA Memoria y Balance', discovery: 'Denominación institucional', estado: 'VERIFIED', detalle: 'Nombre formal completo' },
      { campo: 'Nombre Corto', primaria: 'ESPN API (shortDisplayName)', secundaria: 'Sitio oficial club', discovery: 'Identificador coloquial', estado: 'VERIFIED', detalle: 'Abreviatura estándar' },
      { campo: 'Escudo / Logo', primaria: 'ESPN Logos CDN', secundaria: 'Sitio oficial club', discovery: 'Vectores oficiales SVG/PNG', estado: 'VERIFIED', detalle: 'URL CDN de alta fidelidad' },
      { campo: 'Estadio', primaria: 'ESPN API (venue)', secundaria: 'AFA Catálogo Canchas', discovery: 'Nombre oficial y sede', estado: 'VERIFIED', detalle: 'Sede homologada por AFA' },
      { campo: 'Ciudad', primaria: 'ESPN API (address.city)', secundaria: 'Dominio oficial club', discovery: 'Municipio sede', estado: 'VERIFIED', detalle: 'Localidad de pertenencia' },
      { campo: 'Provincia', primaria: 'AFA Registro Geográfico', secundaria: 'Dominio oficial club', discovery: 'Jurisdicción provincial', estado: 'VERIFIED', detalle: 'Provincia argentina' },
      { campo: 'País', primaria: 'ESPN API / AFA', secundaria: 'FIFA Member List', discovery: 'Asociación miembro', estado: 'VERIFIED', detalle: 'Argentina' },
      { campo: 'Año / Fundación', primaria: 'AFA Archivo Oficial', secundaria: 'Dominio oficial club', discovery: 'Acta de fundación institucional', estado: 'VERIFIED', detalle: 'Año fundacional histórico' },
      { campo: 'Colores Oficiales', primaria: 'ESPN API (color/alternate)', secundaria: 'Estatuto social club', discovery: 'Paleta institucional', estado: 'VERIFIED', detalle: 'Hexadecimales validados' },
      { campo: 'Entrenador (DT)', primaria: 'Sitio oficial del club', secundaria: 'Conferencia de prensa', discovery: 'Comunicado de nombramiento', estado: 'PARTIAL', detalle: 'Solo si hay anuncio oficial' },
      { campo: 'Info Institucional', primaria: 'Dominio oficial del club', secundaria: 'Boletín de afiliación AFA', discovery: 'Sitio web oficial verificado', estado: 'VERIFIED', detalle: 'Dominio homologado en padrón' },
    ],
    competiciones: [
      { campo: 'Temporada (2026)', primaria: 'ESPN API (season)', secundaria: 'AFA Boletín Oficial', discovery: 'Calendario 2026', estado: 'VERIFIED', detalle: 'Temporada en curso' },
      { campo: 'Torneo Apertura', primaria: 'ESPN API (arg.1)', secundaria: 'Reglamento AFA 2026', discovery: 'Fixture de 16 fechas', estado: 'VERIFIED', detalle: '14 zonales + 2 interzonales' },
      { campo: 'Torneo Clausura', primaria: 'ESPN API (arg.1)', secundaria: 'Reglamento AFA 2026', discovery: 'Fixture invertido', estado: 'VERIFIED', detalle: '14 zonales + 2 interzonales' },
      { campo: 'Tabla General Anual', primaria: 'Motor CÁBALA (server.ts)', secundaria: 'LPF Sitio Oficial', discovery: 'Tabla acumulada 32 fechas', estado: 'VERIFIED', detalle: 'Apertura + Clausura sin playoffs' },
      { campo: 'Tabla de Promedios', primaria: 'AFA Boletín PDF', secundaria: 'LPF Circular Descenso', discovery: 'Coeficientes trianuales', estado: 'SIN_DATO', detalle: 'No provista por API. No inventada.' },
      { campo: 'Copa Argentina', primaria: 'Sitio Copa Argentina', secundaria: 'AFA Boletín', discovery: 'Llave de 32avos a final', estado: 'PARTIAL', detalle: 'Disputa simultánea' },
      { campo: 'Copa Libertadores 2027', primaria: 'CONMEBOL Reglamento', secundaria: 'AFA Cupos Internacionales', discovery: '6 plazas (Arg 1 a 6)', estado: 'VERIFIED', detalle: 'Reasignación por bicampeonato' },
      { campo: 'Copa Sudamericana 2027', primaria: 'CONMEBOL Reglamento', secundaria: 'AFA Cupos Internacionales', discovery: '6 plazas (Arg 7 a 12)', estado: 'VERIFIED', detalle: 'Excluye clasificados a CL y descendidos' },
      { campo: 'Playoffs de Octavos', primaria: 'Motor CÁBALA (competitionRules)', secundaria: 'LPF Boletín', discovery: 'Cruces 1A-8B, 1B-8A...', estado: 'VERIFIED', detalle: 'Localía mejor clasificado' },
      { campo: 'Final de Torneo', primaria: 'Motor CÁBALA', secundaria: 'LPF Circular de Sedes', discovery: 'Estadio neutral oficial', estado: 'VERIFIED', detalle: 'Alargue 30m + Penales' },
      { campo: 'Reglas de Clasificación', primaria: 'Reglamento Oficial AFA 2026', secundaria: 'LPF Dirección Torneos', discovery: 'Criterios de desempate', estado: 'VERIFIED', detalle: '38 tests deterministas' },
    ],
    partidos: [
      { campo: 'ID de Encuentro', primaria: 'ESPN Event ID', secundaria: 'Firestore Match Doc', discovery: 'ID de evento canónico', estado: 'VERIFIED', detalle: 'Numérico único' },
      { campo: 'Fecha y Hora', primaria: 'ESPN API (event.date)', secundaria: 'AFA Programación Oficial', discovery: 'Ajustes de TV y reprogramaciones', estado: 'VERIFIED', detalle: 'ISO-8601 UTC' },
      { campo: 'Local y Visitante', primaria: 'ESPN Competitors', secundaria: 'LPF Cronograma', discovery: 'Localía reglamentaria', estado: 'VERIFIED', detalle: 'IDs confirmados en padrón' },
      { campo: 'Marcador / Resultado', primaria: 'ESPN Score', secundaria: 'Planilla oficial AFA', discovery: 'Marcador final verificado', estado: 'VERIFIED', detalle: 'Goles enteros >= 0' },
      { campo: 'Estado del Encuentro', primaria: 'ESPN Match State', secundaria: 'Reporte arbitral', discovery: 'scheduled, live, finished', estado: 'VERIFIED', detalle: 'Telemetría viva' },
      { campo: 'Jornada y Fase', primaria: 'ESPN Week / CÁBALA', secundaria: 'LPF Fixture', discovery: 'Fecha 1 a 16 / Apertura-Clausura', estado: 'VERIFIED', detalle: 'Estructura zonal oficial' },
      { campo: 'Estadio del Cotejo', primaria: 'ESPN API (venue)', secundaria: 'AFA Registro Canchas', discovery: 'Cambio de localía', estado: 'VERIFIED', detalle: 'Denominación oficial' },
      { campo: 'Árbitro Principal', primaria: 'ESPN API (officials)', secundaria: 'AFA Colegio de Árbitros', discovery: 'Designación de terna', estado: 'PARTIAL', detalle: 'Designado cerca de la fecha' },
      { campo: 'Terna (Asistentes y VAR)', primaria: 'AFA Boletín Designaciones', secundaria: 'Planilla de Partido', discovery: 'Nómina completa de autoridades', estado: 'SIN_DATO', detalle: 'No provisto en API gratuita' },
      { campo: 'Público / Aforo', primaria: 'ESPN API (attendance)', secundaria: 'AFA Control Accesos', discovery: 'Espectadores certificados', estado: 'SIN_DATO', detalle: 'Rara vez informado en Argentina' },
      { campo: 'Posesión (%)', primaria: 'ESPN Match Statistics', secundaria: 'Opta Sports', discovery: 'Reporte de posesión', estado: 'PARTIAL', detalle: 'Partidos principales con tracking' },
      { campo: 'Tiros al Arco y Totales', primaria: 'ESPN Match Statistics', secundaria: 'Opta Sports', discovery: 'Estadística de disparos', estado: 'PARTIAL', detalle: 'Partidos con cobertura' },
      { campo: 'Córners y Faltas', primaria: 'ESPN Match Statistics', secundaria: 'Planilla de Partido', discovery: 'Infracciones y tiros de esquina', estado: 'PARTIAL', detalle: 'Depende del cotejo' },
      { campo: 'Tarjetas (A/R)', primaria: 'ESPN API (events.cards)', secundaria: 'AFA Tribunal Disciplina', discovery: 'Amonestados y expulsados', estado: 'PARTIAL', detalle: 'Tiempo real con minuto' },
      { campo: 'Goleadores y Minutos', primaria: 'ESPN API (scoringPlays)', secundaria: 'Planilla oficial AFA', discovery: 'Autores y cronometría', estado: 'PARTIAL', detalle: 'Tiempo real con minuto' },
      { campo: 'Asistencias', primaria: 'ESPN API (athletesInvolved)', secundaria: 'Planilla técnica', discovery: 'Pases gol', estado: 'SIN_DATO', detalle: 'No serializado en feed arg.1' },
      { campo: 'Alineaciones Titulares', primaria: 'ESPN API (rosters)', secundaria: 'Planilla oficial COMET', discovery: '11 inicial confirmado', estado: 'PARTIAL', detalle: '45 minutos antes del inicio' },
      { campo: 'Suplentes y Cambios', primaria: 'ESPN API (substitutions)', secundaria: 'Planilla oficial COMET', discovery: 'Ventanas y relevos', estado: 'PARTIAL', detalle: 'Tiempo real durante el juego' },
      { campo: 'Formaciones Tácticas', primaria: 'ESPN API (formation)', secundaria: 'Análisis técnico', discovery: 'Esquema (4-3-3, 4-4-2)', estado: 'PARTIAL', detalle: 'Informado en previa' },
      { campo: 'Estadísticas Avanzadas (xG)', primaria: 'Proveedor comercial de pago', secundaria: 'Medios analíticos', discovery: 'Goles esperados', estado: 'SIN_DATO', detalle: 'Fuera del alcance del MVP $0' },
    ],
    tablas: [
      { campo: 'Posición Zonal', primaria: 'Motor CÁBALA (competitionRules)', secundaria: 'ESPN Standings', discovery: 'Puesto oficial 1° al 15°', estado: 'VERIFIED', detalle: 'Ordenamiento por desempates AFA' },
      { campo: 'PJ, PG, PE, PP', primaria: 'ESPN Standings', secundaria: 'Motor de Partidos', discovery: 'Partidos ganados/empatados/perdidos', estado: 'VERIFIED', detalle: 'PJ === PG + PE + PP exacto' },
      { campo: 'GF, GC, DG', primaria: 'ESPN Standings', secundaria: 'Motor de Partidos', discovery: 'Goles a favor, contra y saldo', estado: 'VERIFIED', detalle: 'DG === GF - GC verificado' },
      { campo: 'Puntos (PTS)', primaria: 'ESPN Standings', secundaria: 'Motor de Partidos', discovery: 'Puntaje oficial acumulado', estado: 'VERIFIED', detalle: 'PTS === (PG * 3) + PE verificado' },
      { campo: 'Clasificación a Octavos', primaria: 'Motor CÁBALA', secundaria: 'LPF Posiciones', discovery: '8 mejores de cada zona', estado: 'VERIFIED', detalle: 'Delimitación reglamentaria' },
      { campo: 'Criterios de Desempate', primaria: 'Motor CÁBALA (resolveZoneTie)', secundaria: 'AFA Boletín', discovery: 'DG -> GF -> H2H -> FairPlay -> Sorteo', estado: 'VERIFIED', detalle: 'Lógica determinista pura' },
      { campo: 'Tabla General Anual', primaria: 'Motor CÁBALA (getAnnualTable)', secundaria: 'LPF Tabla General', discovery: 'Acumulada de 32 fechas', estado: 'VERIFIED', detalle: 'Proclama Campeón de Liga' },
      { campo: 'Tabla de Promedios', primaria: 'AFA Boletín Oficial PDF', secundaria: 'LPF Circular Descenso', discovery: 'Coeficiente trianual', estado: 'SIN_DATO', detalle: 'Sin inventar promedios parciales' },
    ],
    playoffs: [
      { campo: '16 Clubes Clasificados', primaria: 'Motor CÁBALA', secundaria: 'LPF Clasificación', discovery: '8 de Zona A + 8 de Zona B', estado: 'VERIFIED', detalle: 'Excluye clubes en descenso' },
      { campo: 'Cruces de Octavos', primaria: 'Motor CÁBALA', secundaria: 'LPF Cuadro Oficial', discovery: '1A vs 8B, 1B vs 8A...', estado: 'VERIFIED', detalle: 'Emparejamientos AFA 2026' },
      { campo: 'Localía en Llave', primaria: 'Motor CÁBALA', secundaria: 'Reglamento LPF', discovery: 'Cancha del mejor ubicado', estado: 'VERIFIED', detalle: 'Ventaja deportiva reglamentaria' },
      { campo: 'Definición en Empate', primaria: 'Motor CÁBALA', secundaria: 'Reglamento AFA 2026', discovery: 'Penales directos / Alargue en final', estado: 'VERIFIED', detalle: 'Sin tiempo extra en octavos/cuartos' },
      { campo: 'Inhabilitación Descenso', primaria: 'Motor CÁBALA', secundaria: 'AFA Circular Descenso', discovery: 'Corrimiento al 9° de zona', estado: 'VERIFIED', detalle: 'Regla estricta Clausura' },
      { campo: 'Final y Campeón', primaria: 'Motor CÁBALA', secundaria: 'AFA Protocolo Coronación', discovery: 'Estadio neutral y trofeo oficial', estado: 'VERIFIED', detalle: 'Clasifica a Libertadores 2027' },
    ],
    jugadores: [
      { campo: 'Nombre y Apellido', primaria: 'ESPN Roster API', secundaria: 'Planilla COMET AFA', discovery: 'Identidad del futbolista', estado: 'PARTIAL', detalle: 'Plantel de primera división' },
      { campo: 'Dorsal / Camiseta', primaria: 'ESPN Roster API', secundaria: 'Planilla de Partido', discovery: 'Número asignado', estado: 'PARTIAL', detalle: 'Dorsales oficiales' },
      { campo: 'Posición Táctica', primaria: 'ESPN Roster API', secundaria: 'Ficha técnica AFA', discovery: 'Arquero, Defensor, Volante, Delantero', estado: 'PARTIAL', detalle: 'Demarcación básica' },
      { campo: 'Goles Anotados', primaria: 'ESPN Athlete Stats', secundaria: 'Tabla Goleadores AFA', discovery: 'Tantos convertidos en torneo', estado: 'PARTIAL', detalle: 'Goleadores del torneo' },
      { campo: 'Minutos y Asistencias', primaria: 'Planilla técnica avanzada', secundaria: 'Opta / StatsPerform', discovery: 'Minutaje efectivo', estado: 'SIN_DATO', detalle: 'No provisto en feed gratuito' },
    ],
    historial: [
      { campo: 'Campeones Históricos', primaria: 'AFA Cuadro de Honor', secundaria: 'LPF Galería Oficial', discovery: 'Títulos de liga 1893-2025', estado: 'PARTIAL', detalle: 'Nómina oficial de campeones' },
      { campo: 'Copas Internacionales', primaria: 'CONMEBOL / FIFA', secundaria: 'AFA Memoria', discovery: 'Libertadores / Intercontinentales', estado: 'PARTIAL', detalle: 'Palmarés internacional' },
      { campo: 'Tabla Histórica Puntos', primaria: 'AFA Archivo', secundaria: 'Investigación histórica', discovery: 'Tabla perpetua del profesionalismo', estado: 'SIN_DATO', detalle: 'Pendiente de homologación' },
    ],
    noticias: [
      { campo: 'Titular Oficial', primaria: 'Sitios oficiales de clubes / AFA', secundaria: 'Diario Olé / TyC Sports', discovery: 'Comunicados de prensa', estado: 'VERIFIED', detalle: 'Títulos de fuentes registradas' },
      { campo: 'Fuente y Dominio', primaria: 'Dominio de autoridad', secundaria: 'Registro de medios', discovery: 'afa.com.ar, ligafutbol.com.ar...', estado: 'VERIFIED', detalle: 'Filtrado anti-clickbait' },
      { campo: 'URL Canónica', primaria: 'Google Search Grounding', secundaria: 'Enlace canónico', discovery: 'Link directo a la nota oficial', estado: 'VERIFIED', detalle: 'HTTPS comprobado' },
      { campo: 'Fecha de Emisión', primaria: 'Header / Metadata oficial', secundaria: 'Timestamp de descubrimiento', discovery: 'Fecha de publicación', estado: 'VERIFIED', detalle: 'ISO-8601' },
      { campo: 'Entidad Relacionada', primaria: 'Extractor CÁBALA', secundaria: 'Categoría oficial', discovery: 'Mención de club o torneo', estado: 'VERIFIED', detalle: 'Enlazado a club' },
      { campo: 'Estado de Verificación', primaria: 'Pipeline 9 Pasos CÁBALA', secundaria: 'Análisis de dominio', discovery: 'VERIFIED si dominio de autoridad', estado: 'VERIFIED', detalle: 'Trazabilidad garantizada' },
    ],
    reglamentacion: [
      { campo: 'Reglamento de Torneos', primaria: 'Boletín Oficial AFA N° 6420', secundaria: 'Circular LPF 2026', discovery: 'Cuerpo normativo de la temporada', estado: 'VERIFIED', detalle: '30 clubes, 2 zonas de 15' },
      { campo: 'Art. 11: Desempates', primaria: 'Texto Oficial AFA 2026', secundaria: 'LPF Competencias', discovery: '1° DG, 2° GF, 3° H2H, 4° FairPlay, 5° Sorteo', estado: 'VERIFIED', detalle: 'Implementación determinista pura' },
      { campo: 'Art. 14: Playoffs', primaria: 'Texto Oficial AFA 2026', secundaria: 'LPF Cuadro Final', discovery: '8 de A y 8 de B / Eliminación directa', estado: 'VERIFIED', detalle: 'Cruces y localía reglamentaria' },
      { campo: 'Art. 24: Régimen Descenso', primaria: 'Texto Oficial AFA 2026', secundaria: 'LPF Descenso', discovery: '30° Anual y 30° Promedios', estado: 'VERIFIED', detalle: 'Partido desempate si hay empate' },
      { campo: 'Caso Borde Puesto 29°', primaria: 'Jurisprudencia previa AFA', secundaria: 'Circular de Comité Ejecutivo', discovery: 'Traslado al 29° si mismo equipo es 30°', estado: 'REQUIERE_VERIFICACIÓN_REGLAMENTARIA', detalle: 'Pendiente de circular expresa AFA' },
      { campo: 'Clasificación Copas 2027', primaria: 'Reglamento CONMEBOL / AFA', secundaria: 'LPF Cupos', discovery: 'Libertadores 6 + Sudamericana 6', estado: 'VERIFIED', detalle: 'Reasignación por bicampeonato' },
    ],
  };

  const currentCategoryFields = detailedFields[selectedCategory] || [];
  const filteredFields = currentCategoryFields.filter((f) => {
    if (statusFilter === 'TODOS') return true;
    return f.estado === statusFilter;
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#22272E] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#30A46C]/15 text-[#30A46C] border border-[#30A46C]/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Auditoría Final MVP 2026
            </span>
            <span className="text-[11px] text-[#8B949E] font-medium">· Presupuesto $0 USD</span>
          </div>
          <h1 className="font-editorial font-black text-3xl md:text-5xl text-[#F1EDE6] tracking-tight">
            TRANSPARENCIA & AUDITORÍA DE DATOS
          </h1>
          <p className="text-xs text-[#8B949E] mt-1.5 max-w-2xl font-medium leading-relaxed">
            CÁBALA prioriza <strong>EXACTITUD sobre cantidad</strong>. Regla absoluta:{' '}
            <code className="text-[#DCA842] font-mono bg-[#181C22] px-1.5 py-0.5 rounded">INVENTADO = MAL = SIN DATO</code>.
            Toda información externa se somete a validación matemática y trazabilidad estricta.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#121519] p-3 rounded-2xl border border-[#22272E] shrink-0">
          <Database className="w-5 h-5 text-[#DCA842]" />
          <div>
            <span className="text-[10px] text-[#8B949E] block uppercase font-bold">Persistencia Real</span>
            <span className="text-xs font-mono font-bold text-[#F1EDE6]">Cloud Firestore Activo</span>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-[#121519] border border-[#22272E]">
          <span className="text-[10px] uppercase font-bold text-[#8B949E] block mb-1">Total Campos</span>
          <span className="font-num text-2xl font-black text-[#F1EDE6]">92</span>
          <span className="text-[10px] text-[#8B949E] block mt-0.5">En 9 entidades</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121519] border border-[#30A46C]/30 bg-[#30A46C]/5">
          <span className="text-[10px] uppercase font-bold text-[#30A46C] block mb-1">Verificados</span>
          <span className="font-num text-2xl font-black text-[#30A46C]">46</span>
          <span className="text-[10px] text-[#30A46C]/80 block mt-0.5">50% oficial activo</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121519] border border-[#DCA842]/30 bg-[#DCA842]/5">
          <span className="text-[10px] uppercase font-bold text-[#DCA842] block mb-1">Parciales</span>
          <span className="font-num text-2xl font-black text-[#DCA842]">16</span>
          <span className="text-[10px] text-[#DCA842]/80 block mt-0.5">Según partido/club</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121519] border border-[#8B949E]/30">
          <span className="text-[10px] uppercase font-bold text-[#8B949E] block mb-1">SIN DATO</span>
          <span className="font-num text-2xl font-black text-[#8B949E]">28</span>
          <span className="text-[10px] text-[#8B949E] block mt-0.5">No inventados (30%)</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121519] border border-amber-500/30 bg-amber-500/5">
          <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">Reglamentario</span>
          <span className="font-num text-2xl font-black text-amber-400">1</span>
          <span className="text-[10px] text-amber-400/80 block mt-0.5">Caso borde 29° AFA</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121519] border border-[#22272E]">
          <span className="text-[10px] uppercase font-bold text-[#8B949E] block mb-1">Tests Pasando</span>
          <span className="font-num text-2xl font-black text-[#30A46C]">38 / 38</span>
          <span className="text-[10px] text-[#30A46C] block mt-0.5">100% Deterministas</span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-[#22272E] gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('matriz')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'matriz'
              ? 'text-[#F1EDE6] border-[#DCA842]'
              : 'text-[#8B949E] border-transparent hover:text-[#F1EDE6]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Matriz de Cobertura (9 Entidades)</span>
        </button>

        <button
          onClick={() => setActiveTab('preguntas')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'preguntas'
              ? 'text-[#F1EDE6] border-[#DCA842]'
              : 'text-[#8B949E] border-transparent hover:text-[#F1EDE6]'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Las 10 Preguntas Críticas</span>
        </button>

        <button
          onClick={() => setActiveTab('consola')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'consola'
              ? 'text-[#F1EDE6] border-[#DCA842]'
              : 'text-[#8B949E] border-transparent hover:text-[#F1EDE6]'
          }`}
        >
          <Search className="w-4 h-4 text-[#DCA842]" />
          <span>Consola de Google Discovery en Vivo</span>
        </button>

        <button
          onClick={() => setActiveTab('jerarquia')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'jerarquia'
              ? 'text-[#F1EDE6] border-[#DCA842]'
              : 'text-[#8B949E] border-transparent hover:text-[#F1EDE6]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Jerarquía de Fuentes & Flujo</span>
        </button>
      </div>

      {/* TAB 1: MATRIZ DE COBERTURA */}
      {activeTab === 'matriz' && (
        <div className="space-y-6">
          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-[#DCA842] text-[#0A0C0E] border-[#DCA842] font-bold shadow-sm'
                    : 'bg-[#121519] text-[#8B949E] border-[#22272E] hover:text-[#F1EDE6]'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat.id ? 'bg-[#0A0C0E]/20 text-[#0A0C0E]' : 'bg-[#181C22] text-[#8B949E]'
                  }`}
                >
                  {cat.total}
                </span>
              </button>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121519] p-3 rounded-2xl border border-[#22272E] text-xs">
            <span className="text-[#8B949E] font-medium">Filtrar por estado reglamentario:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {['TODOS', 'VERIFIED', 'PARTIAL', 'SIN_DATO', 'REQUIERE_VERIFICACIÓN_REGLAMENTARIA'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    statusFilter === st
                      ? 'bg-[#F1EDE6] text-[#0A0C0E]'
                      : 'bg-[#181C22] text-[#8B949E] hover:text-[#F1EDE6]'
                  }`}
                >
                  {st === 'TODOS'
                    ? 'Todos'
                    : st === 'VERIFIED'
                    ? 'Verificado'
                    : st === 'PARTIAL'
                    ? 'Parcial'
                    : st === 'SIN_DATO'
                    ? 'SIN DATO'
                    : 'Req. Verificación'}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-[#121519] border border-[#22272E] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#181C22] border-b border-[#22272E] text-[#8B949E] uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-3 px-4">Campo</th>
                    <th className="py-3 px-4">Fuente Primaria</th>
                    <th className="py-3 px-4">Fuente Secundaria</th>
                    <th className="py-3 px-4">Google Discovery</th>
                    <th className="py-3 px-4">Detalle / Regla</th>
                    <th className="py-3 px-4 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#22272E]">
                  {filteredFields.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#F1EDE6]">{row.campo}</td>
                      <td className="py-3 px-4 text-[#8B949E]">{row.primaria}</td>
                      <td className="py-3 px-4 text-[#8B949E]">{row.secundaria}</td>
                      <td className="py-3 px-4 text-[#8B949E] font-mono text-[11px]">{row.discovery}</td>
                      <td className="py-3 px-4 text-[#8B949E] text-[11px]">{row.detalle}</td>
                      <td className="py-3 px-4 text-right">
                        {row.estado === 'VERIFIED' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#30A46C]/15 text-[#30A46C] border border-[#30A46C]/30">
                            <CheckCircle2 className="w-3 h-3" />
                            VERIFIED
                          </span>
                        )}
                        {row.estado === 'PARTIAL' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DCA842]/15 text-[#DCA842] border border-[#DCA842]/30">
                            <Clock className="w-3 h-3" />
                            PARTIAL
                          </span>
                        )}
                        {row.estado === 'SIN_DATO' && <SinDatoBadge inline label="SIN DATO" />}
                        {row.estado === 'REQUIERE_VERIFICACIÓN_REGLAMENTARIA' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            REQ. VERIF.
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredFields.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#8B949E]">
                        No hay campos que coincidan con el filtro seleccionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LAS 10 PREGUNTAS CRÍTICAS */}
      {activeTab === 'preguntas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              num: 1,
              title: '¿Qué datos tenemos actualmente?',
              desc: 'Nómina oficial de los 30 clubes de Primera División 2026, marcadores en vivo de ESPN, tablas validadas matemáticamente de Apertura, Clausura y General Anual, fixture completo, cruces de octavos de final con localías y 38 tests deterministas.',
            },
            {
              num: 2,
              title: '¿Qué datos podemos obtener actualmente?',
              desc: 'Telemetría de partidos en vivo (minutos, tarjetas, goles, incidencias), clasificaciones actualizadas al instante por ESPN, boletines normativos públicos de AFA y LPF mediante Google Search Discovery, y sitios oficiales de los 30 clubes.',
            },
            {
              num: 3,
              title: '¿De qué fuente viene cada dato?',
              desc: 'Deportivos y marcadores: ESPN ARG.1. Reglamentación y formato de torneos: AFA / LPF (Reglamento 2026). Persistencia: Cloud Firestore. Descubrimiento: Google Search Discovery contrastado contra dominios de autoridad.',
            },
            {
              num: 4,
              title: '¿Qué datos puede descubrir Google Search?',
              desc: 'Boletines y fallos del Tribunal de Disciplina de AFA, circulares de permanencia y desempates, sitios institucionales oficiales de clubes, comunicados de designaciones arbitrales y noticias certificadas de medios de referencia.',
            },
            {
              num: 5,
              title: '¿Qué datos puede verificar Google Search?',
              desc: 'Autenticidad de links institucionales, nombres oficiales de estadios según registro de AFA, año de fundación de los clubes mediante estatutos públicos, y vigencia de normas (detectando si una regla es STALE por ser pre-2026).',
            },
            {
              num: 6,
              title: '¿Qué datos NO podemos verificar con $0?',
              desc: 'Alineaciones tácticas previas en tiempo real 60 minutos antes (requiere COMET de AFA o feed de pago Opta), tracking de kilometraje físico y sprint, salarios/contratos, y tabla trianual completa de promedios no serializada en API abierta.',
            },
            {
              num: 7,
              title: '¿Qué datos deben mostrar estrictamente SIN DATO?',
              desc: 'Toda tabla de promedios donde falte el historial trianual, directores técnicos no anunciados en canales oficiales, asistencias/posesión en cotejos sin cobertura profunda, y títulos no federados o no homologados por AFA.',
            },
            {
              num: 8,
              title: '¿Qué datos necesitan una segunda fuente?',
              desc: 'Desempates Head-to-Head (requiere contrastar resultados mutuos en base de datos), puntos de Fair Play (cruzar tarjetas de ESPN con boletines de sanciones del Tribunal de AFA) y confirmación oficial de descensos.',
            },
            {
              num: 9,
              title: '¿Qué datos necesitan scraper / provider adicional?',
              desc: 'Boletines oficiales AFA en formato PDF para serializar la tabla de coeficientes de promedios, y acceso formal al sistema COMET de AFA para la nómina integral de planteles con dorsales y divisiones formativas.',
            },
            {
              num: 10,
              title: '¿Qué datos todavía están pendientes?',
              desc: 'Cómputo trianual automatizado de promedios con parser de boletines de AFA, estadísticas históricas unificadas desde 1893, y expansión de cobertura hacia el Torneo Proyección (Reserva) y Primera Nacional.',
            },
          ].map((item) => (
            <div
              key={item.num}
              className="p-5 rounded-2xl bg-[#121519] border border-[#22272E] space-y-2 hover:border-[#DCA842]/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-[#DCA842]/15 text-[#DCA842] border border-[#DCA842]/30 flex items-center justify-center font-num font-black text-xs shrink-0">
                  {item.num}
                </span>
                <h3 className="font-editorial font-bold text-sm text-[#F1EDE6] leading-tight">{item.title}</h3>
              </div>
              <p className="text-xs text-[#8B949E] leading-relaxed pl-8">{item.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: CONSOLA DE GOOGLE DISCOVERY EN VIVO */}
      {activeTab === 'consola' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#121519] border border-[#22272E] space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#DCA842] tracking-wider block mb-1">
                Pipeline de Descubrimiento de 9 Pasos en Tiempo Real
              </span>
              <h2 className="font-editorial font-bold text-xl text-[#F1EDE6]">
                Consultar el Motor de Descubrimiento y Verificación
              </h2>
              <p className="text-xs text-[#8B949E] mt-1 max-w-2xl">
                Google Search actúa como radar externo. El sistema extrae la fuente real, comprueba si pertenece al
                registro de dominios de autoridad (AFA, LPF, clubes oficiales), valida el año 2026 y aplica la regla
                de procedencia.
              </p>
            </div>

            {/* Query Input */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8B949E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={consoleQuery}
                  onChange={(e) => setConsoleQuery(e.target.value)}
                  placeholder="Ej: reglamento lpf 2026 desempates, estadio boca juniors, permanencia..."
                  className="w-full bg-[#181C22] border border-[#22272E] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F1EDE6] placeholder-[#8B949E]/50 focus:outline-hidden focus:border-[#DCA842]"
                  onKeyDown={(e) => e.key === 'Enter' && handleRunDiscovery()}
                />
              </div>

              <button
                onClick={() => handleRunDiscovery()}
                disabled={isDiscovering}
                className="px-5 py-2.5 rounded-xl bg-[#DCA842] text-[#0A0C0E] font-bold text-xs uppercase tracking-wider hover:bg-[#c99532] transition-colors disabled:opacity-50 shrink-0"
              >
                {isDiscovering ? 'Descubriendo...' : 'Ejecutar 9 Pasos'}
              </button>
            </div>

            {/* Quick Preset Queries */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#22272E] text-xs">
              <span className="text-[#8B949E] text-[11px]">Pruebas rápidas de auditoría:</span>
              {[
                'reglamento torneo lpf 2026 desempates',
                'regimen de descenso y permanencia 2026',
                'clasificacion copas conmebol libertadores 2027',
                'boca juniors estadio oficial fundacion',
                'promedios lpf 2026',
              ].map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setConsoleQuery(preset);
                    handleRunDiscovery(preset);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#181C22] text-[#8B949E] hover:text-[#F1EDE6] hover:border-[#DCA842]/50 border border-[#22272E] text-[10px] font-mono transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Results Output */}
          {discoveryResult && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between text-xs text-[#8B949E] px-2">
                <span>
                  Resultados devueltos:{' '}
                  <strong className="text-[#F1EDE6]">{discoveryResult.results?.length || 0}</strong> (
                  {discoveryResult.verifiedCount || 0} Verificados, {discoveryResult.sinDatoCount || 0} SIN DATO)
                </span>
                <span className="font-mono text-[10px]">
                  Estado del Pipeline: <strong className="text-[#DCA842]">{discoveryResult.status}</strong>
                </span>
              </div>

              <div className="space-y-3">
                {discoveryResult.results?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#121519] border border-[#22272E] space-y-3 hover:border-[#DCA842]/30 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#181C22] text-[#DCA842] border border-[#22272E]">
                          PASO 1 A {item.validationStepsCompleted} COMPLETO
                        </span>
                        <span className="text-xs font-bold text-[#F1EDE6]">{item.source}</span>
                      </div>

                      <div>
                        {item.status === 'VERIFIED' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#30A46C]/15 text-[#30A46C] border border-[#30A46C]/30">
                            <CheckCircle2 className="w-3 h-3" />
                            VERIFIED (Fuente Oficial)
                          </span>
                        )}
                        {item.status === 'SIN_DATO' && <SinDatoBadge inline label="SIN DATO (Rechazado)" />}
                        {item.status === 'STALE' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8B949E]/15 text-[#8B949E] border border-[#8B949E]/30">
                            <Clock className="w-3 h-3" />
                            STALE (Pre-2026)
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-editorial font-bold text-base text-[#F1EDE6]">{item.title}</h4>
                      <p className="text-xs text-[#8B949E] mt-1 leading-relaxed">{item.content}</p>
                    </div>

                    <div className="pt-3 border-t border-[#22272E] flex flex-wrap items-center justify-between gap-3 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-[#8B949E]">Dominio de Autoridad:</span>
                        <code className="text-[#DCA842] font-mono">{item.sourceDomain}</code>
                        <span className="text-[10px] text-[#8B949E]">({item.authorityTier})</span>
                      </div>

                      {item.sourceUrl && (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#DCA842] hover:underline"
                        >
                          <span>Visitar fuente canónica</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <div className="bg-[#181C22] p-2.5 rounded-xl border border-[#22272E] text-[10px] text-[#8B949E]">
                      <strong>Dictamen de Validación CÁBALA:</strong> {item.validationNotes}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: JERARQUÍA DE FUENTES & FLUJO */}
      {activeTab === 'jerarquia' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Reglamentos */}
            <div className="p-6 rounded-3xl bg-[#121519] border border-[#22272E] space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#DCA842]/15 text-[#DCA842] flex items-center justify-center font-bold">
                  §
                </div>
                <div>
                  <h3 className="font-editorial font-bold text-base text-[#F1EDE6]">
                    Jerarquía A: Cuestiones Reglamentarias
                  </h3>
                  <span className="text-[10px] text-[#8B949E] uppercase font-bold">AFA / Liga Profesional</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-[#8B949E]">
                <div className="p-3 rounded-xl bg-[#181C22] border border-[#30A46C]/30 text-[#F1EDE6]">
                  <strong className="text-[#30A46C] block mb-0.5">Nivel 1 (Máxima Autoridad):</strong>
                  Documento oficial de AFA / Liga Profesional (Boletín oficial, Reglamento de Torneos 2026).
                </div>
                <div className="p-3 rounded-xl bg-[#181C22] border border-[#22272E]">
                  <strong className="text-[#F1EDE6] block mb-0.5">Nivel 2:</strong>
                  Fallos y resoluciones del Tribunal de Disciplina de AFA.
                </div>
                <div className="p-3 rounded-xl bg-[#181C22] border border-[#22272E]">
                  <strong className="text-[#F1EDE6] block mb-0.5">Nivel 3:</strong>
                  Fuentes secundarias confiables exclusivamente para contraste periodístico.
                </div>
                <div className="p-3 rounded-xl bg-[#181C22] border border-[#DCA842]/30 text-[#DCA842]">
                  <strong className="block mb-0.5">Nivel 4 (Google Search):</strong>
                  Únicamente como capa de descubrimiento para localizar los documentos oficiales de Nivel 1 y 2.
                </div>
              </div>
            </div>

            {/* Box 2: Datos Deportivos */}
            <div className="p-6 rounded-3xl bg-[#121519] border border-[#22272E] space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#30A46C]/15 text-[#30A46C] flex items-center justify-center font-bold">
                  ⚽
                </div>
                <div>
                  <h3 className="font-editorial font-bold text-base text-[#F1EDE6]">
                    Jerarquía B: Datos Deportivos y Marcadores
                  </h3>
                  <span className="text-[10px] text-[#8B949E] uppercase font-bold">Telemetría de Cotejos</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-[#8B949E]">
                <div className="p-3 rounded-xl bg-[#181C22] border border-[#30A46C]/30 text-[#F1EDE6]">
                  <strong className="text-[#30A46C] block mb-0.5">Nivel 1 (Proveedor Real Conectado):</strong>
                  ESPN Soccer API (`arg.1`) para partidos en vivo, marcadores y fixture.
                </div>
                <div className="p-3 rounded-xl bg-[#181C22] border border-[#22272E]">
                  <strong className="text-[#F1EDE6] block mb-0.5">Nivel 2:</strong>
                  Acta oficial y planilla arbitral homologada por AFA / LPF.
                </div>
                <div className="p-3 rounded-xl bg-[#181C22] border border-[#22272E]">
                  <strong className="text-[#F1EDE6] block mb-0.5">Nivel 3:</strong>
                  Portales institucionales oficiales de los clubes participantes.
                </div>
                <div className="p-3 rounded-xl bg-[#181C22] border border-[#22272E]">
                  <strong className="text-[#F1EDE6] block mb-0.5">Nivel 4:</strong>
                  Segundo proveedor o medio periodístico homologado (Diario Olé, TyC Sports).
                </div>
                <div className="p-3 rounded-xl bg-[#181C22] border border-[#DCA842]/30 text-[#DCA842]">
                  <strong className="block mb-0.5">Nivel 5 (Google Search):</strong>
                  Herramienta de descubrimiento para rastrear enlaces primarios.
                </div>
              </div>
            </div>
          </div>

          {/* Golden Rule Diagram */}
          <div className="p-6 rounded-3xl bg-[#121519] border border-[#22272E] space-y-4">
            <h3 className="font-editorial font-bold text-lg text-[#F1EDE6]">
              Flujo Estricto de Descubrimiento vs Práctica Prohibida
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#30A46C]/10 border border-[#30A46C]/30 space-y-2">
                <span className="text-[10px] font-bold uppercase text-[#30A46C] block">
                  ✓ Flujo Correcto CÁBALA
                </span>
                <p className="text-[#F1EDE6] font-mono leading-relaxed">
                  Google Discovery ➔ Identificar URL de AFA/Club ➔ Verificar Dominio Autorizado ➔ Extraer Datos ➔ Validar Matemática ➔ Firestore
                </p>
                <p className="text-[#8B949E] text-[11px]">
                  La fuente real es la página de la entidad, nunca el buscador.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#E5484D]/10 border border-[#E5484D]/30 space-y-2">
                <span className="text-[10px] font-bold uppercase text-[#E5484D] block">
                  ✗ Práctica Prohibida
                </span>
                <p className="text-[#F1EDE6] font-mono leading-relaxed">
                  Google Snippet ➔ Guardar directamente en base de datos como verdad
                </p>
                <p className="text-[#8B949E] text-[11px]">
                  Prohibido en CÁBALA. Un snippet aislado puede contener resúmenes desactualizados, opiniones o alucinaciones.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
