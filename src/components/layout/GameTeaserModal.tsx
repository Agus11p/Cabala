import React, { useState } from 'react';
import { X, Trophy, Swords, Zap, CheckCircle2, Shield, Lock, Bell, Sparkles, ArrowRight, Check } from 'lucide-react';
import { googleToolsService } from '../../services/googleToolsService';

interface GameTeaserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameTeaserModal: React.FC<GameTeaserModalProps> = ({ isOpen, onClose }) => {
  const [emailOrNick, setEmailOrNick] = useState('');
  const [isJoinedWaitlist, setIsJoinedWaitlist] = useState(() => {
    return localStorage.getItem('cabala_game_waitlist') === 'true';
  });
  const [showDemo, setShowDemo] = useState(false);
  const [selectedDemoAnswer, setSelectedDemoAnswer] = useState<number | null>(null);
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleJoinWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrNick.trim()) return;
    localStorage.setItem('cabala_game_waitlist', 'true');
    localStorage.setItem('cabala_waitlist_user', emailOrNick.trim());
    setIsJoinedWaitlist(true);
    googleToolsService.trackWaitlistSignup(emailOrNick.trim(), 'general');
  };

  const demoQuestion = {
    question: '¿Qué club fue el primer campeón oficial del profesionalismo argentino en 1931?',
    options: [
      { id: 0, text: 'River Plate' },
      { id: 1, text: 'Racing Club' },
      { id: 2, text: 'Boca Juniors', isCorrect: true },
      { id: 3, text: 'Independiente' },
    ],
    context: 'Boca Juniors ganó el campeonato oficial inaugural de la Liga Argentina de Football en 1931 sumando 50 puntos.',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#121519] border border-white/[0.12] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-gradient-to-r from-[#181C22] to-[#121519]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#DCA842] text-[#0A0C0E] flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3 h-3 fill-[#0A0C0E]" />
                PRÓXIMAMENTE
              </span>
              <span className="text-[10px] text-[#8B949E] uppercase tracking-wider font-semibold">
                Lanzamiento 2026
              </span>
            </div>
            <h2 className="font-editorial font-black text-xl sm:text-2xl text-[#F1EDE6] tracking-tight">
              MODO COMPETITIVO & TRIVIA
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="w-8 h-8 rounded-full bg-[#181C22] text-[#8B949E] hover:text-[#F1EDE6] hover:bg-[#22272E] flex items-center justify-center transition-colors shrink-0 border border-white/[0.06]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto overscroll-contain flex-1">
          {/* Hero Banner: En Desarrollo para la versión completa */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#182338] via-[#121824] to-[#0A0C0E] border border-blue-500/30 space-y-2 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-[#DCA842]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 text-[#DCA842]">
              <Lock className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Funcionalidad en Desarrollo
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#F1EDE6] leading-relaxed font-medium">
              El modo <strong>Jugar</strong> se lanzará con la migración a la versión completa del sitio. Vas a poder desafiar a otros hinchas en duelos 1v1 en tiempo real, participar en el Prode de la fecha y sumar ELO oficial para tu club.
            </p>
          </div>

          {/* Feature Grid: Lo que se viene */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B949E] block">
              Sistemas que formarán parte de CÁBALA:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Feature 1 */}
              <div className="p-3.5 rounded-xl bg-[#181C22] border border-white/[0.06] space-y-1.5">
                <div className="flex items-center gap-2 text-[#DCA842]">
                  <Swords className="w-4 h-4" />
                  <h4 className="text-xs font-bold text-[#F1EDE6]">Duelos 1v1 en Vivo</h4>
                </div>
                <p className="text-[11px] text-[#8B949E] leading-normal">
                  Preguntas históricas y de actualidad con cronómetro de 60 segundos por ronda.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-3.5 rounded-xl bg-[#181C22] border border-white/[0.06] space-y-1.5">
                <div className="flex items-center gap-2 text-[#10B981]">
                  <Trophy className="w-4 h-4" />
                  <h4 className="text-xs font-bold text-[#F1EDE6]">Prode de la Fecha</h4>
                </div>
                <p className="text-[11px] text-[#8B949E] leading-normal">
                  Pronosticá los 15 partidos de cada fin de semana y competí en la tabla general.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-3.5 rounded-xl bg-[#181C22] border border-white/[0.06] space-y-1.5">
                <div className="flex items-center gap-2 text-blue-400">
                  <Shield className="w-4 h-4" />
                  <h4 className="text-xs font-bold text-[#F1EDE6]">Liga de Hinchadas</h4>
                </div>
                <p className="text-[11px] text-[#8B949E] leading-normal">
                  Cada victoria suma ELO para el club que elegiste en tu perfil de Cábala.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-3.5 rounded-xl bg-[#181C22] border border-white/[0.06] space-y-1.5">
                <div className="flex items-center gap-2 text-[#DCA842]">
                  <Zap className="w-4 h-4" />
                  <h4 className="text-xs font-bold text-[#F1EDE6]">Conexión Google Stats</h4>
                </div>
                <p className="text-[11px] text-[#8B949E] leading-normal">
                  Integración con herramientas Google y analíticas oficiales en tiempo real.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Waitlist Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0A0C0E] border border-white/[0.08] space-y-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#DCA842]" />
              <h4 className="font-bold text-xs sm:text-sm text-[#F1EDE6]">
                Lista de Acceso Anticipado
              </h4>
            </div>

            {isJoinedWaitlist ? (
              <div className="p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center gap-2.5 text-[#10B981] text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>¡Ya estás anotado en la lista de acceso prioritario para el lanzamiento!</span>
              </div>
            ) : (
              <form onSubmit={handleJoinWaitlist} className="space-y-2">
                <p className="text-[11px] text-[#8B949E]">
                  Ingresá tu apodo de hincha o correo para ser de los primeros en probar los duelos:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={emailOrNick}
                    onChange={(e) => setEmailOrNick(e.target.value)}
                    placeholder="Tu apodo o correo..."
                    className="flex-1 bg-[#121519] border border-white/[0.1] focus:border-[#DCA842] text-xs text-[#F1EDE6] px-3.5 py-2.5 rounded-xl placeholder-[#8B949E]/50 focus:outline-hidden transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-[#DCA842] hover:bg-[#c99532] text-[#0A0C0E] font-bold text-xs uppercase tracking-wide transition-colors shrink-0 shadow-sm"
                  >
                    Anotarme
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Demo Teaser Accordion */}
          <div className="border border-white/[0.06] rounded-2xl p-4 bg-[#121519]/50 space-y-3">
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="w-full flex items-center justify-between text-xs font-bold text-[#8B949E] hover:text-[#DCA842] transition-colors"
            >
              <span>{showDemo ? 'Ocultar pregunta de prueba' : 'Probar una pregunta de muestra'}</span>
              <ArrowRight className={`w-3.5 h-3.5 transition-transform ${showDemo ? 'rotate-90 text-[#DCA842]' : ''}`} />
            </button>

            {showDemo && (
              <div className="space-y-3 pt-2 border-t border-white/[0.06]">
                <p className="text-xs font-semibold text-[#F1EDE6]">
                  {demoQuestion.question}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {demoQuestion.options.map((opt) => {
                    const isSelected = selectedDemoAnswer === opt.id;
                    const isCorrect = opt.isCorrect;
                    let btnStyle = 'bg-[#181C22] text-[#F1EDE6] border-white/[0.08] hover:border-[#DCA842]';
                    if (demoSubmitted) {
                      if (isCorrect) {
                        btnStyle = 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/50 font-bold';
                      } else if (isSelected) {
                        btnStyle = 'bg-red-500/20 text-red-400 border-red-500/50';
                      }
                    } else if (isSelected) {
                      btnStyle = 'bg-[#DCA842]/20 text-[#DCA842] border-[#DCA842]';
                    }

                    return (
                      <button
                        key={opt.id}
                        disabled={demoSubmitted}
                        onClick={() => setSelectedDemoAnswer(opt.id)}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${btnStyle}`}
                      >
                        {opt.text}
                      </button>
                    );
                  })}
                </div>

                {!demoSubmitted ? (
                  <button
                    disabled={selectedDemoAnswer === null}
                    onClick={() => setDemoSubmitted(true)}
                    className="w-full py-2 rounded-xl bg-white/[0.08] hover:bg-[#DCA842] hover:text-[#0A0C0E] text-xs font-bold text-[#F1EDE6] disabled:opacity-40 transition-colors"
                  >
                    Confirmar respuesta
                  </button>
                ) : (
                  <p className="text-[11px] text-[#8B949E] bg-[#0A0C0E] p-2.5 rounded-xl border border-white/[0.06]">
                    💡 {demoQuestion.context}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#0A0C0E] flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-[#8B949E] font-medium hidden sm:inline">
            CÁBALA Fútbol Argentino · MVP 2026
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#DCA842] hover:bg-[#c99532] text-[#0A0C0E] font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#DCA842]/20"
          >
            Entendido · Volver al Fixture
          </button>
        </div>
      </div>
    </div>
  );
};
