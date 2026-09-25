import React, { useState, useEffect } from 'react';
import { TableType, StandingRow, PromediosRow, ZoneStanding, UIState, DataInconsistencyRecord } from '../types/football';
import { footballService } from '../services/footballService';
import { StandingsTable } from '../components/standings/StandingsTable';
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
} from 'lucide-react';

interface StandingsPageProps {
  onSelectClub: (clubId: string) => void;
  initialTable?: TableType;
}

export const StandingsPage: React.FC<StandingsPageProps> = ({ onSelectClub, initialTable }) => {
  const [activeTable, setActiveTable] = useState<TableType>(initialTable || 'clausura');

  useEffect(() => {
    if (initialTable) {
      setActiveTable(initialTable);
    }
  }, [initialTable]);
  const [activeZone, setActiveZone] = useState<'A' | 'B'>('A');
  const [desktopLayout, setDesktopLayout] = useState<'split' | 'single'>('split');
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
    { id: 'clausura' as const, label: 'Torneo Clausura' },
    { id: 'apertura' as const, label: 'Torneo Apertura' },
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

    // If viewing copas or playoffs, we load the base standings to compute real deterministic projections
    const queryType = activeTable === 'copas' || activeTable === 'playoffs' ? 'clausura' : activeTable;

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
        return 'Tabla de Promedios: Cociente de puntos sobre partidos disputados en las últimas 3 temporadas (2024, 2025 y 2026). Si el proveedor de datos (ESPN) no suministra coeficientes oficiales, se indica datos no disponibles.';
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
                <span>Sin datos disponibles en ESPN</span>
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
          onChange={(tabId) => setActiveTable(tabId as TableType)}
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
        <div className="space-y-8">
          {/* Copa Libertadores */}
          <section className="bg-[#121519] border border-[#22272E] rounded-3xl p-6 shadow-lg">
            <div className="flex items-center gap-3 pb-4 border-b border-[#22272E] mb-6">
              <span className="w-3 h-3 rounded-full bg-[#30A46C]" />
              <div>
                <h3 className="font-editorial font-bold text-xl text-[#F1EDE6]">
                  Copa CONMEBOL Libertadores 2027 (6 Cupos)
                </h3>
                <span className="text-[11px] text-[#8B949E]">
                  Campeones del año (Apertura, Clausura y Copa Argentina) + Mejores clasificados de la Tabla Anual.
                </span>
              </div>
            </div>

            {libertadoresPlaces.length > 0 ? (
              <div className="divide-y divide-[#22272E]">
                {libertadoresPlaces.map((place) => (
                  <div
                    key={place.teamId}
                    onClick={() => onSelectClub(place.teamId)}
                    className="py-3 px-3 rounded-xl hover:bg-[#181C22] transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-num font-black text-sm text-[#30A46C] w-6 text-center">
                        {place.placeNumber}°
                      </span>
                      <TeamBadge teamId={place.teamId} size="xs" />
                      <div>
                        <span className="font-bold text-sm text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors block">
                          {place.teamName}
                        </span>
                        <span className="text-xs text-[#8B949E] block">
                          {place.reason}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#8B949E] group-hover:text-[#DCA842] transition-colors" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8B949E] py-4 text-center">
                Calculando asignación de plazas con datos en vivo de la temporada.
              </p>
            )}
          </section>

          {/* Copa Sudamericana */}
          <section className="bg-[#121519] border border-[#22272E] rounded-3xl p-6 shadow-lg">
            <div className="flex items-center gap-3 pb-4 border-b border-[#22272E] mb-6">
              <span className="w-3 h-3 rounded-full bg-[#3B82F6]" />
              <div>
                <h3 className="font-editorial font-bold text-xl text-[#F1EDE6]">
                  Copa CONMEBOL Sudamericana 2027 (6 Cupos)
                </h3>
                <span className="text-[11px] text-[#8B949E]">
                  Siguientes 6 mejores ubicados de la Tabla General Anual que no hayan accedido a Libertadores.
                </span>
              </div>
            </div>

            {sudamericanaPlaces.length > 0 ? (
              <div className="divide-y divide-[#22272E]">
                {sudamericanaPlaces.map((place) => (
                  <div
                    key={place.teamId}
                    onClick={() => onSelectClub(place.teamId)}
                    className="py-3 px-3 rounded-xl hover:bg-[#181C22] transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-num font-black text-sm text-[#3B82F6] w-6 text-center">
                        {place.placeNumber}°
                      </span>
                      <TeamBadge teamId={place.teamId} size="xs" />
                      <div>
                        <span className="font-bold text-sm text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors block">
                          {place.teamName}
                        </span>
                        <span className="text-xs text-[#8B949E] block">
                          {place.reason}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#8B949E] group-hover:text-[#DCA842] transition-colors" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8B949E] py-4 text-center">
                Calculando asignación de plazas para Copa Sudamericana.
              </p>
            )}
          </section>
        </div>
      ) : activeTable === 'playoffs' ? (
        /* VISTA DEDICADA: CUADRO OFICIAL DE OCTAVOS DE FINAL */
        <section className="bg-[#121519] border border-[#22272E] rounded-3xl p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#22272E]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#DCA842]">
                Instancia Final AFA 2026
              </span>
              <h3 className="font-editorial font-black text-2xl text-[#F1EDE6]">
                Cuadro Oficial de Octavos de Final
              </h3>
              <p className="text-xs text-[#8B949E] mt-1">
                Cruces reglamentarios interzonales: 1A vs 8B, 1B vs 8A, 2A vs 7B, 2B vs 7A, 3A vs 6B, 3B vs 6A, 4A vs 5B, 4B vs 5A. Localía para el mejor ubicado.
              </p>
            </div>
            <Award className="w-6 h-6 text-[#DCA842]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {playoffMatchups.map((matchup) => (
              <div
                key={matchup.id}
                className="p-4 rounded-2xl bg-[#181C22] border border-[#22272E] hover:border-[#DCA842]/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between text-[11px] text-[#8B949E] pb-2 border-b border-[#22272E]/60">
                  <span className="font-bold text-[#DCA842]">Llave #{matchup.matchNumber}</span>
                  <span>Partido único con penales en caso de empate</span>
                </div>

                <div className="space-y-2">
                  {/* Home Team (Better seeded) */}
                  <div
                    onClick={() => onSelectClub(matchup.homeTeam.teamId)}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#121519] cursor-pointer hover:bg-[#1C2128] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-num text-xs font-bold text-[#DCA842] w-5 text-center">
                        {matchup.homeTeam.position}°
                      </span>
                      <TeamBadge teamId={matchup.homeTeam.teamId} size="xs" />
                      <span className="font-bold text-xs text-[#F1EDE6]">
                        {matchup.homeTeam.team?.name || matchup.homeTeam.teamId}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-[#30A46C] px-2 py-0.5 rounded bg-[#30A46C]/10">
                      Local
                    </span>
                  </div>

                  {/* Away Team */}
                  <div
                    onClick={() => onSelectClub(matchup.awayTeam.teamId)}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#121519] cursor-pointer hover:bg-[#1C2128] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-num text-xs font-bold text-[#8B949E] w-5 text-center">
                        {matchup.awayTeam.position}°
                      </span>
                      <TeamBadge teamId={matchup.awayTeam.teamId} size="xs" />
                      <span className="font-semibold text-xs text-[#F1EDE6]">
                        {matchup.awayTeam.team?.name || matchup.awayTeam.teamId}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-semibold text-[#8B949E] px-2 py-0.5 rounded bg-[#22272E]">
                      Visita
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-[#8B949E] pt-1">
                  <span>{matchup.venueNote}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : isZonePhase ? (
        /* VISTA OBLIGATORIA DE ZONAS: TABLA A Y TABLA B INDEPENDIENTES (JAMÁS MEZCLADAS) */
        <div>
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
