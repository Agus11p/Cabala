import React from 'react';
import { Home, Flame, Trophy, User, Zap } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenGame: () => void;
  onOpenProfile: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  onOpenGame,
  onOpenProfile,
}) => {
  return (
    <nav
      aria-label="Navegación inferior móvil"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0C0E]/95 backdrop-blur-md border-t border-white/[0.08] px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 flex items-center justify-around shadow-2xl"
    >
      {/* 1. Inicio */}
      <button
        onClick={() => onNavigate('inicio')}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
          currentView === 'inicio' ? 'text-[#DCA842]' : 'text-[#8B949E] hover:text-[#F1EDE6]'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-semibold tracking-tight mt-1">Inicio</span>
      </button>

      {/* 2. Partidos */}
      <button
        onClick={() => onNavigate('partidos')}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
          currentView === 'partidos' ? 'text-[#DCA842]' : 'text-[#8B949E] hover:text-[#F1EDE6]'
        }`}
      >
        <Flame className="w-5 h-5" />
        <span className="text-[10px] font-semibold tracking-tight mt-1">Partidos</span>
      </button>

      {/* 3. JUGAR (Central Action) */}
      <button
        onClick={onOpenGame}
        aria-label="Jugar trivia y duelos (Próximamente)"
        className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-transform active:scale-95 group -mt-2"
      >
        <div className="w-10 h-10 rounded-2xl bg-[#DCA842] text-[#0A0C0E] flex items-center justify-center shadow-lg shadow-[#DCA842]/25 group-hover:bg-[#c99532] transition-colors relative">
          <Zap className="w-5 h-5 fill-[#0A0C0E]" />
          <span className="absolute -top-1.5 -right-2 text-[7px] font-black uppercase tracking-tight px-1 py-0.2 rounded-full bg-black text-[#DCA842] border border-[#DCA842]/50 shadow-xs">
            Pronto
          </span>
        </div>
        <span className="text-[10px] font-bold tracking-tight mt-0.5 text-[#DCA842]">Jugar</span>
      </button>

      {/* 4. Tablas */}
      <button
        onClick={() => onNavigate('tablas')}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
          currentView === 'tablas' ? 'text-[#DCA842]' : 'text-[#8B949E] hover:text-[#F1EDE6]'
        }`}
      >
        <Trophy className="w-5 h-5" />
        <span className="text-[10px] font-semibold tracking-tight mt-1">Tablas</span>
      </button>

      {/* 5. Perfil (Tu Cábala) */}
      <button
        onClick={onOpenProfile}
        className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] text-[#8B949E] hover:text-[#DCA842] transition-colors"
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-semibold tracking-tight mt-1">Perfil</span>
      </button>
    </nav>
  );
};
