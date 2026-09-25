import React from 'react';
import { UserProfile } from '../../types/football';
import { TeamBadge } from '../common/TeamBadge';
import { Zap, Bot } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user: UserProfile;
  onOpenProfile: () => void;
  onOpenGame: () => void;
  onOpenAiChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenProfile,
  onOpenGame,
  onOpenAiChat,
}) => {
  const navLinks = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'partidos', label: 'Partidos' },
    { id: 'tablas', label: 'Tablas' },
    { id: 'clubes', label: 'Clubes' },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0A0C0E]/95 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('inicio')}
            className="group text-left focus:outline-hidden"
          >
            <div className="flex items-baseline gap-1.5">
              <span className="font-editorial font-black text-2xl tracking-tight text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors">
                CÁBALA
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#DCA842] inline-block mb-1" />
            </div>
            <span className="hidden sm:block text-[9px] uppercase tracking-[0.25em] text-[#8B949E] font-medium -mt-1">
              Fútbol Argentino
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
          {navLinks.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`transition-colors whitespace-nowrap py-1 relative text-xs tracking-wide ${
                  isActive
                    ? 'text-[#F1EDE6] font-bold after:absolute after:bottom-[-8px] after:left-0 after:right-0 after:h-[2px] after:bg-[#DCA842]'
                    : 'text-[#8B949E] hover:text-[#F1EDE6]'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <div className="h-4 w-[1px] bg-white/[0.08] mx-1" />

          <button
            onClick={onOpenGame}
            className="flex items-center gap-1.5 text-xs font-bold text-[#0A0C0E] bg-[#DCA842] hover:bg-[#c99532] transition-colors px-3 py-1.5 rounded-lg shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 fill-[#0A0C0E]" />
            <span>Jugar</span>
          </button>

          <button
            onClick={onOpenAiChat}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#8B949E] hover:text-[#DCA842] transition-colors px-2.5 py-1.5"
          >
            <Bot className="w-3.5 h-3.5 text-[#DCA842]" />
            <span>Consultar IA</span>
          </button>
        </nav>

        {/* Zone 3: User Profile Access */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl bg-[#121519] hover:bg-[#181C22] border border-white/[0.08] hover:border-[#DCA842]/40 transition-all group min-h-[40px]"
            title="Ver Tu Cábala"
          >
            <TeamBadge teamId={user.favoriteClubId} size="xs" />
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors block leading-tight">
                {user.username}
              </span>
              <span className="text-[10px] text-[#8B949E] block">
                {user.elo} ELO
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
