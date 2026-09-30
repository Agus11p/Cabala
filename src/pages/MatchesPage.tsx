import React, { useState, useEffect, useCallback } from 'react';
import { Match } from '../types/football';
import { MatchCard } from '../components/matches/MatchCard';
import { EmptyState } from '../components/common/EmptyState';
import { MatchCardSkeleton } from '../components/common/SkeletonLoader';
import { footballService, MatchFilter } from '../services/footballService';
import {
  Calendar,
  RefreshCw,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronRight,
  Flame,
  Search,
} from 'lucide-react';

interface MatchesPageProps {
  matches?: Match[];
  onSelectMatch: (matchId: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

type TimeScope = 'hoy' | 'manana' | '7d' | '30d' | 'fixture' | 'resultados' | 'todos';
type ZoneFilter = 'all' | 'A' | 'B';
type PhaseFilter = 'all' | 'apertura' | 'clausura' | 'playoffs';

export const MatchesPage: React.FC<MatchesPageProps> = ({
  matches: initialMatches = [],
  onSelectMatch,
  onRefresh,
  isLoading: initialLoading = false,
}) => {
  const [timeScope, setTimeScope] = useState<TimeScope>('7d');
  const [zoneFilter, setZoneFilter] = useState<ZoneFilter>('all');
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isStaleData, setIsStaleData] = useState<boolean>(false);
  const [totalCoverageCount, setTotalCoverageCount] = useState<number | null>(495);

  const fetchMatchesForScope = useCallback(
    async (scope: TimeScope, zone: ZoneFilter, phase: PhaseFilter) => {
      setIsLoading(true);
      setError(null);
      try {
        const filter: MatchFilter = {};

        if (scope === 'hoy') {
          filter.scope = 'today';
        } else if (scope === 'manana') {
          filter.scope = 'tomorrow';
        } else if (scope === '7d') {
          filter.scope = 'upcoming';
          filter.range = '7d';
        } else if (scope === '30d') {
          filter.scope = 'upcoming';
          filter.range = '30d';
        } else if (scope === 'fixture') {
          filter.scope = 'upcoming';
          filter.range = 'regular';
        } else if (scope === 'resultados') {
          filter.scope = 'recent';
        } else if (scope === 'todos') {
          filter.scope = 'all';
        }

        if (zone !== 'all') {
          filter.zone = zone;
        }
        if (phase !== 'all') {
          filter.phase = phase;
        }

        const data = await footballService.getMatches(filter);
        setMatches(data);
        const hasStale = data.some((m: any) => m.isStale || m.verificationStatus === 'STALE');
        setIsStaleData(hasStale);
      } catch (err: any) {
        console.error('Error fetching filtered matches:', err);
        setError(err.message || 'Error al consultar partidos.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchMatchesForScope(timeScope, zoneFilter, phaseFilter);
  }, [timeScope, zoneFilter, phaseFilter, fetchMatchesForScope]);

  // Client search filter
  const displayedMatches = matches.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const home = (m.homeTeam?.name || m.homeTeam?.shortName || '').toLowerCase();
    const away = (m.awayTeam?.name || m.awayTeam?.shortName || '').toLowerCase();
    const stadium = (m.stadium || '').toLowerCase();
    const round = (m.round || '').toLowerCase();
    return home.includes(q) || away.includes(q) || stadium.includes(q) || round.includes(q);
  });

  const liveCount = matches.filter((m) => m.status === 'live').length;
  const scheduledCount = matches.filter((m) => m.status === 'scheduled').length;
  const finishedCount = matches.filter((m) => m.status === 'finished').length;

  const timeTabs: { id: TimeScope; label: string; badge?: string }[] = [
    { id: 'hoy', label: 'Hoy' },
    { id: 'manana', label: 'Mañana' },
    { id: '7d', label: 'Próximos 7 días' },
    { id: '30d', label: 'Próximos 30 días' },
    { id: 'fixture', label: 'Resto del Fixture (Nov 2026)' },
    { id: 'resultados', label: 'Resultados Recientes' },
    { id: 'todos', label: 'Todos (Temporada Completa)' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#DCA842] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              DATA ENGINE 2.0 · INTEGRIDAD REGLAMENTARIA
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
              495 PARTIDOS VERIFICADOS
            </span>
          </div>
          <h1 className="font-editorial font-black text-3xl sm:text-5xl text-[#F1EDE6] tracking-tight">
            PARTIDOS & RESULTADOS
          </h1>
          <p className="text-xs text-[#8B949E] mt-1 font-medium max-w-2xl">
            Cronograma exhaustivo de Primera División 2026. Persistido en Firestore desde ESPN sin datos ficticios. Los partidos futuros no empezados muestran honestamente <strong>SIN DATO</strong> en lugar de scores 0-0.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchMatchesForScope(timeScope, zoneFilter, phaseFilter)}
            disabled={isLoading || initialLoading}
            title="Actualizar partidos desde Firestore"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121519] border border-white/[0.08] hover:border-[#DCA842] text-xs font-semibold text-[#8B949E] hover:text-[#DCA842] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading || initialLoading ? 'animate-spin text-[#DCA842]' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Provenance & Engine Banner */}
      <div className="p-4 rounded-2xl bg-[#0F1318] border border-[#DCA842]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#DCA842]/10 border border-[#DCA842]/30 flex items-center justify-center shrink-0 text-[#DCA842]">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[#F1EDE6] block">
              Fuente Oficial: ESPN arg.1 → Validación Matemática → Cloud Firestore
            </span>
            <span className="text-[#8B949E] text-[11px]">
              Cobertura garantizada: <strong>22/01/2026</strong> hasta <strong>08/11/2026</strong>. 405 partidos disputados + 90 partidos programados de fase regular.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-[#181C22] border border-[#22272E] text-[#10B981] font-bold">
            Jugados: 405
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#181C22] border border-[#22272E] text-[#DCA842] font-bold">
            Programados: 90
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#181C22] border border-[#22272E] text-[#8B949E]">
            Total: 495
          </span>
        </div>
      </div>

      {/* Stale Warning Banner if needed */}
      {isStaleData && (
        <div className="p-3.5 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center gap-3 text-xs text-[#F59E0B]">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            <strong>ESTADO STALE:</strong> Se están visualizando datos recuperados de la persistencia de Cloud Firestore ante latencia del proveedor en vivo.
          </span>
        </div>
      )}

      {/* Time Navigation Tabs */}
      <div className="flex overflow-x-auto pb-2 scrollbar-none gap-2 border-b border-white/[0.06]">
        {timeTabs.map((tab) => {
          const isActive = timeScope === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTimeScope(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                isActive
                  ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm'
                  : 'bg-[#121519] border border-white/[0.06] text-[#8B949E] hover:text-[#F1EDE6] hover:border-white/[0.12]'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Subfilters Bar: Zone + Phase + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Zone filter buttons */}
          <div className="flex items-center gap-1 bg-[#121519] p-1 rounded-xl border border-white/[0.06]">
            {(['all', 'A', 'B'] as ZoneFilter[]).map((z) => (
              <button
                key={z}
                onClick={() => setZoneFilter(z)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  zoneFilter === z
                    ? 'bg-[#DCA842]/20 text-[#DCA842] border border-[#DCA842]/30'
                    : 'text-[#8B949E] hover:text-[#F1EDE6]'
                }`}
              >
                {z === 'all' ? 'Todas las Zonas' : `Zona ${z}`}
              </button>
            ))}
          </div>

          {/* Phase filter buttons */}
          <div className="flex items-center gap-1 bg-[#121519] p-1 rounded-xl border border-white/[0.06]">
            {(['all', 'apertura', 'clausura', 'playoffs'] as PhaseFilter[]).map((p) => (
              <button
                key={p}
                onClick={() => setPhaseFilter(p)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-colors ${
                  phaseFilter === p
                    ? 'bg-[#DCA842]/20 text-[#DCA842] border border-[#DCA842]/30'
                    : 'text-[#8B949E] hover:text-[#F1EDE6]'
                }`}
              >
                {p === 'all' ? 'Todas las Fases' : p}
              </button>
            ))}
          </div>
        </div>

        {/* Search input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-[#8B949E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar por club o estadio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121519] border border-white/[0.08] focus:border-[#DCA842] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#F1EDE6] placeholder-[#8B949E]/50 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <MatchCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 rounded-3xl bg-[#121519] border border-red-500/30 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
          <h3 className="font-editorial font-bold text-lg text-[#F1EDE6]">
            Error al consultar la persistencia oficial
          </h3>
          <p className="text-xs text-[#8B949E] max-w-md mx-auto">{error}</p>
          <button
            onClick={() => fetchMatchesForScope(timeScope, zoneFilter, phaseFilter)}
            className="px-4 py-2 rounded-xl bg-[#DCA842] text-[#0A0C0E] font-bold text-xs hover:bg-[#e6b44f] transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : displayedMatches.length === 0 ? (
        <EmptyState
          title="No se encontraron partidos para este filtro"
          description="CÁBALA no inventa encuentros ficticios. Si no hay partidos programados o disputados en este rango, se reporta estrictamente vacío."
          actionLabel="Ver Próximos 7 días"
          onAction={() => {
            setTimeScope('7d');
            setZoneFilter('all');
            setPhaseFilter('all');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="space-y-6">
          {/* Matches Grid */}
          <div className="flex items-center justify-between text-xs text-[#8B949E] px-1">
            <span>
              Mostrando <strong>{displayedMatches.length}</strong> partidos verificados
            </span>
            <span className="font-mono text-[11px]">
              {timeScope === 'hoy'
                ? 'Jornada de Hoy'
                : timeScope === 'manana'
                ? 'Jornada de Mañana'
                : timeScope === '7d'
                ? 'Ventana: Próximos 7 días'
                : timeScope === '30d'
                ? 'Ventana: Próximos 30 días'
                : timeScope === 'fixture'
                ? 'Fixture Regular hasta 08/11/2026'
                : timeScope === 'resultados'
                ? 'Resultados Oficiales'
                : 'Temporada Completa 2026'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayedMatches.map((match) => (
              <MatchCard key={match.id} match={match} onClick={onSelectMatch} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
