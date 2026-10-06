import React, { useState } from 'react';
import { UserProfile, Team } from '../../types/football';
import { TeamBadge } from '../common/TeamBadge';
import { GlobalSearch } from '../common/GlobalSearch';
import { Zap, Search, X, Menu, Home, Flame, Trophy, Shield, Award, Sparkles, User } from 'lucide-react';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'partidos', label: 'Partidos', icon: Flame },
    { id: 'tablas', label: 'Tablas', icon: Trophy },
    { id: 'copas_nacionales', label: 'Copas Nacionales', icon: Award },
    { id: 'clubes', label: 'Clubes', icon: Shield },
    { id: 'vision', label: 'Visión', icon: Sparkles },
  ];

  const handleSelectClubFromSearch = (clubId: string) => {
    if (onSelectClub) {
      onSelectClub(clubId);
    }
    setIsMobileSearchOpen(false);
  };

  const handleMobileNav = (viewId: string) => {
    onNavigate(viewId);
    setIsMobileMenuOpen(false);
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

          {/* Mobile Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Abrir menú de navegación"
            className="xl:hidden p-2 rounded-xl text-[#8B949E] hover:text-[#DCA842] bg-[#121519] border border-white/[0.08]"
          >
            <Menu className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenGame}
            className="hidden md:flex items-center gap-1.5 text-xs font-bold text-[#0A0C0E] bg-[#DCA842] hover:bg-[#c99532] transition-colors px-3 py-1.5 rounded-lg shadow-sm"
            title="Modo Competitivo (Próximamente)"
          >
            <Zap className="w-3.5 h-3.5 fill-[#0A0C0E]" />
            <span>Jugar</span>
            <span className="text-[9px] uppercase font-black px-1.5 py-0.2 rounded bg-black/20 text-[#0A0C0E]">
              Pronto
            </span>
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

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#0A0C0E]/95 backdrop-blur-md p-5 flex flex-col justify-between animate-fadeIn xl:hidden">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2">
                <span className="font-editorial font-black text-xl text-[#F1EDE6]">
                  CÁBALA
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#DCA842]" />
                <span className="text-[10px] uppercase tracking-wider text-[#8B949E] font-bold">
                  Menú Principal
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-[#121519] border border-white/[0.08] text-[#8B949E] hover:text-[#F1EDE6]"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation links in drawer */}
            <div className="space-y-2">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNav(item.id)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left font-bold text-sm transition-all ${
                      isActive
                        ? 'bg-[#DCA842] text-[#0A0C0E] shadow-md shadow-[#DCA842]/20 font-black'
                        : 'bg-[#121519] text-[#F1EDE6] border border-white/[0.06] hover:border-[#DCA842]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.id === 'copas_nacionales' && (
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                        Copa Arg
                      </span>
                    )}
                    {item.id === 'vision' && (
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-[#DCA842]/20 text-[#DCA842]">
                        Nuevo
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Jugar Action */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenGame();
                }}
                className="w-full p-3.5 rounded-2xl bg-[#DCA842] text-[#0A0C0E] font-black text-sm uppercase tracking-wider flex items-center justify-between px-5 shadow-lg shadow-[#DCA842]/25"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 fill-[#0A0C0E]" />
                  <span>Jugar Trivia 1 vs 1</span>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-black/25 text-[#0A0C0E]">
                  Próximamente
                </span>
              </button>
            </div>
          </div>

          {/* User profile footer in drawer */}
          <div className="p-4 rounded-2xl bg-[#121519] border border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TeamBadge teamId={user.favoriteClubId} size="sm" />
              <div>
                <span className="text-xs font-bold text-[#F1EDE6] block">
                  {user.username}
                </span>
                <span className="text-[10px] text-[#DCA842] font-semibold block">
                  {user.elo} ELO · {user.rankTitle}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenProfile();
              }}
              className="text-xs font-bold text-[#8B949E] hover:text-[#DCA842] underline"
            >
              Ver perfil
            </button>
          </div>
        </div>
      )}

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
