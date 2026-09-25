import React, { useState } from 'react';
import { X, Trophy, Swords, Zap, CheckCircle2, AlertCircle, Shield, Lock } from 'lucide-react';

interface GameTeaserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameTeaserModal: React.FC<GameTeaserModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'1v1' | 'ranking' | 'divisiones' | 'temporada'>('1v1');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const sampleQuestion = {
    question: '¿Quién es el máximo goleador histórico en la historia del fútbol profesional de Primera División de AFA?',
    options: [
      { id: 0, text: 'Ángel Labruna (293 goles)' },
      { id: 1, text: 'Arsenio Erico (295 goles)', isCorrect: true },
      { id: 2, text: 'Martín Palermo (227 goles)' },
      { id: 3, text: 'José Sanfilippo (226 goles)' },
    ],
    triviaContext: 'Arsenio Erico brilló en Independiente durante las décadas de 1930 y 1940, consagrándose como el artillero más letal de la historia de los torneos argentinos.',
  };

  const handleSelect = (idx: number) => {
    if (submitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setSelectedAnswer(null);
    setSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#121519] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#DCA842]/15 text-[#DCA842] border border-[#DCA842]/30">
                Ecosistema Competitivo
              </span>
            </div>
            <h2 className="font-editorial font-black text-2xl text-[#F1EDE6]">
              CÁBALA JUGAR
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#181C22] text-[#8B949E] hover:text-[#F1EDE6] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Competitive Mode Tabs */}
        <div className="px-6 pt-4 pb-2 border-b border-white/[0.06] flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('1v1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === '1v1'
                ? 'bg-[#DCA842] text-[#0A0C0E] font-bold'
                : 'text-[#8B949E] hover:text-[#F1EDE6] bg-[#181C22]'
            }`}
          >
            Duelo 1v1
          </button>

          <button
            onClick={() => setActiveTab('ranking')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'ranking'
                ? 'bg-[#DCA842] text-[#0A0C0E] font-bold'
                : 'text-[#8B949E] hover:text-[#F1EDE6] bg-[#181C22]'
            }`}
          >
            Ranking de Hinchas
          </button>

          <button
            onClick={() => setActiveTab('divisiones')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'divisiones'
                ? 'bg-[#DCA842] text-[#0A0C0E] font-bold'
                : 'text-[#8B949E] hover:text-[#F1EDE6] bg-[#181C22]'
            }`}
          >
            Divisiones
          </button>

          <button
            onClick={() => setActiveTab('temporada')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'temporada'
                ? 'bg-[#DCA842] text-[#0A0C0E] font-bold'
                : 'text-[#8B949E] hover:text-[#F1EDE6] bg-[#181C22]'
            }`}
          >
            Temporada 2026
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {activeTab === '1v1' && (
            <>
              <p className="text-xs text-[#8B949E] leading-relaxed">
                Desafiá en duelos de 5 preguntas sobre historia, clásicos y mística del fútbol argentino. Las partidas oficiales ponen en juego puntos ELO para el ranking general.
              </p>

              {/* Pillars */}
              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="p-3 rounded-xl bg-[#181C22] border border-white/[0.06]">
                  <Trophy className="w-4 h-4 text-[#DCA842] mx-auto mb-1" />
                  <span className="font-bold text-[#F1EDE6] block text-xs">Mística</span>
                  <span className="text-[10px] text-[#8B949E] block">Historia pura</span>
                </div>
                <div className="p-3 rounded-xl bg-[#181C22] border border-white/[0.06]">
                  <Swords className="w-4 h-4 text-[#DCA842] mx-auto mb-1" />
                  <span className="font-bold text-[#F1EDE6] block text-xs">Duelo 1v1</span>
                  <span className="text-[10px] text-[#8B949E] block">10s por turno</span>
                </div>
                <div className="p-3 rounded-xl bg-[#181C22] border border-white/[0.06]">
                  <Zap className="w-4 h-4 text-[#DCA842] mx-auto mb-1" />
                  <span className="font-bold text-[#F1EDE6] block text-xs">Rating ELO</span>
                  <span className="text-[10px] text-[#8B949E] block">Ascensos</span>
                </div>
              </div>

              {/* Interactive Demo Question */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0A0C0E] border border-white/[0.08] space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#DCA842]">
                    Pregunta de Demostración
                  </span>
                  <span className="font-num font-bold text-[#8B949E]">
                    +25 ELO en juego
                  </span>
                </div>

                <h4 className="text-sm font-editorial font-bold text-[#F1EDE6] leading-snug">
                  {sampleQuestion.question}
                </h4>

                <div className="space-y-2">
                  {sampleQuestion.options.map((opt) => {
                    const isChosen = selectedAnswer === opt.id;
                    let btnStyle = 'bg-[#181C22] text-[#F1EDE6] border-white/[0.08] hover:border-[#DCA842]/40';

                    if (submitted) {
                      if (opt.isCorrect) {
                        btnStyle = 'bg-[#10B981]/20 text-[#10B981] border-[#10B981] font-semibold';
                      } else if (isChosen && !opt.isCorrect) {
                        btnStyle = 'bg-[#E63946]/20 text-[#E63946] border-[#E63946]';
                      }
                    } else if (isChosen) {
                      btnStyle = 'bg-[#181C22] text-[#DCA842] border-[#DCA842] font-semibold';
                    }

                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelect(opt.id)}
                        className={`w-full p-2.5 sm:p-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt.text}</span>
                        {submitted && opt.isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                        )}
                        {submitted && isChosen && !opt.isCorrect && (
                          <AlertCircle className="w-4 h-4 text-[#E63946] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {submitted ? (
                  <div className="pt-2 space-y-3 animate-fadeIn">
                    <p className="text-xs text-[#8B949E] bg-[#121519] p-3 rounded-xl border border-white/[0.06] leading-relaxed">
                      {sampleQuestion.triviaContext}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${selectedAnswer === 1 ? 'text-[#10B981]' : 'text-[#E63946]'}`}>
                        {selectedAnswer === 1 ? '¡Respuesta correcta! +25 ELO' : 'Respuesta incorrecta'}
                      </span>
                      <button
                        onClick={handleReset}
                        className="text-xs text-[#8B949E] hover:text-[#F1EDE6] underline"
                      >
                        Reintentar demo
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      selectedAnswer !== null
                        ? 'bg-[#DCA842] text-[#0A0C0E] hover:bg-[#c99532]'
                        : 'bg-[#181C22] text-[#8B949E]/50 cursor-not-allowed border border-white/[0.04]'
                    }`}
                  >
                    Confirmar respuesta
                  </button>
                )}
              </div>
            </>
          )}

          {activeTab === 'ranking' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#181C22] border border-white/[0.08] text-center space-y-2">
                <Lock className="w-6 h-6 text-[#DCA842] mx-auto opacity-70" />
                <h4 className="font-editorial font-bold text-base text-[#F1EDE6]">
                  Tabla General de Hinchas
                </h4>
                <p className="text-xs text-[#8B949E] max-w-sm mx-auto">
                  El ranking oficial de la comunidad computará los puntos ELO obtenidos en duelos directos y clasificará a los hinchas por club y división.
                </p>
                <div className="pt-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded bg-[#DCA842]/10 text-[#DCA842] border border-[#DCA842]/30">
                    Estado: Próximamente
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'divisiones' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#181C22] border border-white/[0.08] text-center space-y-2">
                <Shield className="w-6 h-6 text-[#DCA842] mx-auto opacity-70" />
                <h4 className="font-editorial font-bold text-base text-[#F1EDE6]">
                  Sistema de Divisiones y Ascensos
                </h4>
                <p className="text-xs text-[#8B949E] max-w-sm mx-auto">
                  De Iniciado a Leyenda: 5 categorías jerárquicas con corte semanal de ascensos y descensos según el rendimiento en duelos 1v1.
                </p>
                <div className="pt-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded bg-[#DCA842]/10 text-[#DCA842] border border-[#DCA842]/30">
                    Estado: Próximamente
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'temporada' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#181C22] border border-white/[0.08] text-center space-y-2">
                <Trophy className="w-6 h-6 text-[#DCA842] mx-auto opacity-70" />
                <h4 className="font-editorial font-bold text-base text-[#F1EDE6]">
                  Temporada Competitiva 2026
                </h4>
                <p className="text-xs text-[#8B949E] max-w-sm mx-auto">
                  Cada torneo se sincronizará con el calendario del fútbol argentino. Las hinchadas competirán por coronar al club más sabio de Primera División.
                </p>
                <div className="pt-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded bg-[#DCA842]/10 text-[#DCA842] border border-[#DCA842]/30">
                    Estado: Próximamente
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
