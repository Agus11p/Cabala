import React, { useState, useEffect } from 'react';
import { TableType, StandingRow, PromediosRow, ZoneStanding, UIState, DataInconsistencyRecord } from '../types/football';
import { footballService } from '../services/footballService';
import { StandingsTable } from '../components/standings/StandingsTable';
import { PlayoffBracketView } from '../components/standings/PlayoffBracketView';
import { TabNav } from '../components/common/TabNav';
import { TableRowSkeleton } from '../components/common/SkeletonLoader';
import { OFFICIAL_TOURNAMENTS_REGULATION } from '../types/regulations';
import {
  calculateLibertadoresPlaces,
  calculateSudamericanaPlaces,
  generateRoundOf16Matchups,
  resolveZoneTie,
} from '../services/competitionRules';
import { runCompetitionRulesTests } from '../services/competitionRules.test';
import { TeamBadge } from '../components/common/TeamBadge';
import {
  Info,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  BookOpen,
  Award,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Columns,
  Square,
  Trophy,
  Globe,
} from 'lucide-react';

interface StandingsPageProps {
  onSelectClub: (clubId: string) => void;
  initialTable?: TableType;
  onTableChange?: (table: TableType) => void;
}

export const StandingsPage: React.FC<StandingsPageProps> = ({ onSelectClub, initialTable, onTableChange }) => {
  const activePhase = footballService.getActiveSeasonPhase();
  const isAperturaClosed = footballService.isSeasonClosed('apertura');

  const [activeTable, setActiveTable] = useState<TableType>(initialTable || activePhase);

  useEffect(() => {
    if (initialTable) {
      setActiveTable(initialTable);
    }
  }, [initialTable]);
  const [activeZone, setActiveZone] = useState<'A' | 'B'>('A');
  const [desktopLayout, setDesktopLayout] = useState<'split' | 'single'>('split');
  const [copasFilter, setCopasFilter] = useState<'all' | 'libertadores' | 'sudamericana'>('all');
  const [data, setData] = useState<(StandingRow | PromediosRow)[]>([]);
  const [zoneA, setZoneA] = useState<ZoneStanding[]>([]);
  const [zoneB, setZoneB] = useState<ZoneStanding[]>([]);
  const [unavailableMessage, setUnavailableMessage] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [uiState, setUiState] = useState<UIState>('LOADING');
  const [inconsistencies, setInconsistencies] = useState<DataInconsistencyRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showReglamentoModal, setShowReglamentoModal] = useState(false);
  const [testResults, setTestResults] = useState<ReturnType<typeof runCompetitionRulesTests> | null>(null);

  const tableTabs = [
    { id: 'clausura' as const, label: `Torneo Clausura ${activePhase === 'clausura' ? '(Activo)' : ''}` },
    { id: 'apertura' as const, label: `Torneo Apertura ${isAperturaClosed ? '(Campeón: Belgrano)' : ''}` },
    { id: 'anual' as const, label: 'Tabla Anual (30 Clubes)' },
    { id: 'promedios' as const, label: 'Tabla de Promedios' },
    { id: 'copas' as const, label: 'Clasificación a Copas' },
    { id: 'playoffs' as const, label: 'Cuadro de Playoffs' },
  ];

  const loadStandings = () => {
    let isMounted = true;
    setLoading(true);
    setUiState('LOADING');
    setError(null);
    setInconsistencies([]);

    // Copas require la Tabla General Anual de 30 clubes para asignar los 12 cupos Conmebol
    // Playoffs consulta Clausura para disponer de Zona A y Zona B completas
    const queryType = activeTable === 'copas' ? 'anual' : (activeTable === 'playoffs' ? 'clausura' : activeTable);

    footballService
      .getStandings(queryType)
      .then((res) => {
        if (!isMounted) return;
        if (res.inconsistencies && res.inconsistencies.length > 0) {
          setInconsistencies(res.inconsistencies);
        }
        if (!res.available) {
          setData([]);
          setZoneA([]);
          setZoneB([]);
          setUiState(res.dataState || 'EMPTY');
          setUnavailableMessage(
            res.message ||
              'Datos no disponibles para este campeonato en el proveedor de datos (ESPN) en este momento. CÁBALA no muestra números inventados.'
          );
        } else {
          setData(res.data);
          if (res.zoneA && res.zoneA.length > 0) setZoneA(res.zoneA);
          if (res.zoneB && res.zoneB.length > 0) setZoneB(res.zoneB);
          setUnavailableMessage(undefined);
          setUiState(res.dataState || (res.inconsistencies && res.inconsistencies.length > 0 ? 'DATA_INCONSISTENCY' : 'SUCCESS'));
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'No se pudieron sincronizar las tablas con el proveedor de datos (ESPN).');
        setUiState('ERROR');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  };

  useEffect(() => {
    const cleanup = loadStandings();
    return cleanup;
  }, [activeTable]);

  const handleRunTests = () => {
    const res = runCompetitionRulesTests();
    setTestResults(res);
  };

  // Compute Continental Places dynamically via Competition Rules using all 30 teams
  const standardRows = (data as StandingRow[]).filter((r) => r && typeof r.points === 'number');
  const all30Rows = standardRows.length === 30 ? standardRows : [...zoneA, ...zoneB];
  const libertadoresPlaces = calculateLibertadoresPlaces(all30Rows, {});
  const sudamericanaPlaces = calculateSudamericanaPlaces(all30Rows, libertadoresPlaces);

  // Compute Playoffs (Octavos de final con Zona A y Zona B de 15 clubes cada una)
  const playoffMatchups = zoneA.length >= 8 && zoneB.length >= 8
    ? generateRoundOf16Matchups(zoneA, zoneB, { isClausura: activeTable === 'clausura' })
    : [];

  const getTableContextDescription = () => {
    switch (activeTable) {
      case 'clausura':
        return 'Torneo Clausura 2026: 30 clubes organizados en dos zonas independientes (Zona A y Zona B de 15 equipos cada una). Los 8 primeros de cada zona clasifican a Octavos de Final.';
      case 'apertura':
        return 'Torneo Apertura 2026: Dos zonas independientes (Zona A y Zona B de 15 equipos). 16 fechas de fase regular (14 zonales + 2 interzonales). 1° al 8° clasifican a Octavos.';
      case 'anual':
        return 'Tabla General Anual 2026: Acumula exclusivamente las fases regulares de los 30 clubes juntos (Apertura + Clausura = 32 fechas). Los playoffs NO suman puntos. El 1° es el Campeón de Liga.';
      case 'copas':
        return 'Clasificación a Copas Internacionales 2027 (Libertadores y Sudamericana) calculada estrictamente según el reglamento oficial AFA vigente.';
      case 'playoffs':
        return 'Cuadro oficial de Octavos de Final: 1A vs 8B, 1B vs 8A, 2A vs 7B, 2B vs 7A, 3A vs 6B, 3B vs 6A, 4A vs 5B, 4B vs 5A. Localía para los 4 mejores clasificados.';
      case 'promedios':
        return 'Tabla de Promedios: Cociente de puntos sobre partidos disputados en las últimas 3 temporadas (2024, 2025 y 2026). Si el proveedor de datos (ESPN) no suministra coeficientes oficiales, el estado reglamentario es SIN DATO.';
      default:
        return '';
    }
  };

  const isZonePhase = activeTable === 'apertura' || activeTable === 'clausura';

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#22272E] pb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#DCA842] block mb-1">
            Reglamento: AFA / Liga Profesional · Datos: ESPN
          </span>
          <h1 className="font-editorial font-black text-3xl md:text-5xl text-[#F1EDE6] tracking-tight">
            TABLAS Y REGLAMENTOS
          </h1>
          <p className="text-xs text-[#8B949E] mt-1 font-medium max-w-xl">
            Clasificaciones por zona (A y B) según Reglamento AFA / LPF 2026. Estadísticas y resultados suministrados por ESPN.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* UX de Estados Reales: Procedencia clara */}
          <div className="hidden sm:flex items-center">
            {uiState === 'LOADING' && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181C22] border border-[#22272E] text-[11px] font-semibold text-[#8B949E]">
                <span className="w-2 h-2 rounded-full bg-[#DCA842] animate-pulse" />
                <span>Cargando datos (ESPN)…</span>
              </span>
            )}
            {uiState === 'SUCCESS' && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#30A46C]/10 border border-[#30A46C]/30 text-[11px] font-bold text-[#30A46C]">
                <span className="w-2 h-2 rounded-full bg-[#30A46C]" />
                <span>Datos: ESPN · Reglas: AFA</span>
              </span>
            )}
            {uiState === 'EMPTY' && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181C22] border border-[#22272E] text-[11px] font-semibold text-[#8B949E]">
                <span className="w-2 h-2 rounded-full bg-[#8B949E]" />
                <span>SIN DATO</span>
              </span>
            )}
            {uiState === 'ERROR' && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E5484D]/10 border border-[#E5484D]/30 text-[11px] font-bold text-[#E5484D]">
                <span className="w-2 h-2 rounded-full bg-[#E5484D]" />
                <span>Error al consultar ESPN</span>
              </span>
            )}
            {uiState === 'DATA_INCONSISTENCY' && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E5484D]/15 border border-[#E5484D]/40 text-[11px] font-bold text-[#E5484D]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Datos inconsistentes</span>
              </span>
            )}
          </div>

          <button
            onClick={() => setShowReglamentoModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#181C22] border border-[#22272E] hover:border-[#DCA842]/50 text-xs font-semibold text-[#F1EDE6] hover:text-[#DCA842] transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#DCA842]" />
            <span>Reglamento AFA 2026</span>
          </button>

          <button
            onClick={loadStandings}
            disabled={loading}
            title="Actualizar datos (ESPN)"
            className="p-2 rounded-xl bg-[#181C22] border border-[#22272E] text-[#8B949E] hover:text-[#DCA842] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table Selector Tabs */}
      <div className="flex overflow-x-auto pb-1 scrollbar-none">
        <TabNav
          tabs={tableTabs}
          activeTab={activeTable}
          onChange={(tabId) => {
            const next = tabId as TableType;
            setActiveTable(next);
            if (onTableChange) {
              onTableChange(next);
            }
          }}
        />
      </div>

      {/* Sub-selector obligatorio para Zona A / Zona B en Apertura y Clausura */}
      {isZonePhase && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121519] p-3 rounded-2xl border border-[#22272E]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider pl-1">
              Zonas Oficiales:
            </span>
            <div className="flex items-center gap-1.5 bg-[#181C22] p-1 rounded-xl border border-[#22272E]">
              <button
                onClick={() => setActiveZone('A')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeZone === 'A'
                    ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm'
                    : 'text-[#8B949E] hover:text-[#F1EDE6]'
                }`}
              >
                <span className="w-4 h-4 rounded bg-[#0A0C0E]/20 flex items-center justify-center text-[10px] font-black">
                  A
                </span>
                <span>Zona A (15 Clubes)</span>
              </button>
              <button
                onClick={() => setActiveZone('B')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeZone === 'B'
                    ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm'
                    : 'text-[#8B949E] hover:text-[#F1EDE6]'
                }`}
              >
                <span className="w-4 h-4 rounded bg-[#0A0C0E]/20 flex items-center justify-center text-[10px] font-black">
                  B
                </span>
                <span>Zona B (15 Clubes)</span>
              </button>
            </div>
          </div>

          {/* Selector de visualización en desktop: Lado a lado o individual */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-[11px] font-medium text-[#8B949E]">Formato desktop:</span>
            <div className="flex items-center gap-1 bg-[#181C22] p-1 rounded-xl border border-[#22272E]">
              <button
                onClick={() => setDesktopLayout('split')}
                title="Mostrar Zona A y Zona B lado a lado como dos tablas independientes"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  desktopLayout === 'split' ? 'bg-[#22272E] text-[#DCA842]' : 'text-[#8B949E] hover:text-[#F1EDE6]'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Lado a lado (A y B)</span>
              </button>
              <button
                onClick={() => setDesktopLayout('single')}
                title="Mostrar una sola zona a la vez"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  desktopLayout === 'single' ? 'bg-[#22272E] text-[#DCA842]' : 'text-[#8B949E] hover:text-[#F1EDE6]'
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span>Zona individual</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Explanatory contextual note */}
      <div className="flex items-center justify-between gap-4 text-xs text-[#8B949E] bg-[#121519] p-4 rounded-2xl border border-[#22272E]">
        <div className="flex items-center gap-3">
          <Info className="w-4 h-4 text-[#DCA842] shrink-0" />
          <span className="leading-relaxed">{getTableContextDescription()}</span>
        </div>

        <button
          onClick={handleRunTests}
          className="shrink-0 text-[11px] font-bold text-[#DCA842] hover:underline uppercase tracking-wider hidden md:block"
        >
          Validar reglas
        </button>
      </div>

      {/* Test Runner Feedback Banner */}
      {testResults && (
        <div className="p-4 rounded-2xl bg-[#121519] border border-[#30A46C]/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#30A46C]" />
              <span className="text-xs font-bold text-[#F1EDE6]">
                Motor de Reglas 2026: {testResults.results.filter((r) => r.passed).length}/{testResults.total} tests pasados
              </span>
            </div>
            <button
              onClick={() => setTestResults(null)}
              className="text-[10px] text-[#8B949E] hover:text-[#F1EDE6]"
            >
              Cerrar
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {testResults.results.map((r, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px] text-[#8B949E]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#30A46C] shrink-0" />
                <span className="truncate">{r.testName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Rendering based on Active Table */}
      {loading ? (
        <div className="rounded-2xl bg-[#121519] border border-[#22272E] overflow-hidden">
          {Array.from({ length: 8 }).map((_, idx) => (
            <TableRowSkeleton key={idx} />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-[#121519] border border-[#22272E] p-8 text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-[#E5484D] mx-auto" />
          <div>
            <h3 className="text-base font-bold text-[#F1EDE6]">Error de sincronización</h3>
            <p className="text-xs text-[#8B949E] mt-1">{error}</p>
          </div>
          <button
            onClick={loadStandings}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#181C22] border border-[#22272E] hover:border-[#DCA842] text-xs font-semibold text-[#F1EDE6] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reintentar</span>
          </button>
        </div>
      ) : activeTable === 'copas' ? (
        /* VISTA DEDICADA: CLASIFICACIÓN A COPAS CON MOTIVOS REGLAMENTARIOS */
        <div className="space-y-6">
          {/* Header de Plazas Internacionales */}
          <div className="bg-[#121519] border border-white/[0.08] rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#DCA842]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#DCA842]">
                    CONMEBOL 2027 · 12 Plazas Oficiales
                  </span>
                </div>
                <h3 className="font-editorial font-black text-2xl text-[#F1EDE6]">
                  Clasificación a Copas Internacionales
                </h3>
                <p className="text-xs text-[#8B949E]">
                  Asignación estricta según Reglamento General AFA: 6 plazas a Copa Libertadores y 6 plazas a Copa Sudamericana.
                </p>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center bg-[#181C22] p-1 rounded-xl border border-white/[0.08] text-xs font-semibold self-start md:self-auto">
                <button
                  onClick={() => setCopasFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    copasFilter === 'all'
                      ? 'bg-[#DCA842] text-[#0A0C0E] font-bold shadow-xs'
                      : 'text-[#8B949E] hover:text-[#F1EDE6]'
                  }`}
                >
                  Todas (12)
                </button>
                <button
                  onClick={() => setCopasFilter('libertadores')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    copasFilter === 'libertadores'
                      ? 'bg-[#30A46C] text-[#F1EDE6] font-bold shadow-xs'
                      : 'text-[#8B949E] hover:text-[#F1EDE6]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#30A46C]" />
                  <span>Libertadores (6)</span>
                </button>
                <button
                  onClick={() => setCopasFilter('sudamericana')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    copasFilter === 'sudamericana'
                      ? 'bg-[#3B82F6] text-[#F1EDE6] font-bold shadow-xs'
                      : 'text-[#8B949E] hover:text-[#F1EDE6]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                  <span>Sudamericana (6)</span>
                </button>
              </div>
            </div>

            {/* Content Lists */}
            <div className="space-y-6">
              {/* Copa Libertadores Section */}
              {(copasFilter === 'all' || copasFilter === 'libertadores') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-[#F1EDE6]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#30A46C]" />
                      <span className="text-[#30A46C] uppercase tracking-wider text-[11px]">
                        Copa CONMEBOL Libertadores 2027 (Argentina 1 a 6)
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8B949E] font-normal">Fase de Grupos / Fases Previas</span>
                  </div>

                  {libertadoresPlaces.length > 0 ? (
                    <div className="divide-y divide-white/[0.06] bg-[#15191F] rounded-2xl border border-white/[0.08] overflow-hidden">
                      {libertadoresPlaces.map((place) => {
                        const annualRow = (data as StandingRow[]).find((r) => r.teamId === place.teamId);
                        return (
                          <div
                            key={place.teamId}
                            onClick={() => onSelectClub(place.teamId)}
                            className="py-3 px-4 hover:bg-[#181C22] transition-colors flex items-center justify-between cursor-pointer group"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <span className="font-num font-black text-sm text-[#30A46C] w-7 text-center shrink-0">
                                #{place.placeNumber}
                              </span>
                              <TeamBadge teamId={place.teamId} team={annualRow?.team} logoUrl={annualRow?.team?.logo} size="sm" />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors truncate">
                                    {place.teamName}
                                  </span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#30A46C]/15 text-[#30A46C]">
                                    ARG {place.placeNumber}
                                  </span>
                                </div>
                                <span className="text-xs text-[#8B949E] truncate block mt-0.5">
                                  {place.reason}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              {annualRow && (
                                <div className="text-right hidden sm:block">
                                  <span className="font-num font-black text-sm text-[#F1EDE6] block">
                                    {annualRow.points} <span className="text-[10px] text-[#8B949E] font-normal">pts</span>
                                  </span>
                                  <span className="text-[10px] text-[#8B949E] font-num">
                                    {annualRow.played} PJ · DG {annualRow.goalDiff > 0 ? `+${annualRow.goalDiff}` : annualRow.goalDiff}
                                  </span>
                                </div>
                              )}
                              <ChevronRight className="w-4 h-4 text-[#8B949E] group-hover:text-[#DCA842] transition-colors" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-[#8B949E] py-4 text-center">
                      Calculando asignación de plazas con datos en vivo de la temporada.
                    </p>
                  )}
                </div>
              )}

              {/* Copa Sudamericana Section */}
              {(copasFilter === 'all' || copasFilter === 'sudamericana') && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#F1EDE6]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                      <span className="text-[#3B82F6] uppercase tracking-wider text-[11px]">
                        Copa CONMEBOL Sudamericana 2027 (Argentina 1 a 6)
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8B949E] font-normal">Siguientes 6 mejores Tabla Anual</span>
                  </div>

                  {sudamericanaPlaces.length > 0 ? (
                    <div className="divide-y divide-white/[0.06] bg-[#15191F] rounded-2xl border border-white/[0.08] overflow-hidden">
                      {sudamericanaPlaces.map((place) => {
                        const annualRow = (data as StandingRow[]).find((r) => r.teamId === place.teamId);
                        return (
                          <div
                            key={place.teamId}
                            onClick={() => onSelectClub(place.teamId)}
                            className="py-3 px-4 hover:bg-[#181C22] transition-colors flex items-center justify-between cursor-pointer group"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <span className="font-num font-black text-sm text-[#3B82F6] w-7 text-center shrink-0">
                                #{place.placeNumber}
                              </span>
                              <TeamBadge teamId={place.teamId} team={annualRow?.team} logoUrl={annualRow?.team?.logo} size="sm" />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors truncate">
                                    {place.teamName}
                                  </span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#3B82F6]/15 text-[#3B82F6]">
                                    SUD {place.placeNumber}
                                  </span>
                                </div>
                                <span className="text-xs text-[#8B949E] truncate block mt-0.5">
                                  {place.reason}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              {annualRow && (
                                <div className="text-right hidden sm:block">
                                  <span className="font-num font-black text-sm text-[#F1EDE6] block">
                                    {annualRow.points} <span className="text-[10px] text-[#8B949E] font-normal">pts</span>
                                  </span>
                                  <span className="text-[10px] text-[#8B949E] font-num">
                                    {annualRow.played} PJ · DG {annualRow.goalDiff > 0 ? `+${annualRow.goalDiff}` : annualRow.goalDiff}
                                  </span>
                                </div>
                              )}
                              <ChevronRight className="w-4 h-4 text-[#8B949E] group-hover:text-[#DCA842] transition-colors" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-[#8B949E] py-4 text-center">
                      Calculando asignación de plazas para Copa Sudamericana.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Regulatory rules notice */}
            <div className="p-4 rounded-xl bg-[#181C22] border border-white/[0.08] text-xs text-[#8B949E] space-y-1">
              <span className="font-bold text-[#F1EDE6] block">Criterio Oficial de Reasignación de Plazas (AFA):</span>
              <p>
                Si un club se consagra campeón de múltiples certámenes (p. ej. Apertura y Clausura, o Copa Argentina) o ya hubiere obtenido su plaza a Copa Libertadores por su ubicación en la Tabla General Anual, el cupo no se pierde: se reasigna de manera directa al siguiente club mejor clasificado de la Tabla General Anual que no estuviere clasificado. Los clubes descendidos no pueden disputar copas internacionales salvo consagración en Copa Argentina con anuencia Conmebol.
              </p>
            </div>
          </div>
        </div>
      ) : activeTable === 'playoffs' ? (
        /* VISTA DEDICADA: CUADRO OFICIAL DE PLAYOFFS COMPLETO (OCTAVOS, CUARTOS, SEMIS, FINAL) */
        <PlayoffBracketView
          zoneA={zoneA}
          zoneB={zoneB}
          onSelectClub={onSelectClub}
          tournamentPhase="apertura"
        />
      ) : isZonePhase ? (
        /* VISTA OBLIGATORIA DE ZONAS: TABLA A Y TABLA B INDEPENDIENTES (JAMÁS MEZCLADAS) */
        <div className="space-y-6">
          {/* Banner Oficial de Campeón Belgrano de Córdoba cuando el Apertura está cerrado */}
          {activeTable === 'apertura' && isAperturaClosed && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#121519] via-[#0E2638] to-[#121519] border border-[#00A8E8]/40 p-5 sm:p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#00A8E8]/20 border border-[#00A8E8]/40 flex items-center justify-center p-2.5 shrink-0 shadow-inner">
                    <Trophy className="w-8 h-8 text-[#00A8E8]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#00A8E8]/20 text-[#00A8E8] text-[10px] font-black uppercase tracking-wider border border-[#00A8E8]/30">
                        Campeón Oficial AFA
                      </span>
                      <span className="text-[11px] font-semibold text-[#8B949E]">
                        Temporada Oficial 2026 · Certamen Cerrado
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#F1EDE6] tracking-tight">
                      ¡Belgrano de Córdoba Campeón del Torneo Apertura 2026!
                    </h2>
                    <p className="text-xs text-[#8B949E] mt-1 max-w-xl">
                      El Pirata se coronó campeón oficial tras vencer a River Plate por 3-2 en la Gran Final disputada en el Estadio Mario Alberto Kempes (24 de Mayo de 2026).
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-1.5 border-t sm:border-t-0 border-white/[0.08] pt-3 sm:pt-0 shrink-0">
                  <span className="text-[10px] text-[#8B949E] uppercase font-bold tracking-wider">Plazas Obtenidas:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-[#30A46C]/15 border border-[#30A46C]/30 text-[#30A46C] text-xs font-black">
                      Copa Libertadores 2027 (Arg 1)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-[#DCA842]/15 border border-[#DCA842]/30 text-[#DCA842] text-xs font-black">
                      Trofeo de Campeones 2026
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {desktopLayout === 'split' ? (
            <>
              {/* Desktop: Vista lado a lado de ambas zonas independientes */}
              <div className="hidden lg:grid lg:grid-cols-2 gap-6">
                <div>
                  <StandingsTable
                    tableType={activeTable}
                    zoneTitle={`Zona A (${zoneA.length} Clubes)`}
                    zoneBadge="A"
                    data={zoneA}
                    onSelectClub={onSelectClub}
                    unavailableMessage={unavailableMessage}
                    dataState={uiState}
                    inconsistencies={inconsistencies}
                  />
                </div>
                <div>
                  <StandingsTable
                    tableType={activeTable}
                    zoneTitle={`Zona B (${zoneB.length} Clubes)`}
                    zoneBadge="B"
                    data={zoneB}
                    onSelectClub={onSelectClub}
                    unavailableMessage={unavailableMessage}
                    dataState={uiState}
                    inconsistencies={inconsistencies}
                  />
                </div>
              </div>

              {/* Mobile / Pantallas pequeñas: Alternancia por tabs A/B */}
              <div className="lg:hidden">
                <StandingsTable
                  tableType={activeTable}
                  zoneTitle={`Zona ${activeZone} (${activeZone === 'A' ? zoneA.length : zoneB.length} Clubes)`}
                  zoneBadge={activeZone}
                  data={activeZone === 'A' ? zoneA : zoneB}
                  onSelectClub={onSelectClub}
                  unavailableMessage={unavailableMessage}
                  dataState={uiState}
                  inconsistencies={inconsistencies}
                />
              </div>
            </>
          ) : (
            /* Vista individual seleccionada */
            <StandingsTable
              tableType={activeTable}
              zoneTitle={`Zona ${activeZone} (${activeZone === 'A' ? zoneA.length : zoneB.length} Clubes)`}
              zoneBadge={activeZone}
              data={activeZone === 'A' ? zoneA : zoneB}
              onSelectClub={onSelectClub}
              unavailableMessage={unavailableMessage}
              dataState={uiState}
              inconsistencies={inconsistencies}
            />
          )}
        </div>
      ) : (
        /* TABLA ANUAL DE 30 CLUBES JUNTOS O PROMEDIOS */
        <StandingsTable
          tableType={activeTable}
          data={data}
          onSelectClub={onSelectClub}
          unavailableMessage={unavailableMessage}
          dataState={uiState}
          inconsistencies={inconsistencies}
        />
      )}

      {/* Modal: Reglamento Torneos Primera División 2026 */}
      {showReglamentoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121519] border border-[#22272E] rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#22272E] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DCA842]">
                  Documento Oficial AFA / LPF
                </span>
                <h3 className="font-editorial font-black text-2xl text-[#F1EDE6]">
                  Reglamento de Competición 2026
                </h3>
              </div>
              <button
                onClick={() => setShowReglamentoModal(false)}
                className="w-8 h-8 rounded-full bg-[#181C22] text-[#8B949E] hover:text-[#F1EDE6] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#8B949E] leading-relaxed">
              <div className="p-4 rounded-2xl bg-[#181C22] border border-[#22272E]">
                <h4 className="font-bold text-sm text-[#F1EDE6] mb-1">
                  1. Estructura de 30 Clubes (Zona A y Zona B)
                </h4>
                <p>
                  La Primera División se disputa con 30 equipos divididos en dos zonas de 15 clubes cada una. En el Torneo Apertura y Clausura se disputan 16 fechas de fase regular (14 dentro de la zona + partidos interzonales de clásicos y fecha complementaria).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#181C22] border border-[#22272E]">
                <h4 className="font-bold text-sm text-[#F1EDE6] mb-1">
                  2. Criterio Oficial de Desempate en Zonas
                </h4>
                <p className="mb-2">
                  En caso de igualdad en puntos entre dos o más equipos, se aplican estrictamente los siguientes criterios sucesivos:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[#F1EDE6]">
                  <li>Mayor diferencia de goles en la fase de zonas.</li>
                  <li>Mayor cantidad de goles a favor.</li>
                  <li>Mayor cantidad de puntos obtenidos en los partidos entre los equipos involucrados.</li>
                  <li>Mayor diferencia de goles en los partidos disputados entre sí.</li>
                  <li>Mayor cantidad de goles a favor en dichos encuentros.</li>
                  <li>Tabla de Fair Play (menor número de sanciones computadas).</li>
                  <li>Sorteo oficial realizado por la Liga Profesional.</li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-[#181C22] border border-[#22272E]">
                <h4 className="font-bold text-sm text-[#F1EDE6] mb-1">
                  3. Inhabilitación por Descenso en Clausura
                </h4>
                <p>
                  Si un club clasifica entre los 8 mejores de su zona pero finaliza en posición de descenso o debe jugar un desempate por la permanencia (por Tabla Anual o Promedios), NO disputará la fase final de playoffs; su plaza es asumida por el siguiente clasificado elegible de su respectiva zona (9°, 10°, etc.).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#181C22] border border-[#22272E]">
                <h4 className="font-bold text-sm text-[#F1EDE6] mb-1">
                  4. Campeón de Liga y Tabla General Anual
                </h4>
                <p>
                  La Tabla Anual suma exclusivamente las fases regulares del Apertura y Clausura (32 fechas). Las instancias de playoffs no suman puntos para la Tabla Anual. El club que finalice en 1° posición es proclamado Campeón de Liga 2026.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#181C22] border border-[#22272E]">
                <h4 className="font-bold text-sm text-[#F1EDE6] mb-1">
                  5. Copas y Supercopas Nacionales
                </h4>
                <p>
                  El Trofeo de Campeones enfrenta al Campeón del Apertura vs Campeón del Clausura. Si el mismo club gana ambos, se disputa un desempate entre los subcampeones. La Recopa de Campeones prevista reunirá en un triangular al Campeón de Copa Argentina, Supercopa Argentina y Supercopa Internacional.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#22272E] flex justify-end">
              <button
                onClick={() => setShowReglamentoModal(false)}
                className="px-6 py-2.5 rounded-xl bg-[#DCA842] text-[#0A0C0E] font-bold text-xs uppercase tracking-wider hover:bg-[#c99532] transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
