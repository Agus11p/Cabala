import React, { useState } from 'react';
import { Team } from '../../types/football';
import { TeamBadge } from '../common/TeamBadge';
import { Search } from 'lucide-react';

interface ClubListProps {
  teams: Team[];
  onSelectClub: (clubId: string) => void;
}

export const ClubList: React.FC<ClubListProps> = ({ teams, onSelectClub }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.neighborhood && t.neighborhood.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (t.stadium && t.stadium.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderFormBadge = (formChar: 'W' | 'D' | 'L', idx: number) => {
    let letter = 'V';
    let style = 'bg-[#30A46C]/15 text-[#30A46C] border-[#30A46C]/30';

    if (formChar === 'D') {
      letter = 'E';
      style = 'bg-[#8B949E]/15 text-[#8B949E] border-[#8B949E]/30';
    } else if (formChar === 'L') {
      letter = 'D';
      style = 'bg-[#E5484D]/15 text-[#E5484D] border-[#E5484D]/30';
    }

    return (
      <span
        key={idx}
        className={`w-4 h-4 rounded-xs border flex items-center justify-center text-[10px] font-bold font-num ${style}`}
      >
        {letter}
      </span>
    );
  };

  const isBrowsingAll = searchQuery.trim() === '';
  const spotlightTeams = isBrowsingAll ? teams.slice(0, 2) : [];
  const regularTeams = isBrowsingAll ? teams.slice(2) : filteredTeams;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar institución por nombre, ciudad o estadio..."
          className="w-full pl-11 pr-4 py-3 bg-[#121519] border border-[#22272E] focus:border-[#DCA842] rounded-2xl text-sm text-[#F1EDE6] placeholder-[#8B949E] focus:outline-hidden transition-colors"
        />
      </div>

      {/* SPOTLIGHT TEAMS */}
      {isBrowsingAll && spotlightTeams.length > 0 && (
        <div className="space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#8B949E]">
            Instituciones de Primera División
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spotlightTeams.map((team) => (
              <div
                key={team.id}
                onClick={() => onSelectClub(team.id)}
                className="p-6 rounded-3xl bg-[#121519] border border-[#22272E] hover:border-[#DCA842]/50 hover:bg-[#15191F] transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <TeamBadge
                        teamId={team.id}
                        team={team}
                        logoUrl={team.logo}
                        size="lg"
                        className="group-hover:scale-105 transition-transform shrink-0"
                      />
                      <div>
                        {team.seasonStats && team.seasonStats.position > 0 ? (
                          <span className="font-num text-xs font-bold text-[#DCA842] px-2 py-0.5 rounded bg-[#181C22] border border-[#22272E] inline-block mb-1">
                            #{team.seasonStats.position} TORNEO
                          </span>
                        ) : (
                          <span className="font-num text-xs font-bold text-[#8B949E] px-2 py-0.5 rounded bg-[#181C22] border border-[#22272E] inline-block mb-1">
                            LPF AFA
                          </span>
                        )}
                        <h3 className="font-editorial font-black text-xl text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors leading-tight">
                          {team.name}
                        </h3>
                        <span className="text-xs text-[#8B949E]">
                          {team.city || 'Argentina'}
                        </span>
                      </div>
                    </div>

                    {team.seasonStats && team.seasonStats.points > 0 && (
                      <div className="text-right shrink-0">
                        <span className="text-[10px] uppercase font-bold text-[#8B949E] block">Puntos</span>
                        <span className="font-num font-black text-3xl text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors">
                          {team.seasonStats.points}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-[#8B949E] flex items-center justify-between mb-4 border-t border-[#22272E] pt-3">
                    <span className="truncate">{team.stadium || 'Estadio Oficial'}</span>
                    <span className="text-[11px] font-num text-[#8B949E]">{team.code}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#22272E] text-xs">
                  {team.seasonStats && team.seasonStats.played > 0 ? (
                    <div className="flex items-center gap-4 text-xs font-num">
                      <span className="text-[#8B949E]"><strong className="text-[#F1EDE6]">{team.seasonStats.played}</strong> PJ</span>
                      <span className="text-[#8B949E]"><strong className="text-[#30A46C]">{team.seasonStats.won}</strong> PG</span>
                      <span className="text-[#8B949E]"><strong className="text-[#F1EDE6]">{team.seasonStats.drawn}</strong> PE</span>
                    </div>
                  ) : (
                    <span className="text-xs text-[#8B949E]">Club Oficial Primera División</span>
                  )}
                  {team.recentForm && team.recentForm.length > 0 && (
                    <div className="flex items-center gap-1">
                      {team.recentForm.map((f, i) => renderFormBadge(f, i))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REGULAR DIRECTORY */}
      <div className="space-y-3">
        {isBrowsingAll && (
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#8B949E] pt-2">
            Nómina Oficial de Clubes ({filteredTeams.length} Clubes)
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {regularTeams.map((team) => (
            <div
              key={team.id}
              onClick={() => onSelectClub(team.id)}
              className="p-5 rounded-2xl bg-[#121519] border border-[#22272E] hover:border-[#DCA842]/40 hover:bg-[#15191F] transition-all duration-150 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <TeamBadge
                      teamId={team.id}
                      team={team}
                      logoUrl={team.logo}
                      size="md"
                      className="group-hover:scale-105 transition-transform shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-editorial font-bold text-base text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors leading-tight truncate">
                        {team.name}
                      </h3>
                      <span className="text-xs text-[#8B949E] block truncate">
                        {team.city}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-[#8B949E] block font-num">{team.code}</span>
                    {team.seasonStats && team.seasonStats.position > 0 && (
                      <span className="font-num font-bold text-base text-[#F1EDE6]">#{team.seasonStats.position}</span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-[#8B949E] truncate mb-3">
                  {team.stadium || 'Estadio Oficial'}
                </div>
              </div>

              {/* Bottom Row */}
              <div className="pt-3 border-t border-[#22272E] flex items-center justify-between">
                {team.seasonStats && team.seasonStats.played > 0 ? (
                  <div className="flex items-center gap-3 text-xs">
                    <div>
                      <span className="text-[#8B949E] block text-[10px] uppercase">PTS</span>
                      <span className="font-num font-bold text-base text-[#F1EDE6]">{team.seasonStats.points}</span>
                    </div>
                    <div>
                      <span className="text-[#8B949E] block text-[10px] uppercase">PJ</span>
                      <span className="font-num font-medium text-xs text-[#8B949E]">{team.seasonStats.played}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#8B949E]">Primera División AFA</span>
                )}

                {team.recentForm && team.recentForm.length > 0 && (
                  <div className="flex items-center gap-1">
                    {team.recentForm.map((f, i) => renderFormBadge(f, i))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
