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

type FilterType = 'all' | 'live' | 'today' | 'finished' | 'scheduled';

export const MatchesPage: React.FC<MatchesPageProps> = ({
  matches,
  onSelectMatch,
  onRefresh,
  isLoading = false,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  const liveMatches = matches.filter((m) => m.status === 'live');
  const finishedMatches = matches.filter((m) => m.status === 'finished');
  const scheduledMatches = matches.filter((m) => m.status === 'scheduled');
  const todayMatches = matches.filter((m) => m.date === todayStr || m.status === 'live');

  // Detect current tournament/round dynamically
  const activeRoundName = matches[0]?.round || 'Fecha Oficial';

  const filterTabs = [
    { id: 'all' as const, label: 'Todos', count: matches.length },
    { id: 'live' as const, label: 'En Vivo', count: liveMatches.length },
    { id: 'today' as const, label: 'Hoy', count: todayMatches.length },
    { id: 'finished' as const, label: 'Finalizados', count: finishedMatches.length },
    { id: 'scheduled' as const, label: 'Programados', count: scheduledMatches.length },
  ];

  const filteredMatches = matches.filter((m) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'live') return m.status === 'live';
    if (activeFilter === 'today') return m.date === todayStr || m.status === 'live';
    if (activeFilter === 'finished') return m.status === 'finished';
    if (activeFilter === 'scheduled') return m.status === 'scheduled';
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#22272E] pb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#DCA842] block mb-1">
            Liga Profesional de Fútbol AFA
          </span>
          <h1 className="font-editorial font-black text-3xl md:text-5xl text-[#F1EDE6] tracking-tight">
            PARTIDOS
          </h1>
          <p className="text-xs text-[#8B949E] mt-1 font-medium">
            Marcadores en directo, resultados oficiales y programación oficial de AFA.
          </p>
        </div>

        {/* Dynamic Round & Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F1EDE6] bg-[#121519] px-3.5 py-1.5 rounded-xl border border-[#22272E]">
            <Calendar className="w-3.5 h-3.5 text-[#DCA842]" />
            <span>{activeRoundName}</span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Actualizar partidos en tiempo real"
              className="p-2 rounded-xl bg-[#121519] border border-[#22272E] hover:border-[#DCA842] text-[#8B949E] hover:text-[#DCA842] transition-colors"
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

      {/* LIVE SECTION HIGHLIGHT IF ANY */}
      {activeFilter === 'all' && liveMatches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30A46C] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#30A46C]"></span>
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#30A46C]">
              En Juego Ahora · Cobertura en Vivo
            </h2>
          </div>

          <div className="space-y-4">
            {liveMatches.map((m) => (
              <MatchCard key={m.id} match={m} onClick={onSelectMatch} featured />
            ))}
          </div>
        </section>
      )}

      {/* MATCHES LIST */}
      <section className="space-y-4">
        {filteredMatches.length > 0 ? (
          <div className="space-y-3">
            {filteredMatches
              .filter((m) => activeFilter !== 'all' || m.status !== 'live')
              .map((match) => (
                <MatchCard key={match.id} match={match} onClick={onSelectMatch} />
              ))}
          </div>
        ) : (
          <EmptyState
            title="No hay partidos para el criterio seleccionado"
            description="La programación oficial del fútbol argentino se actualiza según el calendario oficial de AFA."
            actionLabel="Ver todos los partidos oficiales"
            onAction={() => setActiveFilter('all')}
          />
        )}
      </section>
    </div>
  );
};
