import React, { useState } from 'react';
import { aiRouter } from '../../services/ai/aiRouter';
import { AIResponse } from '../../services/ai/aiProvider';
import { Sparkles, Send, Bot, ShieldCheck, ChevronRight, CornerDownLeft } from 'lucide-react';

interface PreguntaleACabalaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClub?: (clubId: string) => void;
}

export const PreguntaleACabalaModal: React.FC<PreguntaleACabalaModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<
    { sender: 'user' | 'cabala'; text: string; model?: string; tools?: string[] }[]
  >([
    {
      sender: 'cabala',
      text: '¡Hola! Soy el asistente oficial de CÁBALA. Respondó sobre el reglamento AFA 2026, posiciones reales, criterios de desempate, clasificación a copas y fixtures. Toda mi información proviene de fuentes oficiales y del reglamento vigente.',
      model: 'NVIDIA-Nemotron-3.5-Lightning-30B',
    },
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const quickQuestions = [
    '¿Quién clasifica actualmente a Libertadores?',
    '¿Cómo funciona el desempate en las zonas?',
    '¿Qué pasa si el mismo club gana Apertura y Clausura?',
    '¿Quién está puntero en la tabla?',
    '¿Cómo funciona la Recopa de Campeones?',
  ];

  const handleSend = async (qToSend?: string) => {
    const text = qToSend || question;
    if (!text.trim() || loading) return;

    const userMsg = text.trim();
    setHistory((prev) => [...prev, { sender: 'user', text: userMsg }]);
    if (!qToSend) setQuestion('');
    setLoading(true);

    try {
      const response: AIResponse = await aiRouter.askCabala(userMsg);
      setHistory((prev) => [
        ...prev,
        {
          sender: 'cabala',
          text: response.content,
          model: response.modelUsed,
          tools: response.toolsInvoked,
        },
      ]);
    } catch (err: any) {
      setHistory((prev) => [
        ...prev,
        {
          sender: 'cabala',
          text: 'No se pudo consultar el motor de datos oficiales en este momento. Por favor intentá nuevamente.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121519] border border-[#22272E] rounded-3xl max-w-2xl w-full h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-scaleUp">
        {/* Header */}
        <div className="p-5 border-b border-[#22272E] flex items-center justify-between bg-[#15191F]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#DCA842]/15 border border-[#DCA842]/30 flex items-center justify-center text-[#DCA842]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-editorial font-bold text-lg text-[#F1EDE6] flex items-center gap-2">
                Preguntale a CÁBALA
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#DCA842]/15 text-[#DCA842] border border-[#DCA842]/30">
                  Reglamento & Datos
                </span>
              </h3>
              <p className="text-[11px] text-[#8B949E]">
                Fundamentado en datos deportivos de ESPN y Reglamento AFA / Liga Profesional 2026.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#181C22] text-[#8B949E] hover:text-[#F1EDE6] flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {history.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#DCA842] text-[#0A0C0E] font-medium rounded-tr-xs'
                    : 'bg-[#181C22] text-[#F1EDE6] border border-[#22272E] rounded-tl-xs whitespace-pre-wrap'
                }`}
              >
                {msg.text}
              </div>

              {msg.sender === 'cabala' && msg.model && (
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#8B949E]">
                  <ShieldCheck className="w-3 h-3 text-[#30A46C]" />
                  <span>Modelo: {msg.model}</span>
                  {msg.tools && msg.tools.length > 0 && (
                    <span>· Tool: {msg.tools.join(', ')}</span>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#8B949E] p-3 rounded-2xl bg-[#181C22] w-fit border border-[#22272E]">
              <Sparkles className="w-4 h-4 text-[#DCA842] animate-spin" />
              <span>Consultando datos deportivos de ESPN y reglamento AFA...</span>
            </div>
          )}
        </div>

        {/* Quick Question Prompts */}
        <div className="p-3 border-t border-[#22272E] bg-[#15191F]/50 flex gap-2 overflow-x-auto scrollbar-none">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="shrink-0 text-[11px] px-3 py-1.5 rounded-full bg-[#181C22] hover:bg-[#1C2128] border border-[#22272E] hover:border-[#DCA842]/40 text-[#8B949E] hover:text-[#F1EDE6] transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#22272E] bg-[#15191F] flex items-center gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Hacé una consulta sobre el torneo, copas, clubes o reglamento..."
            className="flex-1 bg-[#181C22] border border-[#22272E] focus:border-[#DCA842] rounded-xl px-4 py-3 text-xs text-[#F1EDE6] placeholder-[#8B949E] outline-hidden transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!question.trim() || loading}
            className="px-4 py-3 rounded-xl bg-[#DCA842] hover:bg-[#c99532] disabled:opacity-40 text-[#0A0C0E] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Preguntar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
