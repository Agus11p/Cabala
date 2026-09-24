import React, { useState } from 'react';
import { X, Trophy, Swords, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

interface GameTeaserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameTeaserModal: React.FC<GameTeaserModalProps> = ({ isOpen, onClose }) => {
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
    triviaTriviaContext: 'Arsenio Erico brilló en Independiente durante las décadas de 1930 y 1940, consagrándose como el artillero más letal de la historia de los torneos argentinos.',
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
      <div className="relative w-full max-w-lg bg-[#121519] border border-[#22272E] rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-[#22272E] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#DCA842]/15 text-[#DCA842] border border-[#DCA842]/30">
                Fase 2 · En Preparación
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <p className="text-xs text-[#8B949E] leading-relaxed">
            La próxima etapa de Cábala integrará el ecosistema competitivo del fútbol argentino: trivia de conocimiento puro, partidas online 1v1 en tiempo real, sistema de ELO y ascensos entre divisiones.
          </p>

          {/* Pillars */}
          <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
            <div className="p-3.5 rounded-2xl bg-[#181C22] border border-[#22272E]">
              <Trophy className="w-4 h-4 text-[#DCA842] mx-auto mb-1.5" />
              <span className="font-bold text-[#F1EDE6] block text-xs">Trivia Pura</span>
              <span className="text-[10px] text-[#8B949E] mt-0.5 block">Historia y mística</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#181C22] border border-[#22272E]">
              <Swords className="w-4 h-4 text-[#DCA842] mx-auto mb-1.5" />
              <span className="font-bold text-[#F1EDE6] block text-xs">Duelos 1v1</span>
              <span className="text-[10px] text-[#8B949E] mt-0.5 block">10s por jugada</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#181C22] border border-[#22272E]">
              <Zap className="w-4 h-4 text-[#DCA842] mx-auto mb-1.5" />
              <span className="font-bold text-[#F1EDE6] block text-xs">Ranking ELO</span>
              <span className="text-[10px] text-[#8B949E] mt-0.5 block">Ascensos de liga</span>
            </div>
          </div>

          {/* Live Interactive Sample Question */}
          <div className="p-5 rounded-2xl bg-[#0A0C0E] border border-[#22272E] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#DCA842]">
                Demo de Pregunta
              </span>
              <span className="text-[11px] font-num font-bold text-[#8B949E]">
                +25 ELO en disputa
              </span>
            </div>

            <h4 className="text-sm font-editorial font-bold text-[#F1EDE6] leading-snug">
              {sampleQuestion.question}
            </h4>

            <div className="space-y-2">
              {sampleQuestion.options.map((opt) => {
                const isChosen = selectedAnswer === opt.id;
                let btnStyle = 'bg-[#181C22] text-[#F1EDE6] border-[#22272E] hover:border-[#DCA842]/40';

                if (submitted) {
                  if (opt.isCorrect) {
                    btnStyle = 'bg-[#30A46C]/20 text-[#30A46C] border-[#30A46C] font-semibold';
                  } else if (isChosen && !opt.isCorrect) {
                    btnStyle = 'bg-[#E5484D]/20 text-[#E5484D] border-[#E5484D]';
                  }
                } else if (isChosen) {
                  btnStyle = 'bg-[#181C22] text-[#DCA842] border-[#DCA842] font-semibold';
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    className={`w-full p-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt.text}</span>
                    {submitted && opt.isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-[#30A46C] shrink-0" />
                    )}
                    {submitted && isChosen && !opt.isCorrect && (
                      <AlertCircle className="w-4 h-4 text-[#E5484D] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {submitted ? (
              <div className="pt-2 space-y-3 animate-fadeIn">
                <p className="text-xs text-[#8B949E] bg-[#121519] p-3 rounded-xl border border-[#22272E]">
                  {sampleQuestion.triviaTriviaContext}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${selectedAnswer === 1 ? 'text-[#30A46C]' : 'text-[#E5484D]'}`}>
                    {selectedAnswer === 1 ? '¡Correcto! +25 ELO sumados al perfil' : 'Respuesta incorrecta'}
                  </span>
                  <button
                    onClick={handleReset}
                    className="text-xs text-[#8B949E] hover:text-[#F1EDE6] underline"
                  >
                    Reiniciar demo
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
                    : 'bg-[#181C22] text-[#8B949E]/50 cursor-not-allowed border border-[#22272E]'
                }`}
              >
                Confirmar Respuesta
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0A0C0E] border-t border-[#22272E] flex items-center justify-between text-xs text-[#8B949E]">
          <span>Desarrollo en curso según hoja de ruta</span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-[#F1EDE6] hover:text-[#DCA842] transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
