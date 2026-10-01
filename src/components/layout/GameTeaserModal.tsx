import React, { useState } from 'react';
import { X, Trophy, Swords, Zap, CheckCircle2, AlertCircle, Shield, Lock, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';

interface GameTeaserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TriviaQuestion {
  id: number;
  question: string;
  options: { id: number; text: string; isCorrect?: boolean }[];
  triviaContext: string;
  points: number;
}

const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: 1,
    question: '¿Quién es el máximo goleador histórico de la Primera División del fútbol argentino?',
    options: [
      { id: 0, text: 'Ángel Labruna' },
      { id: 1, text: 'Arsenio Erico', isCorrect: true },
      { id: 2, text: 'José Sanfilippo' },
      { id: 3, text: 'Martín Palermo' },
    ],
    triviaContext: 'Arsenio Erico ostenta el récord histórico con 295 goles oficiales en Primera División (Independiente y Huracán), superando por 2 tantos a Ángel Labruna (293) y José Sanfilippo (227).',
    points: 25,
  },
  {
    id: 2,
    question: '¿Qué club fue el primer campeón oficial de la era profesional en 1931?',
    options: [
      { id: 0, text: 'River Plate' },
      { id: 1, text: 'Racing Club' },
      { id: 2, text: 'San Lorenzo' },
      { id: 3, text: 'Boca Juniors', isCorrect: true },
    ],
    triviaContext: 'Boca Juniors se consagró en el torneo inaugural del profesionalismo organizado por la Liga Argentina de Football en 1931, sumando 50 puntos a lo largo de las 34 fechas.',
    points: 25,
  },
  {
    id: 3,
    question: '¿Qué club argentino fue el primero en consagrarse campeón de la Copa Libertadores de América en 1964?',
    options: [
      { id: 0, text: 'Racing Club' },
      { id: 1, text: 'Independiente', isCorrect: true },
      { id: 2, text: 'Boca Juniors' },
      { id: 3, text: 'Estudiantes de La Plata' },
    ],
    triviaContext: 'Independiente se consagró campeón invicto de la Copa Libertadores en 1964 frente a Nacional de Montevideo, convirtiéndose en el primer club argentino en conquistar América.',
    points: 25,
  },
];

