import React from 'react';
import { UserProfile } from '../../types/football';
import { TeamBadge } from '../common/TeamBadge';
import { Home, Flame, Trophy, Shield, Zap, Crown, Calendar, MessageSquare, Bot } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user: UserProfile;
  onOpenProfile: () => void;
  onOpenGame: () => void;
  onOpenAiChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenProfile,
  onOpenGame,
  onOpenAiChat,
}) => {
  return (
    <aside className="hidden lg:flex flex-col justify-between w-64 shrink-0 h-screen sticky top-0 bg-[#0A0C0E] border-r border-white/[0.08] p-5">
      <div className="space-y-6">
        {/* Brand */}
        <div className="px-2 pt-1">
          <button
            onClick={() => onNavigate('inicio')}
            className="text-left group focus:outline-hidden"
          >
            <div className="flex items-baseline gap-1.5">
              <span className="font-editorial font-black text-2xl tracking-tight text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors">
                CÁBALA
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#DCA842] inline-block mb-1" />
            </div>
            <span className="text-[10px] text-[#8B949E] font-medium tracking-widest uppercase block -mt-0.5">
              Fútbol Argentino · 2026
            </span>
          </button>
        </div>

        {/* Section 1: Plataforma Principal */}
        <div className="space-y-1">
          <button
            onClick={() => onNavigate('inicio')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              currentView === 'inicio'
                ? 'bg-[#181C22] text-[#DCA842] font-bold border border-white/[0.08]'
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
                ? 'bg-[#181C22] text-[#DCA842] font-bold border border-white/[0.08]'
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
                ? 'bg-[#181C22] text-[#DCA842] font-bold border border-white/[0.08]'
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
                ? 'bg-[#181C22] text-[#DCA842] font-bold border border-white/[0.08]'
                : 'text-[#8B949E] hover:text-[#F1EDE6] hover:bg-[#121519]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Clubes</span>
          </button>
        </div>

        {/* Section 2: Experiencia Competitiva */}
        <div className="border-t border-white/[0.08] pt-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8B949E] px-3 block mb-2">
            Competir
          </span>

          <div className="space-y-1">
            <button
              onClick={onOpenGame}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-[#0A0C0E] bg-[#DCA842] hover:bg-[#c99532] transition-colors shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 fill-[#0A0C0E]" />
                <span>Jugar</span>
              </div>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/15">
                1v1
              </span>
            </button>

            <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#8B949E]/60 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <Crown className="w-4 h-4" />
                <span>Ranking</span>
              </div>
              <span className="text-[9px] uppercase tracking-wider text-[#8B949E]/70">
                Próx.
              </span>
            </div>

            <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#8B949E]/60 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" />
                <span>Temporada</span>
              </div>
              <span className="text-[9px] uppercase tracking-wider text-[#8B949E]/70">
                Próx.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Comunidad & Asistente */}
        <div className="border-t border-white/[0.08] pt-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8B949E] px-3 block mb-2">
            Ecosistema
          </span>

          <div className="space-y-1">
            <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#8B949E]/60 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>Comunidad</span>
              </div>
              <span className="text-[9px] uppercase tracking-wider text-[#8B949E]/70">
                Próx.
              </span>
            </div>

            <button
              onClick={onOpenAiChat}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-[#F1EDE6] hover:text-[#DCA842] bg-[#121519] hover:bg-[#181C22] border border-white/[0.08] hover:border-[#DCA842]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bot className="w-4 h-4 text-[#DCA842]" />
                <span>Consultar IA</span>
              </div>
              <span className="text-[9px] uppercase font-bold text-[#DCA842]">
                AFA
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer / User Profile Card */}
      <div className="border-t border-white/[0.08] pt-4">
        <button
          onClick={onOpenProfile}
          className="w-full p-2.5 rounded-2xl bg-[#121519] hover:bg-[#181C22] border border-white/[0.08] hover:border-[#DCA842]/40 flex items-center gap-3 text-left transition-all group"
        >
          <TeamBadge teamId={user.favoriteClubId} size="sm" className="shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors truncate">
                {user.username}
              </span>
              <span className="font-num text-[11px] text-[#DCA842] font-bold">
                {user.elo}
              </span>
            </div>
            <span className="text-[10px] text-[#8B949E] block truncate">
              {user.rankTitle} · Tu Cábala
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
};
