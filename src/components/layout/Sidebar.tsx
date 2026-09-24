import React from 'react';
import { UserProfile } from '../../types/football';
import { TeamBadge } from '../common/TeamBadge';
import { Home, Trophy, Users, Shield, Zap, Flame, Crown, MessageSquare } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user: UserProfile;
  onOpenProfile: () => void;
  onOpenGame: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenProfile,
  onOpenGame,
}) => {
  return (
    <aside className="hidden lg:flex flex-col justify-between w-64 shrink-0 h-screen sticky top-0 bg-[#0A0C0E] border-r border-[#22272E] p-5">
      <div className="space-y-6">
        {/* Brand */}
        <div className="px-2 pt-2">
          <button
            onClick={() => onNavigate('inicio')}
            className="text-left group focus:outline-hidden"
          >
            <div className="flex items-baseline gap-1.5">
              <span className="font-editorial font-black text-2xl tracking-tighter text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors block">
                CÁBALA
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#DCA842] inline-block mb-1" />
            </div>
            <span className="text-[10px] text-[#8B949E] font-medium tracking-widest uppercase block -mt-0.5">
              Fútbol argentino
            </span>
          </button>
        </div>

        {/* Section 1: Main Platform Navigation */}
        <div className="space-y-1">
          <button
            onClick={() => onNavigate('inicio')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              currentView === 'inicio'
                ? 'bg-[#181C22] text-[#DCA842] border border-[#22272E] font-bold'
                : 'text-[#8B949E] hover:text-[#F1EDE6] hover:bg-[#121519]'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Inicio</span>
          </button>

          <button
            onClick={() => onNavigate('partidos')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              currentView === 'partidos'
                ? 'bg-[#181C22] text-[#DCA842] border border-[#22272E] font-bold'
                : 'text-[#8B949E] hover:text-[#F1EDE6] hover:bg-[#121519]'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Partidos</span>
          </button>

          <button
            onClick={() => onNavigate('tablas')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              currentView === 'tablas'
                ? 'bg-[#181C22] text-[#DCA842] border border-[#22272E] font-bold'
                : 'text-[#8B949E] hover:text-[#F1EDE6] hover:bg-[#121519]'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Tablas</span>
          </button>

          <button
            onClick={() => onNavigate('clubes')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              currentView === 'clubes'
                ? 'bg-[#181C22] text-[#DCA842] border border-[#22272E] font-bold'
                : 'text-[#8B949E] hover:text-[#F1EDE6] hover:bg-[#121519]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Clubes</span>
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-[#22272E] pt-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8B949E] px-3 block mb-2">
            Competitivo
          </span>

          <div className="space-y-1">
            <button
              onClick={onOpenGame}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-[#0A0C0E] bg-[#DCA842] hover:bg-[#c99532] transition-colors group shadow-sm shadow-[#DCA842]/10"
            >
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 fill-[#0A0C0E]" />
                <span>Jugar</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-black/15">
                Fase 2
              </span>
            </button>

            <button
              disabled
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#8B949E]/60 cursor-not-allowed opacity-60"
            >
              <div className="flex items-center gap-3">
                <Crown className="w-4 h-4" />
                <span>Ranking</span>
              </div>
              <span className="text-[9px] uppercase tracking-wider text-[#8B949E]">
                Próx.
              </span>
            </button>

            <button
              disabled
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#8B949E]/60 cursor-not-allowed opacity-60"
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-4 h-4" />
                <span>Temporada</span>
              </div>
              <span className="text-[9px] uppercase tracking-wider text-[#8B949E]">
                Próx.
              </span>
            </button>
          </div>
        </div>

        {/* Section 3: Community */}
        <div className="border-t border-[#22272E] pt-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8B949E] px-3 block mb-2">
            Ecosistema
          </span>

          <button
            disabled
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#8B949E]/60 cursor-not-allowed opacity-60"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4" />
              <span>Comunidad</span>
            </div>
            <span className="text-[9px] uppercase tracking-wider text-[#8B949E]">
              Próx.
            </span>
          </button>
        </div>
      </div>

      {/* User Identity at the bottom of sidebar ("Tu Cábala") */}
      <div className="pt-4 border-t border-[#22272E]">
        <button
          onClick={onOpenProfile}
          className="w-full p-3 rounded-2xl bg-[#121519] hover:bg-[#181C22] border border-[#22272E] hover:border-[#DCA842]/40 flex items-center justify-between transition-colors text-left group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <TeamBadge teamId={user.favoriteClubId} size="sm" />
            <div className="min-w-0">
              <span className="font-editorial font-bold text-sm text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors block truncate">
                {user.username}
              </span>
              <span className="text-[11px] text-[#8B949E] block">
                {user.rankTitle} · <span className="font-num font-bold">{user.elo}</span>
              </span>
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
};