export const GameTeaserModal: React.FC<GameTeaserModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'1v1' | 'ranking' | 'divisiones' | 'temporada'>('1v1');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const currentQ = TRIVIA_QUESTIONS[currentQuestionIdx];
  const selectedAnswer = selectedAnswers[currentQuestionIdx] ?? null;
  const isSubmitted = Boolean(submittedQuestions[currentQuestionIdx]);

  const handleSelect = (idx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIdx]: idx }));
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setSubmittedQuestions((prev) => ({ ...prev, [currentQuestionIdx]: true }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < TRIVIA_QUESTIONS.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmittedQuestions({});
    setCurrentQuestionIdx(0);
    setIsFinished(false);
  };

  // Calcular puntaje acumulado
  const correctCount = TRIVIA_QUESTIONS.reduce((acc, q, qIdx) => {
    const picked = selectedAnswers[qIdx];
    const correctOpt = q.options.find((o) => o.isCorrect);
    return picked !== undefined && correctOpt && picked === correctOpt.id ? acc + 1 : acc;
  }, 0);

  const totalEloEarned = correctCount * 25;

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
              <div className="space-y-2">
                <p className="text-xs text-[#8B949E] leading-relaxed">
                  Desafiá en duelos de 3 preguntas sobre historia, títulos y mística del fútbol argentino. Las respuestas no contienen pistas ni números que delaten la solución: solo conocimiento genuino.
                </p>
                <div className="flex items-center gap-2 text-[11px] text-[#DCA842] bg-[#DCA842]/10 border border-[#DCA842]/20 px-3 py-1.5 rounded-lg">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#DCA842]" />
                  <span>Duelo de 3 preguntas directas · Próximamente: preguntas de aproximación</span>
                </div>
              </div>

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

              {/* Interactive 3-Question 1v1 Duel Demo */}
              {isFinished ? (
                <div className="p-5 sm:p-6 rounded-2xl bg-[#0A0C0E] border border-[#DCA842]/40 space-y-4 animate-fadeIn text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#DCA842]/15 border border-[#DCA842]/30 flex items-center justify-center mx-auto text-[#DCA842]">
                    <Trophy className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#DCA842]">
                      Duelo 1v1 Completado
                    </span>
                    <h4 className="font-editorial font-black text-xl text-[#F1EDE6]">
                      {correctCount === 3
                        ? '¡Rendimiento Perfecto!'
                        : correctCount >= 2
                        ? '¡Gran Desempeño!'
                        : 'Duelo Finalizado'}
                    </h4>
                    <p className="text-xs text-[#8B949E]">
                      Acertaste {correctCount} de {TRIVIA_QUESTIONS.length} preguntas reglamentarias e históricas.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-[#121519] border border-white/[0.08]">
                      <span className="text-[10px] uppercase font-bold text-[#8B949E] block">Aciertos</span>
                      <span className="font-num text-xl font-black text-[#10B981]">
                        {correctCount} / {TRIVIA_QUESTIONS.length}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#121519] border border-white/[0.08]">
                      <span className="text-[10px] uppercase font-bold text-[#8B949E] block">Rating ELO</span>
                      <span className="font-num text-xl font-black text-[#DCA842]">
                        +{totalEloEarned} ELO
                      </span>
                    </div>
                  </div>

                  {/* Review breakdown */}
                  <div className="text-left space-y-2 pt-2 border-t border-white/[0.08]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B949E] block">
                      Resumen de Respuestas:
                    </span>
                    {TRIVIA_QUESTIONS.map((q, idx) => {
                      const userPick = selectedAnswers[idx];
                      const correctOpt = q.options.find((o) => o.isCorrect);
                      const isCorrect = userPick !== undefined && correctOpt && userPick === correctOpt.id;

                      return (
                        <div
                          key={q.id}
                          className="p-2.5 rounded-xl bg-[#121519] border border-white/[0.06] flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            {isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-[#E63946] shrink-0" />
                            )}
                            <span className="text-[#F1EDE6] truncate font-medium">
                              #{idx + 1}: {q.question}
                            </span>
                          </div>
                          <span className={`font-semibold shrink-0 text-[11px] ${isCorrect ? 'text-[#10B981]' : 'text-[#E63946]'}`}>
                            {correctOpt?.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleReset}
                      className="w-full py-2.5 rounded-xl bg-[#DCA842] hover:bg-[#c99532] text-[#0A0C0E] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Jugar otro duelo</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#0A0C0E] border border-white/[0.08] space-y-4">
                  {/* Progress Header */}
                  <div className="flex items-center justify-between text-xs pb-1 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#DCA842]">
                        Pregunta {currentQuestionIdx + 1} de {TRIVIA_QUESTIONS.length}
                      </span>
                      <div className="flex items-center gap-1.5 ml-1">
                        {TRIVIA_QUESTIONS.map((_, i) => {
                          const answered = Boolean(submittedQuestions[i]);
                          const isCur = i === currentQuestionIdx;
                          return (
                            <span
                              key={i}
                              className={`w-2 h-2 rounded-full transition-all ${
                                isCur
                                  ? 'bg-[#DCA842] ring-2 ring-[#DCA842]/30'
                                  : answered
                                  ? 'bg-[#10B981]'
                                  : 'bg-white/20'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                    <span className="font-num font-bold text-[#8B949E]">
                      +{currentQ.points} ELO en juego
                    </span>
                  </div>

                  {/* Question Title */}
                  <h4 className="text-sm font-editorial font-bold text-[#F1EDE6] leading-snug">
                    {currentQ.question}
                  </h4>

                  {/* Options without spoilers/clues */}
                  <div className="space-y-2">
                    {currentQ.options.map((opt) => {
                      const isChosen = selectedAnswer === opt.id;
                      let btnStyle = 'bg-[#181C22] text-[#F1EDE6] border-white/[0.08] hover:border-[#DCA842]/40';

                      if (isSubmitted) {
                        if (opt.isCorrect) {
                          btnStyle = 'bg-[#10B981]/20 text-[#10B981] border-[#10B981] font-semibold';
                        } else if (isChosen && !opt.isCorrect) {
                          btnStyle = 'bg-[#E63946]/20 text-[#E63946] border-[#E63946]';
                        }
                      } else if (isChosen) {
                        btnStyle = 'bg-[#181C22] text-[#DCA842] border-[#DCA842] font-semibold';
                      }

                      const letter = ['A', 'B', 'C', 'D'][opt.id] || '';

                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelect(opt.id)}
                          className={`w-full p-2.5 sm:p-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between group ${btnStyle}`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-[#8B949E] group-hover:text-[#F1EDE6] shrink-0 font-num">
                              {letter}
                            </span>
                            <span className="font-medium text-[#F1EDE6]">{opt.text}</span>
                          </div>
                          {isSubmitted && opt.isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                          )}
                          {isSubmitted && isChosen && !opt.isCorrect && (
                            <AlertCircle className="w-4 h-4 text-[#E63946] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Confirmation and Feedback */}
                  {isSubmitted ? (
                    <div className="pt-2 space-y-3 animate-fadeIn">
                      <p className="text-xs text-[#8B949E] bg-[#121519] p-3 rounded-xl border border-white/[0.06] leading-relaxed">
                        {currentQ.triviaContext}
                      </p>

                      <div className="flex items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2">
                          {selectedAnswer !== null && currentQ.options[selectedAnswer]?.isCorrect ? (
                            <span className="text-xs font-bold text-[#10B981]">
                              ¡Respuesta correcta! (+{currentQ.points} ELO)
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-[#E63946]">
                              Respuesta incorrecta
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {currentQuestionIdx > 0 && (
                            <button
                              onClick={handlePrev}
                              className="px-3 py-1.5 rounded-lg bg-[#181C22] hover:bg-[#22272E] text-xs font-semibold text-[#8B949E] transition-colors border border-white/[0.08]"
                            >
                              Anterior
                            </button>
                          )}
                          <button
                            onClick={handleNext}
                            className="px-4 py-1.5 rounded-lg bg-[#DCA842] hover:bg-[#c99532] text-[#0A0C0E] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <span>
                              {currentQuestionIdx < TRIVIA_QUESTIONS.length - 1
                                ? 'Siguiente'
                                : 'Ver resultado'}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 pt-1">
                      {currentQuestionIdx > 0 && (
                        <button
                          onClick={handlePrev}
                          className="px-3 py-2.5 rounded-xl bg-[#181C22] hover:bg-[#22272E] text-xs font-semibold text-[#8B949E] transition-colors border border-white/[0.08]"
                        >
                          Anterior
                        </button>
                      )}
                      <button
                        onClick={handleSubmit}
                        disabled={selectedAnswer === null}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                          selectedAnswer !== null
                            ? 'bg-[#DCA842] text-[#0A0C0E] hover:bg-[#c99532]'
                            : 'bg-[#181C22] text-[#8B949E]/50 cursor-not-allowed border border-white/[0.04]'
                        }`}
                      >
                        Confirmar respuesta
                      </button>
                    </div>
                  )}
                </div>
              )}
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
