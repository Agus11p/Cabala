import React, { useState } from 'react';
import { UserProfile, Team } from '../../types/football';
import { TeamBadge } from '../common/TeamBadge';
import { GlobalSearch } from '../common/GlobalSearch';
import { Zap, Search, X } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user: UserProfile;
  teams?: Team[];
  onSelectClub?: (clubId: string) => void;
  onOpenProfile: () => void;
  onOpenGame: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  teams = [],
  onSelectClub,
  onOpenProfile,
  onOpenGame,
}) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const navLinks = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'partidos', label: 'Partidos' },
    { id: 'tablas', label: 'Tablas' },
    { id: 'copas_nacionales', label: 'Copas Nacionales' },
    { id: 'clubes', label: 'Clubes' },
  ];

  const handleSelectClubFromSearch = (clubId: string) => {
    if (onSelectClub) {
      onSelectClub(clubId);
    }
    setIsMobileSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0A0C0E]/95 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-6 shrink-0">
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
        <nav className="hidden xl:flex items-center gap-5 text-xs font-semibold shrink-0">
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
        </nav>

        {/* Zone 2.5: Global Search (Desktop & Tablet) */}
        <div className="hidden sm:block flex-1 max-w-xs md:max-w-sm">
          {onSelectClub && (
            <GlobalSearch
              teams={teams}
              onSelectClub={handleSelectClubFromSearch}
            />
          )}
        </div>

        {/* Zone 3: Actions & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Search Button */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(true)}
            aria-label="Abrir buscador de clubes"
            className="sm:hidden p-2 rounded-xl text-[#8B949E] hover:text-[#F1EDE6] bg-[#121519] border border-white/[0.08]"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenGame}
            className="hidden md:flex items-center gap-1.5 text-xs font-bold text-[#0A0C0E] bg-[#DCA842] hover:bg-[#c99532] transition-colors px-3 py-1.5 rounded-lg shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 fill-[#0A0C0E]" />
            <span>Jugar</span>
          </button>

          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl bg-[#121519] hover:bg-[#181C22] border border-white/[0.08] hover:border-[#DCA842]/40 transition-all group min-h-[40px]"
            title="Ver Tu Cábala"
          >
            <TeamBadge teamId={user.favoriteClubId} size="xs" />
            <div className="text-left hidden lg:block">
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

      {/* Mobile Search Overlay Modal */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-[#0A0C0E]/95 backdrop-blur-md p-4 sm:hidden flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#DCA842]">
              Buscar Club (30 Clubes)
            </span>
            <button
              onClick={() => setIsMobileSearchOpen(false)}
              className="p-1.5 text-[#8B949E] hover:text-[#F1EDE6]"
              aria-label="Cerrar búsqueda"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1">
            {onSelectClub && (
              <GlobalSearch
                teams={teams}
                onSelectClub={handleSelectClubFromSearch}
                isMobileModal={true}
                onCloseMobileModal={() => setIsMobileSearchOpen(false)}
              />
            )}
          </div>
        </div>
      )}
    </header>
  );
};
