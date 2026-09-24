import React from 'react';
import { UserProfile } from '../../types/football';
import { TeamBadge } from '../common/TeamBadge';
import { Zap } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user: UserProfile;
  onOpenProfile: () => void;
  onOpenGame: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenProfile,
  onOpenGame,
}) => {
  const navLinks = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'partidos', label: 'Partidos' },
    { id: 'tablas', label: 'Tablas' },
    { id: 'clubes', label: 'Clubes' },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0A0C0E]/95 backdrop-blur-md border-b border-[#22272E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Distinctive text element wordmark */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('inicio')}
            className="group text-left focus:outline-hidden"
          >
            <div className="flex items-baseline gap-1.5">
              <span className="font-editorial font-black text-2xl tracking-tighter text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors">
                CÁBALA
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#DCA842] inline-block mb-1" />
            </div>
            <span className="hidden sm:block text-[9px] uppercase tracking-[0.25em] text-[#8B949E] font-medium -mt-1">
              Fútbol Argentino
            </span>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold">
          {navLinks.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`transition-colors whitespace-nowrap py-2 relative text-sm ${
                  isActive
                    ? 'text-[#F1EDE6] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#DCA842]'
                    : 'text-[#8B949E] hover:text-[#F1EDE6]'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <button
            onClick={onOpenGame}
            className="flex items-center gap-1.5 text-xs font-bold text-[#DCA842] hover:text-amber-300 transition-colors px-3 py-1.5 rounded-full bg-[#DCA842]/10 border border-[#DCA842]/20"
          >
            <Zap className="w-3.5 h-3.5 fill-[#DCA842]" />
            <span>Jugar</span>
          </button>
        </nav>

        {/* Zone 3: User profile pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 py-1.5 px-3.5 rounded-full bg-[#121519] hover:bg-[#181C22] border border-[#22272E] hover:border-[#DCA842]/40 transition-all group min-h-[40px]"
            title="Ver Tu Cábala"
          >
            <TeamBadge teamId={user.favoriteClubId} size="xs" />
            <span className="text-xs font-bold text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors">
              {user.username}
            </span>
            <span className="text-[11px] font-num text-[#8B949E] border-l border-[#22272E] pl-2 hidden sm:inline">
              {user.elo} ELO
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
