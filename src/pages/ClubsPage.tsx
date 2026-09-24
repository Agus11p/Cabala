import React from 'react';
import { Team } from '../types/football';
import { ClubList } from '../components/clubs/ClubList';

interface ClubsPageProps {
  teams: Team[];
  onSelectClub: (clubId: string) => void;
}

export const ClubsPage: React.FC<ClubsPageProps> = ({ teams, onSelectClub }) => {
  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#22272E] pb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#DCA842] block mb-1">
            Instituciones de Primera División
          </span>
          <h1 className="font-editorial font-black text-3xl md:text-5xl text-[#F1EDE6] tracking-tight">
            CLUBES
          </h1>
          <p className="text-xs text-[#8B949E] mt-1 font-medium">
            Historia, identidades, estadísticas y palmarés del fútbol argentino.
          </p>
        </div>

        <div className="text-xs text-[#8B949E] font-num text-left sm:text-right">
          {teams.length} instituciones afiliadas a AFA
        </div>
      </div>

      {/* Directory Component */}
      <ClubList teams={teams} onSelectClub={onSelectClub} />
    </div>
  );
};
