import React, { useState } from 'react';
import { Match } from '../types/football';
import { MatchCard } from '../components/matches/MatchCard';
import { TabNav } from '../components/common/TabNav';
import { EmptyState } from '../components/common/EmptyState';
import { Calendar, RefreshCw } from 'lucide-react';

interface MatchesPageProps {
  matches: Match[];
  onSelectMatch: (matchId: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

type FilterType = 'all' | 'live' | 'scheduled' | 'finished';

export const MatchesPage: React.FC<MatchesPageProps> = ({
  matches,
  onSelectMatch,
  onRefresh,
  isLoading = false,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const liveMatches = matches.filter((m) => m.status === 'live');
  const scheduledMatches = matches.filter((m) => m.status === 'scheduled');
  const finishedMatches = matches.filter((m) => m.status === 'finished');

  const activeRoundName = matches[0]?.round || 'Fecha Oficial AFA';

  const filterTabs = [
    { id: 'all' as const, label: 'Todos', count: matches.length },
    { id: 'live' as const, label: 'En Vivo', count: liveMatches.length },
    { id: 'scheduled' as const, label: 'Próximos', count: scheduledMatches.length },
    { id: 'finished' as const, label: 'Finalizados', count: finishedMatches.length },
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#DCA842] block mb-1">
            Programación y Resultados · 2026
          </span>
          <h1 className="font-editorial font-black text-3xl sm:text-5xl text-[#F1EDE6] tracking-tight">
            PARTIDOS
          </h1>
          <p className="text-xs text-[#8B949E] mt-1 font-medium">
            Marcadores en directo, cronograma y fichas técnicas de Primera División.
          </p>
        </div>

        {/* Dynamic Round & Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F1EDE6] bg-[#121519] px-3.5 py-1.5 rounded-xl border border-white/[0.08]">
            <Calendar className="w-3.5 h-3.5 text-[#DCA842]" />
            <span>{activeRoundName}</span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Actualizar partidos"
              className="p-2 rounded-xl bg-[#121519] border border-white/[0.08] hover:border-[#DCA842] text-[#8B949E] hover:text-[#DCA842] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#DCA842]' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto pb-1 scrollbar-none">
        <TabNav
          tabs={filterTabs}
          activeTab={activeFilter}
          onChange={(f) => setActiveFilter(f)}
          size="sm"
        />
      </div>

      {/* ───────────────────────────────────────────────────────────
          1. EN VIVO AHORA (Destacado)
         ─────────────────────────────────────────────────────────── */}
      {(activeFilter === 'all' || activeFilter === 'live') && liveMatches.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/[0.08]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#10B981]">
              En Juego Ahora ({liveMatches.length})
            </h2>
          </div>

          <div className="space-y-3">
            {liveMatches.map((m) => (
              <MatchCard key={m.id} match={m} onClick={onSelectMatch} featured />
            ))}
          </div>
        </section>
      )}

      {/* ───────────────────────────────────────────────────────────
          2. PRÓXIMOS PARTIDOS
         ─────────────────────────────────────────────────────────── */}
      {(activeFilter === 'all' || activeFilter === 'scheduled') && scheduledMatches.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F1EDE6]">
              Próximos Partidos ({scheduledMatches.length})
            </h2>
            <span className="text-[11px] text-[#8B949E]">Horario oficial de Argentina</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scheduledMatches.map((match) => (
              <MatchCard key={match.id} match={match} onClick={onSelectMatch} />
            ))}
          </div>
        </section>
      )}

      {/* ───────────────────────────────────────────────────────────
          3. RESULTADOS / FINALIZADOS
         ─────────────────────────────────────────────────────────── */}
      {(activeFilter === 'all' || activeFilter === 'finished') && finishedMatches.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B949E]">
              Resultados de la Fecha ({finishedMatches.length})
            </h2>
            <span className="text-[11px] text-[#8B949E]">Marcadores finales</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {finishedMatches.map((match) => (
              <MatchCard key={match.id} match={match} onClick={onSelectMatch} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {matches.length === 0 && (
        <EmptyState
          title="No hay partidos programados"
          description="Los partidos se sincronizan directamente con el feed deportivo oficial de la competencia."
          actionLabel="Actualizar"
          onAction={onRefresh}
        />
      )}
    </div>
  );
};
