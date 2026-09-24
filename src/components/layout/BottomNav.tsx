import React from 'react';
import { Home, Flame, Trophy, Shield, Zap } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenGame: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  onOpenGame,
}) => {
  return (
    <nav
      aria-label="Navegación inferior móvil"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0C0E]/95 backdrop-blur-lg border-t border-[#22272E] h-16 px-2 flex items-center justify-around"
    >
      {/* Inicio */}
      <button
        onClick={() => onNavigate('inicio')}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
          currentView === 'inicio' ? 'text-[#DCA842]' : 'text-[#8B949E] hover:text-[#F1EDE6]'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-semibold tracking-tight mt-1">Inicio</span>
      </button>

      {/* Partidos */}
      <button
        onClick={() => onNavigate('partidos')}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
          currentView === 'partidos' ? 'text-[#DCA842]' : 'text-[#8B949E] hover:text-[#F1EDE6]'
        }`}
      >
        <Flame className="w-5 h-5" />
        <span className="text-[10px] font-semibold tracking-tight mt-1">Partidos</span>
      </button>

      {/* JUGAR (Central Action) */}
      <button
        onClick={onOpenGame}
        className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] text-[#DCA842] hover:scale-105 transition-transform"
      >
        <div className="w-9 h-9 rounded-xl bg-[#DCA842] text-[#0A0C0E] flex items-center justify-center shadow-lg shadow-[#DCA842]/20">
          <Zap className="w-5 h-5 fill-[#0A0C0E]" />
        </div>
        <span className="text-[10px] font-bold tracking-tight mt-0.5 text-[#DCA842]">Jugar</span>
      </button>

      {/* Tablas */}
      <button
        onClick={() => onNavigate('tablas')}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
          currentView === 'tablas' ? 'text-[#DCA842]' : 'text-[#8B949E] hover:text-[#F1EDE6]'
        }`}
      >
        <Trophy className="w-5 h-5" />
        <span className="text-[10px] font-semibold tracking-tight mt-1">Tablas</span>
      </button>

      {/* Clubes */}
      <button
        onClick={() => onNavigate('clubes')}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
          currentView === 'clubes' ? 'text-[#DCA842]' : 'text-[#8B949E] hover:text-[#F1EDE6]'
        }`}
      >
        <Shield className="w-5 h-5" />
        <span className="text-[10px] font-semibold tracking-tight mt-1">Clubes</span>
      </button>
    </nav>
  );
};
