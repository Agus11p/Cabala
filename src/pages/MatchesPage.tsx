import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Match } from '../types/football';
import { MatchCard } from '../components/matches/MatchCard';
import { EmptyState } from '../components/common/EmptyState';
import { MatchCardSkeleton } from '../components/common/SkeletonLoader';
import { footballService, MatchFilter } from '../services/footballService';
import {
  Calendar,
  RefreshCw,
  Search,
  Radio,
  CheckCircle2,
  Clock,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface MatchesPageProps {
  matches?: Match[];
  onSelectMatch: (matchId: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export type MatchesViewMode = 'fecha_actual' | 'en_vivo' | 'copa_argentina' | 'resultados' | 'fixture_completo';
export type ZoneFilter = 'all' | 'A' | 'B';

// Fechas oficiales del Clausura 2026 con rangos de días para filtrado limpio
const CLAUSURA_ROUNDS = [
  { id: 'fecha_1', label: 'Fecha 1', start: '2026-07-16', end: '2026-07-20' },
  { id: 'fecha_2', label: 'Fecha 2', start: '2026-07-23', end: '2026-07-27' },
  { id: 'fecha_3', label: 'Fecha 3', start: '2026-07-30', end: '2026-08-03' },
  { id: 'fecha_4', label: 'Fecha 4', start: '2026-08-06', end: '2026-08-10' },
  { id: 'fecha_5', label: 'Fecha 5', start: '2026-08-13', end: '2026-08-17' },
  { id: 'fecha_6', label: 'Fecha 6', start: '2026-08-20', end: '2026-08-24' },
  { id: 'fecha_7', label: 'Fecha 7', start: '2026-08-27', end: '2026-08-31' },
  { id: 'fecha_8', label: 'Fecha 8', start: '2026-09-03', end: '2026-09-07' },
  { id: 'fecha_9', label: 'Fecha 9', start: '2026-09-10', end: '2026-09-14' },
  { id: 'fecha_10', label: 'Fecha 10', start: '2026-09-17', end: '2026-09-21' },
  { id: 'fecha_11', label: 'Fecha 11', start: '2026-09-24', end: '2026-09-28' },
  { id: 'fecha_12', label: 'Fecha 12 (Fecha Actual)', start: '2026-10-02', end: '2026-10-05', isCurrent: true },
  { id: 'fecha_13', label: 'Fecha 13', start: '2026-10-09', end: '2026-10-12' },
  { id: 'fecha_14', label: 'Fecha 14', start: '2026-10-16', end: '2026-10-19' },
  { id: 'fecha_15', label: 'Fecha 15', start: '2026-10-23', end: '2026-10-26' },
];

export const MatchesPage: React.FC<MatchesPageProps> = ({
  matches: initialMatches = [],
  onSelectMatch,
  onRefresh,
  isLoading: initialLoading = false,
}) => {
  // PREDETERMINADO: 'fecha_actual' (muestra únicamente los ~14 partidos de la fecha en disputa)
  const [viewMode, setViewMode] = useState<MatchesViewMode>('fecha_actual');
  const [selectedRoundIndex, setSelectedRoundIndex] = useState<number>(11); // Fecha 12 preseleccionada
  const [zoneFilter, setZoneFilter] = useState<ZoneFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [copaMatches, setCopaMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(
    async (mode: MatchesViewMode, zone: ZoneFilter) => {
      setIsLoading(true);
      setError(null);
      try {
        if (mode === 'copa_argentina') {
          const ca = await footballService.getCopaArgentinaMatches();
          setCopaMatches(ca);
          setMatches(ca);
        } else {
          const filter: MatchFilter = {};

          if (mode === 'en_vivo') {
            filter.status = 'live';
          } else if (mode === 'resultados') {
            filter.scope = 'recent';
          } else {
            // fecha_actual o fixture_completo
            filter.scope = 'all';
          }

          if (zone !== 'all') {
            filter.zone = zone;
          }

          const data = await footballService.getMatches(filter);
          setMatches(data);
        }
      } catch (err: any) {
        console.error('Error fetching matches:', err);
        setError(err.message || 'Error al consultar el fixture de partidos.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchMatches(viewMode, zoneFilter);
  }, [viewMode, zoneFilter, fetchMatches]);

  // Filtrado específico según modo y fecha actual
  const currentRoundInfo = CLAUSURA_ROUNDS[selectedRoundIndex] || CLAUSURA_ROUNDS[11];

  const filteredByMode = useMemo(() => {
    if (viewMode === 'fecha_actual') {
      // Filtrar únicamente los partidos comprendidos en la fecha seleccionada
      const roundMatches = matches.filter((m) => {
        if (!m.date) return false;
        return m.date >= currentRoundInfo.start && m.date <= currentRoundInfo.end;
      });
      // Priorizar en vivo primero, luego cronológicamente por timestamp oficial
      return roundMatches.sort((a, b) => {
        if (a.status === 'live' && b.status !== 'live') return -1;
        if (b.status === 'live' && a.status !== 'live') return 1;
        return (a.timestamp || 0) - (b.timestamp || 0);
      });
    }

    if (viewMode === 'en_vivo') {
      return matches.filter((m) => m.status === 'live');
    }

    if (viewMode === 'resultados') {
      return matches
        .filter((m) => m.status === 'finished')
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, 20); // Máximo 20 recientes para no abrumar
    }

    if (viewMode === 'copa_argentina') {
      return matches.filter((m) => (m.tournament || '').toLowerCase().includes('copa argentina'));
    }

    // Fixture completo: ordenado cronológicamente
    return matches;
  }, [matches, viewMode, currentRoundInfo]);

  // Client search filter
  const displayedMatches = useMemo(() => {
    return filteredByMode.filter((m) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const home = (m.homeTeam?.name || m.homeTeam?.shortName || '').toLowerCase();
      const away = (m.awayTeam?.name || m.awayTeam?.shortName || '').toLowerCase();
      const stadium = (m.stadium || '').toLowerCase();
      const round = (m.round || '').toLowerCase();
      return home.includes(q) || away.includes(q) || stadium.includes(q) || round.includes(q);
    });
  }, [filteredByMode, searchQuery]);

  // Conteo de partidos en vivo para el badge
  const liveCount = useMemo(() => {
    return matches.filter((m) => m.status === 'live').length;
  }, [matches]);

  // Agrupar partidos por fecha para lectura limpia
  const groupedMatches = useMemo(() => {
    const groups: Record<string, Match[]> = {};
    for (const match of displayedMatches) {
      const dateKey = match.date || 'Fecha por confirmar';
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(match);
    }
    return groups;
  }, [displayedMatches]);

  const formatDateHeader = (dateStr: string) => {
    if (!dateStr || dateStr.includes('confirmar')) return dateStr;
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      };
      const formatted = d.toLocaleDateString('es-AR', options);
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } catch {
      return dateStr;
    }
  };

  const handlePrevRound = () => {
    if (selectedRoundIndex > 0) {
      setSelectedRoundIndex(selectedRoundIndex - 1);
    }
  };

  const handleNextRound = () => {
    if (selectedRoundIndex < CLAUSURA_ROUNDS.length - 1) {
      setSelectedRoundIndex(selectedRoundIndex + 1);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Clean Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#DCA842]/15 text-[#DCA842] border border-[#DCA842]/30">
              Primera División 2026
            </span>
            <span className="text-[11px] text-[#8B949E]">
              {viewMode === 'copa_argentina' ? 'Copa Argentina Federal AFA' : 'Torneo Clausura Oficial'}
            </span>
          </div>
          <h1 className="font-editorial font-black text-3xl sm:text-4xl text-[#F1EDE6] tracking-tight">
            PARTIDOS Y FIXTURE
          </h1>
          <p className="text-xs text-[#8B949E] mt-0.5">
            {viewMode === 'fecha_actual'
              ? `Viendo solo los ${displayedMatches.length} partidos de la jornada actual para una lectura clara y rápida.`
              : 'Fixture oficial de torneos y copas del fútbol argentino.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchMatches(viewMode, zoneFilter)}
            disabled={isLoading || initialLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121519] border border-white/[0.08] hover:border-[#DCA842] text-xs font-semibold text-[#8B949E] hover:text-[#DCA842] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading || initialLoading ? 'animate-spin text-[#DCA842]' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Main Mode Navigation: Fecha Actual (predeterminado), En Vivo, Copa Argentina, Resultados, Fixture */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121519] border border-white/[0.08] p-2.5 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {/* 1. FECHA ACTUAL (Default requested by user) */}
          <button
            onClick={() => setViewMode('fecha_actual')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              viewMode === 'fecha_actual'
                ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm font-extrabold'
                : 'text-[#8B949E] hover:text-[#F1EDE6] hover:bg-[#181C22]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Fecha Actual</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/15 font-num">
              {CLAUSURA_ROUNDS[selectedRoundIndex].label.split(' ')[1]}
            </span>
          </button>

          {/* 2. EN VIVO */}
          <button
            onClick={() => setViewMode('en_vivo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              viewMode === 'en_vivo'
                ? 'bg-[#E63946] text-white shadow-sm'
                : 'text-[#8B949E] hover:text-[#F1EDE6] hover:bg-[#181C22]'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-[#E63946]" />
            <span>En Vivo</span>
            {liveCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#E63946] animate-pulse" />
            )}
          </button>

          {/* 3. COPA ARGENTINA (Direct match access) */}
          <button
            onClick={() => setViewMode('copa_argentina')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              viewMode === 'copa_argentina'
                ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm font-extrabold'
                : 'text-[#8B949E] hover:text-[#F1EDE6] hover:bg-[#181C22]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Copa Argentina</span>
          </button>

          {/* 4. RESULTADOS RECIENTES */}
          <button
            onClick={() => setViewMode('resultados')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              viewMode === 'resultados'
                ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm font-extrabold'
                : 'text-[#8B949E] hover:text-[#F1EDE6] hover:bg-[#181C22]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resultados</span>
          </button>

          {/* 5. FIXTURE COMPLETO */}
          <button
            onClick={() => setViewMode('fixture_completo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              viewMode === 'fixture_completo'
                ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm font-extrabold'
                : 'text-[#8B949E] hover:text-[#F1EDE6] hover:bg-[#181C22]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Todas las Fechas</span>
          </button>
        </div>

        {/* Zona A / Zona B Filter */}
        {viewMode !== 'copa_argentina' && (
          <div className="flex items-center gap-1 bg-[#181C22] p-1 rounded-xl border border-white/[0.06] shrink-0 self-start sm:self-auto">
            {(['all', 'A', 'B'] as ZoneFilter[]).map((z) => (
              <button
                key={z}
                onClick={() => setZoneFilter(z)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  zoneFilter === z
                    ? 'bg-[#DCA842] text-[#0A0C0E] font-bold'
                    : 'text-[#8B949E] hover:text-[#F1EDE6]'
                }`}
              >
                {z === 'all' ? 'Todas' : `Zona ${z}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selector de Jornada / Round Controller (cuando se está en "Fecha Actual" o "Fixture Completo") */}
      {viewMode === 'fecha_actual' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#181C22] via-[#15191F] to-[#121519] border border-white/[0.08]">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevRound}
              disabled={selectedRoundIndex === 0}
              className="p-2 rounded-xl bg-[#121519] border border-white/[0.08] hover:border-[#DCA842] text-[#8B949E] hover:text-[#F1EDE6] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Fecha anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#DCA842]" />
                <span className="text-[10px] font-black uppercase tracking-wider text-[#DCA842]">
                  {currentRoundInfo.isCurrent ? 'FECHA EN DISPUTA' : 'JORNADA OFICIAL'}
                </span>
              </div>
              <h2 className="font-editorial font-bold text-base sm:text-lg text-[#F1EDE6]">
                {currentRoundInfo.label}
              </h2>
            </div>

            <button
              onClick={handleNextRound}
              disabled={selectedRoundIndex === CLAUSURA_ROUNDS.length - 1}
              className="p-2 rounded-xl bg-[#121519] border border-white/[0.08] hover:border-[#DCA842] text-[#8B949E] hover:text-[#F1EDE6] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Fecha siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-[#8B949E] hidden sm:inline">Ir a fecha:</span>
            <select
              value={selectedRoundIndex}
              onChange={(e) => setSelectedRoundIndex(Number(e.target.value))}
              className="bg-[#121519] border border-white/[0.12] hover:border-[#DCA842] text-xs font-semibold text-[#F1EDE6] py-1.5 px-3 rounded-xl focus:outline-hidden transition-colors cursor-pointer"
            >
              {CLAUSURA_ROUNDS.map((r, idx) => (
                <option key={r.id} value={idx} className="bg-[#121519] text-[#F1EDE6]">
                  {r.label}
                </option>
              ))}
            </select>
            {selectedRoundIndex !== 11 && (
              <button
                onClick={() => setSelectedRoundIndex(11)}
                className="text-[11px] px-2.5 py-1.5 rounded-xl bg-[#DCA842]/15 text-[#DCA842] border border-[#DCA842]/30 font-bold hover:bg-[#DCA842]/25 transition-colors"
              >
                Volver a Fecha 12
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#8B949E] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar partido por club (ej. Boca, River, Racing)..."
          className="w-full bg-[#121519] border border-white/[0.08] focus:border-[#DCA842] text-xs text-[#F1EDE6] pl-10 pr-4 py-2.5 rounded-xl placeholder-[#8B949E]/50 focus:outline-hidden transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-[11px] text-[#8B949E] hover:text-[#F1EDE6] absolute right-3 top-1/2 -translate-y-1/2 font-semibold"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Matches Content */}
      {isLoading || initialLoading ? (
        <div className="space-y-4">
          <MatchCardSkeleton />
          <MatchCardSkeleton />
          <MatchCardSkeleton />
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-[#121519] rounded-2xl border border-red-500/20 text-red-400 space-y-3">
          <p className="font-semibold text-sm">{error}</p>
          <button
            onClick={() => fetchMatches(viewMode, zoneFilter)}
            className="px-4 py-2 bg-[#DCA842] text-[#0A0C0E] font-bold text-xs rounded-xl"
          >
            Reintentar
          </button>
        </div>
      ) : displayedMatches.length === 0 ? (
        <EmptyState
          title={
            viewMode === 'en_vivo'
              ? 'No hay partidos en juego en este momento'
              : 'No se encontraron partidos para este filtro'
          }
          description={
            viewMode === 'en_vivo'
              ? 'Consultá la pestaña "Fecha Actual" para ver los encuentros programados y resultados de la jornada.'
              : 'Probá seleccionando otra jornada o quitando los filtros de búsqueda.'
          }
          actionLabel="Ver Fecha Actual"
          onAction={() => {
            setViewMode('fecha_actual');
            setSelectedRoundIndex(11);
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedMatches).map(([dateStr, dateMatches]) => (
            <div key={dateStr} className="space-y-3">
              {/* Date Header */}
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2 pt-1">
                <Calendar className="w-3.5 h-3.5 text-[#DCA842]" />
                <h3 className="text-xs font-bold text-[#F1EDE6] tracking-wide">
                  {formatDateHeader(dateStr)}
                </h3>
                <span className="text-[10px] text-[#8B949E] font-num">
                  ({dateMatches.length} {dateMatches.length === 1 ? 'partido' : 'partidos'})
                </span>
              </div>

              {/* Match Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {dateMatches.map((match) => (
                  <MatchCard key={match.id} match={match} onClick={onSelectMatch} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
