import React, { useState } from 'react';
import { Team } from '../../types/football';
import { TeamBadge } from '../common/TeamBadge';
import { Search, MapPin } from 'lucide-react';

interface ClubListProps {
  teams: Team[];
  onSelectClub: (clubId: string) => void;
}

type ZoneFilter = 'all' | 'A' | 'B';

export const ClubList: React.FC<ClubListProps> = ({ teams, onSelectClub }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeZone, setActiveZone] = useState<ZoneFilter>('all');

  const filteredTeams = teams.filter((t) => {
    // Zone filter
    if (activeZone !== 'all' && t.zone !== activeZone) {
      return false;
    }

    // Search query
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.shortName.toLowerCase().includes(q) ||
      t.city.toLowerCase().includes(q) ||
      (t.stadium && t.stadium.toLowerCase().includes(q))
    );
  });

  const zoneACount = teams.filter((t) => t.zone === 'A').length;
  const zoneBCount = teams.filter((t) => t.zone === 'B').length;

  return (
    <div className="space-y-6">
      {/* Controls: Search and Zone Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar club por nombre, ciudad o estadio..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#121519] border border-white/[0.08] focus:border-[#DCA842] rounded-xl text-xs sm:text-sm text-[#F1EDE6] placeholder-[#8B949E] focus:outline-hidden transition-colors"
          />
        </div>

        {/* Zone Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-[#121519] border border-white/[0.08] rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveZone('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeZone === 'all'
                ? 'bg-[#181C22] text-[#DCA842] font-bold shadow-xs'
                : 'text-[#8B949E] hover:text-[#F1EDE6]'
            }`}
          >
            Todos ({teams.length})
          </button>
          <button
            onClick={() => setActiveZone('A')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeZone === 'A'
                ? 'bg-[#181C22] text-[#DCA842] font-bold shadow-xs'
                : 'text-[#8B949E] hover:text-[#F1EDE6]'
            }`}
          >
            Zona A ({zoneACount})
          </button>
          <button
            onClick={() => setActiveZone('B')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeZone === 'B'
                ? 'bg-[#181C22] text-[#DCA842] font-bold shadow-xs'
                : 'text-[#8B949E] hover:text-[#F1EDE6]'
            }`}
          >
            Zona B ({zoneBCount})
          </button>
        </div>
      </div>

      {/* Grid of 30 Argentine Clubs */}
      {filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredTeams.map((team) => {
            const hasStats = Boolean(team.seasonStats && team.seasonStats.played > 0);
            const stats = team.seasonStats;

            return (
              <div
                key={team.id}
                onClick={() => onSelectClub(team.id)}
                className="p-4 sm:p-5 rounded-2xl bg-[#121519] border border-white/[0.08] hover:border-[#DCA842]/40 hover:bg-[#15191F] transition-all cursor-pointer group flex flex-col justify-between"
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <TeamBadge
                        teamId={team.id}
                        team={team}
                        logoUrl={team.logo}
                        size="md"
                        className="shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {team.zone && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-white/[0.05] text-[#DCA842] border border-white/[0.08]">
                              Zona {team.zone}
                            </span>
                          )}
                          {hasStats && stats && stats.position > 0 && (
                            <span className="text-[10px] font-num text-[#8B949E]">
                              #{stats.position}
                            </span>
                          )}
                        </div>
                        <h3 className="font-editorial font-bold text-base text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors leading-snug truncate">
                          {team.shortName || team.name}
                        </h3>
                        <span className="text-[11px] text-[#8B949E] flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-[#DCA842] shrink-0" />
                          <span>{team.city || 'Argentina'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Points highlight if available */}
                    {hasStats && stats && (
                      <div className="text-right shrink-0">
                        <span className="font-num font-black text-xl text-[#F1EDE6] group-hover:text-[#DCA842] tabular-nums block">
                          {stats.points}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-[#8B949E] block -mt-1">
                          pts
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#8B949E]">
                  {hasStats && stats ? (
                    <div className="flex items-center gap-3 font-num">
                      <span><strong className="text-[#F1EDE6]">{stats.played}</strong> PJ</span>
                      <span><strong className="text-[#10B981]">{stats.won}</strong> PG</span>
                      <span><strong className="text-[#F1EDE6]">{stats.drawn}</strong> PE</span>
                      <span><strong className="text-[#E63946]">{stats.lost}</strong> PP</span>
                    </div>
                  ) : (
                    <span className="truncate max-w-[180px]">{team.stadium || 'Estadio Oficial'}</span>
                  )}

                  <span className="text-[#8B949E] group-hover:text-[#DCA842] transition-colors font-semibold text-[11px]">
                    Ficha →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-10 rounded-2xl bg-[#121519] border border-white/[0.08] text-center space-y-2">
          <p className="text-sm font-semibold text-[#F1EDE6]">No se encontraron clubes para "{searchQuery}"</p>
          <p className="text-xs text-[#8B949E]">Verificá la ortografía o cambiá el filtro de zona.</p>
        </div>
      )}
    </div>
  );
};
