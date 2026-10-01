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
  Sparkles,
} from 'lucide-react';

interface MatchesPageProps {
  matches?: Match[];
  onSelectMatch: (matchId: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

type MatchesViewMode = 'proxima_fecha' | 'en_vivo' | 'resultados' | 'fixture_completo';
type ZoneFilter = 'all' | 'A' | 'B';

export const MatchesPage: React.FC<MatchesPageProps> = ({
  matches: initialMatches = [],
  onSelectMatch,
  onRefresh,
  isLoading: initialLoading = false,
}) => {
  const [viewMode, setViewMode] = useState<MatchesViewMode>('proxima_fecha');
  const [zoneFilter, setZoneFilter] = useState<ZoneFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(
    async (mode: MatchesViewMode, zone: ZoneFilter) => {
      setIsLoading(true);
      setError(null);
      try {
        const filter: MatchFilter = {};

        if (mode === 'proxima_fecha') {
          filter.scope = 'upcoming';
        } else if (mode === 'en_vivo') {
          filter.status = 'live';
        } else if (mode === 'resultados') {
          filter.scope = 'recent';
        } else if (mode === 'fixture_completo') {
          filter.scope = 'all';
        }

        if (zone !== 'all') {
          filter.zone = zone;
        }

        const data = await footballService.getMatches(filter);
        setMatches(data);
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

  // Client search filter
  const displayedMatches = useMemo(() => {
    return matches.filter((m) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const home = (m.homeTeam?.name || m.homeTeam?.shortName || '').toLowerCase();
      const away = (m.awayTeam?.name || m.awayTeam?.shortName || '').toLowerCase();
      const stadium = (m.stadium || '').toLowerCase();
      const round = (m.round || '').toLowerCase();
      return home.includes(q) || away.includes(q) || stadium.includes(q) || round.includes(q);
    });
  }, [matches, searchQuery]);

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

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Clean Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#DCA842]/15 text-[#DCA842] border border-[#DCA842]/30">
              Torneo Clausura 2026
            </span>
            <span className="text-[11px] text-[#8B949E]">
              Primera División AFA
            </span>
          </div>
          <h1 className="font-editorial font-black text-3xl sm:text-4xl text-[#F1EDE6] tracking-tight">
            PARTIDOS Y FIXTURE
          </h1>
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

      {/* Main Simplified Navigation: Próxima Fecha, En Vivo, Resultados, Fixture */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121519] border border-white/[0.08] p-2.5 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setViewMode('proxima_fecha')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              viewMode === 'proxima_fecha'
                ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm'
                : 'text-[#8B949E] hover:text-[#F1EDE6] hover:bg-[#181C22]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Próxima Fecha</span>
          </button>

          <button
            onClick={() => setViewMode('resultados')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              viewMode === 'resultados'
                ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm'
                : 'text-[#8B949E] hover:text-[#F1EDE6] hover:bg-[#181C22]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Últimos Resultados</span>
          </button>

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

          <button
            onClick={() => setViewMode('fixture_completo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              viewMode === 'fixture_completo'
                ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm'
                : 'text-[#8B949E] hover:text-[#F1EDE6] hover:bg-[#181C22]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Fixture Completo</span>
          </button>
        </div>

        {/* Zona A / Zona B Filter */}
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
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <MatchCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title="No se pudieron cargar los partidos"
          description={error}
          actionLabel="Reintentar"
          onAction={() => fetchMatches(viewMode, zoneFilter)}
        />
      ) : displayedMatches.length === 0 ? (
        <EmptyState
          title={
            viewMode === 'en_vivo'
              ? 'No hay partidos en juego en este momento'
              : 'No se encontraron partidos'
          }
          description={
            viewMode === 'en_vivo'
              ? 'Los cotejos en directo se actualizarán automáticamente cuando comience la jornada.'
              : searchQuery
              ? `No hay partidos programados para "${searchQuery}".`
              : 'No hay partidos disponibles para la vista seleccionada.'
          }
          actionLabel={viewMode === 'en_vivo' ? 'Ver Próxima Fecha' : undefined}
          onAction={viewMode === 'en_vivo' ? () => setViewMode('proxima_fecha') : undefined}
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedMatches).map(([dateStr, dateMatches]) => (
            <div key={dateStr} className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08]">
                <Calendar className="w-4 h-4 text-[#DCA842]" />
                <h3 className="font-editorial font-bold text-base text-[#F1EDE6]">
                  {formatDateHeader(dateStr)}
                </h3>
                <span className="text-[11px] text-[#8B949E] ml-auto font-medium">
                  {dateMatches.length} {dateMatches.length === 1 ? 'partido' : 'partidos'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dateMatches.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    onClick={() => onSelectMatch(m.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
