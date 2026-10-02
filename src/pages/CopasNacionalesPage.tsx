import React, { useState, useEffect, useMemo } from 'react';
import { Team, StandingRow, Match, CopaArgentinaSummary, CopaArgentinaBracket } from '../types/football';
import { TeamBadge } from '../components/common/TeamBadge';
import { footballService } from '../services/footballService';
import { formatMatchTime } from '../utils/formatters';
import {
  Trophy,
  Award,
  Calendar,
  MapPin,
  Info,
  Shield,
  Clock,
  ArrowRight,
  Filter,
  Search,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  Flame,
  BarChart2,
  Sparkles,
} from 'lucide-react';

interface CopasNacionalesPageProps {
  topStandings?: StandingRow[];
  teams?: Team[];
  onSelectClub?: (clubId: string) => void;
}

export const CopasNacionalesPage: React.FC<CopasNacionalesPageProps> = ({ onSelectClub }) => {
  const [activeTab, setActiveTab] = useState<'arbol' | 'copa_argentina'>('arbol');
  const [copaSubTab, setCopaSubTab] = useState<'fixture' | 'bracket' | 'results' | 'semis'>('fixture');
  const [copaMatches, setCopaMatches] = useState<Match[]>([]);
  const [copaSummary, setCopaSummary] = useState<CopaArgentinaSummary | null>(null);
  const [copaBracket, setCopaBracket] = useState<CopaArgentinaBracket | null>(null);
  const [loadingCopa, setLoadingCopa] = useState(false);
  const [selectedRound, setSelectedRound] = useState<string>('all');
  const [selectedBracketStage, setSelectedBracketStage] = useState<string>('all');
  const [searchCopa, setSearchCopa] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    setLoadingCopa(true);
    Promise.all([
      footballService.getCopaArgentinaMatches(),
      footballService.getCopaArgentinaSummary(),
      footballService.getCopaArgentinaBracket(),
    ])
      .then(([matches, summary, bracket]) => {
        if (isMounted) {
          setCopaMatches(matches);
          setCopaSummary(summary);
          setCopaBracket(bracket);
          setLoadingCopa(false);
        }
      })
      .catch((err) => {
        console.warn('[CopasNacionalesPage] Error al cargar Copa Argentina:', err);
        if (isMounted) setLoadingCopa(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtro de partidos de Copa Argentina
  const filteredCopaMatches = useMemo(() => {
    return copaMatches.filter((m) => {
      const matchRound = m.round || '';
      const matchesRound =
        selectedRound === 'all'
          ? true
          : selectedRound === 'semifinales'
          ? matchRound.toLowerCase().includes('semi')
          : selectedRound === 'cuartos'
          ? matchRound.toLowerCase().includes('cuartos')
          : selectedRound === 'octavos'
          ? matchRound.toLowerCase().includes('octavos')
          : selectedRound === '16vos'
          ? matchRound.toLowerCase().includes('16vos')
          : selectedRound === '32vos'
          ? matchRound.toLowerCase().includes('32vos')
          : true;

      const q = searchCopa.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (m.homeTeam?.name || '').toLowerCase().includes(q) ||
        (m.awayTeam?.name || '').toLowerCase().includes(q) ||
        (m.stadium || '').toLowerCase().includes(q);

      return matchesRound && matchesSearch;
    });
  }, [copaMatches, selectedRound, searchCopa]);

  const roundCounts = useMemo(() => {
    return {
      all: copaMatches.length,
      semifinales: copaMatches.filter((m) => (m.round || '').toLowerCase().includes('semi')).length,
      cuartos: copaMatches.filter((m) => (m.round || '').toLowerCase().includes('cuartos')).length,
      octavos: copaMatches.filter((m) => (m.round || '').toLowerCase().includes('octavos')).length,
      '16vos': copaMatches.filter((m) => (m.round || '').toLowerCase().includes('16vos')).length,
      '32vos': copaMatches.filter((m) => (m.round || '').toLowerCase().includes('32vos')).length,
    };
  }, [copaMatches]);

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.06] text-[#8B949E] border border-white/[0.1] flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-[#DCA842]" />
              Esquema Oficial AFA / Liga Profesional 2026
            </span>
            <span className="text-[11px] text-[#8B949E]">
              Definición de Títulos y Torneos de Copa
            </span>
          </div>
          <h1 className="font-editorial font-black text-3xl sm:text-5xl text-[#F1EDE6] tracking-tight">
            COPAS NACIONALES
          </h1>
          <p className="text-xs sm:text-sm text-[#8B949E] mt-1 max-w-2xl leading-relaxed">
            Árbol oficial de clasificación a los trofeos de campeones y fixture completo de la Copa Argentina federal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de sub-sección: Árbol de Supercopas vs Copa Argentina */}
          <div className="flex items-center bg-[#121519] p-1 rounded-xl border border-white/[0.08]">
            <button
              onClick={() => setActiveTab('arbol')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'arbol'
                  ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm'
                  : 'text-[#8B949E] hover:text-[#F1EDE6]'
              }`}
            >
              Árbol de Títulos AFA
            </button>
            <button
              onClick={() => setActiveTab('copa_argentina')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'copa_argentina'
                  ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm'
                  : 'text-[#8B949E] hover:text-[#F1EDE6]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Copa Argentina 2026 ({roundCounts.all})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────
          VISTA 1: ÁRBOL JERÁRQUICO DE CLASIFICACIÓN A SUPERCOPAS
         ─────────────────────────────────────────────────────────── */}
      {activeTab === 'arbol' && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0A1120] via-[#090D15] to-[#0A0C0E] border border-blue-500/20 p-6 sm:p-10 shadow-2xl">
          {/* Glow Effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-5xl mx-auto space-y-12">
            {/* NIVEL 3 (CÚSPIDE): RECOPA DE LOS CAMPEONES */}
            <div className="flex flex-col items-center">
              <div className="w-full max-w-md p-5 rounded-3xl bg-gradient-to-b from-[#182338] to-[#101726] border-2 border-[#DCA842] shadow-2xl shadow-[#DCA842]/15 text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCA842]/15 border border-[#DCA842]/30 text-[#DCA842] text-[10px] font-bold uppercase tracking-widest">
                  <Trophy className="w-3.5 h-3.5" />
                  Cúspide Suprema AFA
                </div>

                <div className="space-y-1">
                  <h3 className="font-editorial font-black text-xl sm:text-2xl text-[#F1EDE6] tracking-tight">
                    RECOPA DE LOS CAMPEONES
                  </h3>
                  <p className="text-[11px] text-[#8B949E]">
                    El trofeo supremo que corona al mejor club de toda la temporada oficial argentina
                  </p>
                </div>

                {/* Contenders */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-[#0F1624] border border-white/[0.08] text-center space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-[#8B949E]">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#F1EDE6] block truncate">
                        Por definir
                      </span>
                      <span className="text-[10px] text-[#8B949E] block">
                        Ganador Supercopa Argentina
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#0F1624] border border-white/[0.08] text-center space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-[#8B949E]">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#F1EDE6] block truncate">
                        Por definir
                      </span>
                      <span className="text-[10px] text-[#8B949E] block">
                        Ganador Supercopa Internacional
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#8B949E] pt-1 border-t border-white/[0.06]">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#DCA842]" />
                    Estadio Monumental / Kempes
                  </span>
                  <span className="font-semibold text-[#DCA842]">Definición 2027 · Por definir</span>
                </div>
              </div>

              {/* Connecting Lines down to Level 2 */}
              <div className="w-0.5 h-8 bg-gradient-to-b from-[#DCA842] to-blue-500/40" />
              <div className="w-full max-w-2xl h-0.5 bg-blue-500/30" />
              <div className="w-full max-w-2xl flex justify-between">
                <div className="w-0.5 h-8 bg-blue-500/30" />
                <div className="w-0.5 h-8 bg-blue-500/30" />
              </div>
            </div>

            {/* NIVEL 2: SUPERCOPAS Y COPA ARGENTINA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* 2.1 SUPERCOPA ARGENTINA */}
              <div className="p-5 rounded-3xl bg-[#101726]/90 border border-white/[0.08] hover:border-[#DCA842]/40 transition-all space-y-3 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#DCA842] flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      Copa Nacional
                    </span>
                    <span className="text-[10px] text-[#8B949E]">Principios de 2027</span>
                  </div>

                  <h4 className="font-editorial font-bold text-lg text-[#F1EDE6] mb-1">
                    SUPERCOPA ARGENTINA
                  </h4>
                  <p className="text-[10px] text-[#8B949E] leading-relaxed mb-3">
                    Campeón de Liga vs Campeón Copa Argentina
                  </p>

                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-[#151E2E] border border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                          <Shield className="w-3.5 h-3.5 text-[#8B949E]" />
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold text-[#F1EDE6] block truncate">
                            Por definir
                          </span>
                          <span className="text-[10px] text-[#8B949E] block truncate">
                            Campeón de Liga (1° Tabla General Anual)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#151E2E] border border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                          <Shield className="w-3.5 h-3.5 text-[#8B949E]" />
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold text-[#F1EDE6] block truncate">
                            Por definir
                          </span>
                          <span className="text-[10px] text-[#8B949E] block truncate">
                            Campeón Copa Argentina 2026
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] text-[10px] text-[#8B949E] flex items-center justify-between">
                  <span className="truncate">Estadio Mario Alberto Kempes, Córdoba</span>
                  <span className="text-[#DCA842] font-semibold">Por definir</span>
                </div>
              </div>

              {/* 2.2 COPA ARGENTINA (NEXO DIRECTO AL FIXTURE) */}
              <div className="p-5 rounded-3xl bg-gradient-to-b from-[#141C2E] to-[#0E1524] border-2 border-blue-400/30 hover:border-blue-400/60 transition-all space-y-3 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" />
                      Torneo Federal AFA
                    </span>
                    <span className="text-[10px] text-[#8B949E]">Semifinales en juego</span>
                  </div>

                  <h4 className="font-editorial font-bold text-lg text-[#F1EDE6] mb-1">
                    COPA ARGENTINA 2026
                  </h4>
                  <p className="text-[10px] text-[#8B949E] leading-relaxed mb-3">
                    62 partidos de eliminación directa. Clasifica a Copa Libertadores 2027 (Argentina 3).
                  </p>

                  <div className="p-3.5 rounded-2xl bg-[#0D1422] border border-blue-400/20 space-y-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs font-bold text-[#F1EDE6]">
                        Campeón: Por definir
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8B949E]">
                      Semifinalistas clasificados: Boca Juniors, Banfield, Platense y Atlético Tucumán.
                    </p>
                    <button
                      onClick={() => setActiveTab('copa_argentina')}
                      className="w-full mt-2 py-1.5 px-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-500/40 transition-colors"
                    >
                      <span>Ver fixture y resultados ({roundCounts.all})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] text-[10px] text-[#8B949E] text-center">
                  Clasifica a Copa Libertadores 2027 & Supercopa Argentina
                </div>
              </div>

              {/* 2.3 SUPERCOPA INTERNACIONAL */}
              <div className="p-5 rounded-3xl bg-[#101726]/90 border border-white/[0.08] hover:border-[#DCA842]/40 transition-all space-y-3 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#DCA842] flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      Sede Internacional
                    </span>
                    <span className="text-[10px] text-[#8B949E]">Ventana 2027</span>
                  </div>

                  <h4 className="font-editorial font-bold text-lg text-[#F1EDE6] mb-1">
                    SUPERCOPA INTERNACIONAL
                  </h4>
                  <p className="text-[10px] text-[#8B949E] leading-relaxed mb-3">
                    Ganador Trofeo de Campeones vs 1° Tabla Anual
                  </p>

                  <div className="space-y-2">
                    <div
                      onClick={() => onSelectClub && onSelectClub('4')}
                      className="p-2.5 rounded-xl bg-[#182338]/80 border border-[#DCA842]/30 flex items-center justify-between cursor-pointer hover:bg-[#182338]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <TeamBadge
                          logoUrl="https://a.espncdn.com/i/teamlogos/soccer/500/4.png"
                          teamId="4"
                          size="xs"
                        />
                        <div className="truncate">
                          <span className="text-xs font-bold text-[#F1EDE6] block truncate">
                            Belgrano (Córdoba)
                          </span>
                          <span className="text-[10px] text-[#8B949E] block truncate">
                            Clasificado Trofeo de Campeones (Apertura)
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase text-[#30A46C] bg-[#30A46C]/10 px-1.5 py-0.5 rounded border border-[#30A46C]/20 shrink-0">
                        Clasificado
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#151E2E] border border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                          <Shield className="w-3.5 h-3.5 text-[#8B949E]" />
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold text-[#F1EDE6] block truncate">
                            Por definir
                          </span>
                          <span className="text-[10px] text-[#8B949E] block truncate">
                            1° Tabla General Anual 2026
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase text-[#8B949E] bg-white/[0.04] px-1.5 py-0.5 rounded shrink-0">
                        Por definir
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] text-[10px] text-[#8B949E] flex items-center justify-between">
                  <span className="truncate">Estadio Hazza Bin Zayed, Abu Dhabi</span>
                  <span className="text-[#DCA842] font-semibold">Por definir</span>
                </div>
              </div>
            </div>

            {/* TROFEO DE CAMPEONES */}
            <div className="flex flex-col items-center">
              <div className="w-full max-w-lg p-5 rounded-3xl bg-[#101726] border border-[#DCA842]/40 shadow-xl space-y-3 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCA842]/15 border border-[#DCA842]/30 text-[#DCA842] text-[10px] font-bold uppercase tracking-wider">
                  <Trophy className="w-3.5 h-3.5" />
                  Cruce de Campeones de Liga
                </div>

                <div>
                  <h4 className="font-editorial font-bold text-xl text-[#F1EDE6]">
                    TROFEO DE CAMPEONES 2026
                  </h4>
                  <p className="text-[11px] text-[#8B949E]">
                    Campeón Torneo Apertura vs Campeón Torneo Clausura · Campeón: Por definir
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div
                    onClick={() => onSelectClub && onSelectClub('4')}
                    className="p-3 rounded-2xl bg-[#182338]/80 border border-[#DCA842]/40 text-center space-y-2 cursor-pointer hover:bg-[#182338] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center mx-auto p-1.5">
                      <TeamBadge
                        logoUrl="https://a.espncdn.com/i/teamlogos/soccer/500/4.png"
                        teamId="4"
                        size="sm"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#F1EDE6] block truncate">
                        Belgrano (Córdoba)
                      </span>
                      <span className="text-[10px] text-[#30A46C] font-semibold block truncate">
                        Campeón Apertura 2026 (Confirmado)
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#151E2E] border border-white/[0.08] text-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-[#8B949E]">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#F1EDE6] block truncate">
                        Por definir
                      </span>
                      <span className="text-[10px] text-[#8B949E] block truncate">
                        Campeón Clausura 2026
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#8B949E] pt-2 border-t border-white/[0.06]">
                  <span>Estadio Único Madre de Ciudades, Santiago del Estero</span>
                  <span className="text-[#DCA842] font-semibold">Diciembre 2026 · Por definir</span>
                </div>
              </div>

              <div className="w-0.5 h-8 bg-blue-500/30" />
            </div>

            {/* NIVEL 1: LOS 3 PILARES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Apertura */}
              <div className="p-5 rounded-3xl bg-[#101726] border-2 border-[#DCA842]/50 text-center space-y-3 shadow-md">
                <div className="w-10 h-10 rounded-2xl bg-[#DCA842]/20 border border-[#DCA842]/40 flex items-center justify-center mx-auto text-[#DCA842]">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#DCA842] block">
                    Primer Semestre · Torneo Concluido
                  </span>
                  <h4 className="font-editorial font-bold text-base text-[#F1EDE6]">
                    TORNEO APERTURA 2026
                  </h4>
                </div>

                <div
                  onClick={() => onSelectClub && onSelectClub('4')}
                  className="p-3 rounded-2xl bg-[#182338]/90 border border-[#DCA842]/40 cursor-pointer hover:bg-[#182338] transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center mx-auto mb-2 p-1.5">
                    <TeamBadge
                      logoUrl="https://a.espncdn.com/i/teamlogos/soccer/500/4.png"
                      teamId="4"
                      size="sm"
                    />
                  </div>
                  <span className="text-xs font-bold text-[#F1EDE6] block truncate">
                    Belgrano (Córdoba)
                  </span>
                  <span className="text-[10px] text-[#DCA842] font-semibold">
                    Campeón Oficial Apertura 2026
                  </span>
                </div>

                <div className="text-[10px] text-[#8B949E]">
                  Clasificado a: Trofeo de Campeones & Copa Libertadores (Arg 1)
                </div>
              </div>

              {/* Clausura */}
              <div className="p-5 rounded-3xl bg-[#0D1422] border border-white/[0.08] hover:border-[#DCA842]/40 transition-all text-center space-y-3 shadow-md">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center mx-auto text-[#8B949E]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B949E] block">
                    Segundo Semestre · En Desarrollo
                  </span>
                  <h4 className="font-editorial font-bold text-base text-[#F1EDE6]">
                    TORNEO CLAUSURA 2026
                  </h4>
                </div>

                <div className="p-3 rounded-2xl bg-[#141C2E] border border-white/[0.06]">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-2 text-[#8B949E]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#F1EDE6] block truncate">
                    Por definir
                  </span>
                  <span className="text-[10px] text-[#8B949E]">
                    Fase Regular en disputa (16 fechas)
                  </span>
                </div>

                <div className="text-[10px] text-[#8B949E]">
                  Clasifica a: Trofeo de Campeones & Copa Libertadores (Arg 2)
                </div>
              </div>

              {/* Tabla Anual */}
              <div className="p-5 rounded-3xl bg-[#0D1422] border border-white/[0.08] hover:border-[#DCA842]/40 transition-all text-center space-y-3 shadow-md">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center mx-auto text-[#8B949E]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B949E] block">
                    Campeón de Liga · Acumulado
                  </span>
                  <h4 className="font-editorial font-bold text-base text-[#F1EDE6]">
                    TABLA GENERAL ANUAL
                  </h4>
                </div>

                <div className="p-3 rounded-2xl bg-[#141C2E] border border-white/[0.06]">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-2 text-[#8B949E]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#F1EDE6] block truncate">
                    Por definir
                  </span>
                  <span className="text-[10px] text-[#8B949E]">
                    1° Puesto Tabla Acumulada (32 fechas)
                  </span>
                </div>

                <div className="text-[10px] text-[#8B949E]">
                  Clasifica a: Supercopa Argentina & Supercopa Internacional
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          VISTA 2: FIXTURE, RESULTADOS Y BRACKET DE COPA ARGENTINA 2026
         ─────────────────────────────────────────────────────────── */}
      {activeTab === 'copa_argentina' && (
        <div className="space-y-6">
          {/* Header con resumen y KPIs ejecutivos */}
          <div className="p-6 rounded-3xl bg-[#121519] border border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  Copa Argentina Federal AFA 2026
                </span>
                <span className="text-[11px] text-[#8B949E]">
                  62 cotejos oficiales en sedes neutrales de todo el país
                </span>
              </div>
              <h2 className="font-editorial font-black text-2xl sm:text-4xl text-[#F1EDE6] tracking-tight">
                FIXTURE, RESULTADOS Y CUADRO DE HONOR
              </h2>
              <p className="text-xs sm:text-sm text-[#8B949E] max-w-2xl leading-relaxed">
                Certamen de eliminación directa que reúne a 64 clubes de todas las categorías de AFA. El campeón clasifica a la <strong>Copa Libertadores 2027 (Argentina 3)</strong> y a la <strong>Supercopa Argentina 2026</strong>.
              </p>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
              <div className="p-3 rounded-2xl bg-[#181C22] border border-white/[0.06] text-center">
                <span className="text-[10px] uppercase font-bold text-[#8B949E] block">Partidos</span>
                <span className="text-lg font-black font-num text-[#F1EDE6]">
                  {copaSummary?.totalMatches || copaMatches.length || 62}
                </span>
                <span className="text-[9px] text-[#30A46C] block font-semibold">
                  {copaSummary?.completionPercentage || 96.8}% disputado
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#181C22] border border-white/[0.06] text-center">
                <span className="text-[10px] uppercase font-bold text-[#8B949E] block">Goles Totales</span>
                <span className="text-lg font-black font-num text-[#DCA842]">
                  {copaSummary?.totalGoals || 151}
                </span>
                <span className="text-[9px] text-[#8B949E] block">
                  {copaSummary?.avgGoals || 2.52} p/partido
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#181C22] border border-white/[0.06] text-center">
                <span className="text-[10px] uppercase font-bold text-[#8B949E] block">Semifinales</span>
                <span className="text-lg font-black font-num text-blue-400">2 Cruces</span>
                <span className="text-[9px] text-[#8B949E] block">4 aspirantes</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#181C22] border border-white/[0.06] text-center">
                <span className="text-[10px] uppercase font-bold text-[#8B949E] block">Campeón</span>
                <span className="text-sm font-bold text-[#DCA842] block truncate">
                  Por definir
                </span>
                <span className="text-[9px] text-[#8B949E] block">Gran Final 2026</span>
              </div>
            </div>
          </div>

          {/* Sub-Tabs de Navegación de Copa Argentina */}
          <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-3">
            {[
              { id: 'fixture', label: 'Fixture y Rondas', icon: Calendar, badge: `${roundCounts.all}` },
              { id: 'bracket', label: 'Cuadro de Eliminación (Bracket)', icon: Trophy },
              { id: 'results', label: 'Resultados Oficiales', icon: CheckCircle2, badge: `${roundCounts.all - (copaSummary?.scheduledMatches || 2)}` },
              { id: 'semis', label: 'Semifinales en Disputa', icon: Flame, badge: '2' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = copaSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCopaSubTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#DCA842] text-[#0A0C0E] shadow-md shadow-[#DCA842]/20'
                      : 'bg-[#121519] text-[#8B949E] hover:text-[#F1EDE6] border border-white/[0.06]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-num ${
                        isActive ? 'bg-[#0A0C0E]/20 text-[#0A0C0E]' : 'bg-white/[0.06] text-[#8B949E]'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ───────────────────────────────────────────────────────────
              SUB-TAB 1: FIXTURE COMPLETO CON FILTROS Y BUSCADOR
             ─────────────────────────────────────────────────────────── */}
          {copaSubTab === 'fixture' && (
            <div className="space-y-4">
              {/* Filtros por Rondas y Buscador */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121519] p-3 rounded-2xl border border-white/[0.08]">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
                  {[
                    { id: 'all', label: `Todos (${roundCounts.all})` },
                    { id: 'semifinales', label: `Semifinales (${roundCounts.semifinales})` },
                    { id: 'cuartos', label: `Cuartos (${roundCounts.cuartos})` },
                    { id: 'octavos', label: `Octavos (${roundCounts.octavos})` },
                    { id: '16vos', label: `16vos (${roundCounts['16vos']})` },
                    { id: '32vos', label: `32vos (${roundCounts['32vos']})` },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRound(r.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        selectedRound === r.id
                          ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm'
                          : 'text-[#8B949E] hover:text-[#F1EDE6] bg-[#181C22]'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                <div className="relative max-w-xs w-full">
                  <Search className="w-3.5 h-3.5 text-[#8B949E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchCopa}
                    onChange={(e) => setSearchCopa(e.target.value)}
                    placeholder="Buscar por club o sede..."
                    className="w-full bg-[#181C22] border border-white/[0.08] focus:border-[#DCA842] text-xs text-[#F1EDE6] pl-9 pr-3 py-1.5 rounded-xl placeholder-[#8B949E]/50 focus:outline-hidden"
                  />
                  {searchCopa && (
                    <button
                      onClick={() => setSearchCopa('')}
                      className="text-[10px] text-[#8B949E] hover:text-[#F1EDE6] absolute right-2.5 top-1/2 -translate-y-1/2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Grid de Partidos */}
              {loadingCopa ? (
                <div className="p-12 text-center text-xs text-[#8B949E] flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#DCA842]" />
                  <span>Sincronizando partidos de Copa Argentina...</span>
                </div>
              ) : filteredCopaMatches.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8B949E] bg-[#121519] border border-white/[0.08] rounded-2xl">
                  No se encontraron partidos para los filtros seleccionados.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredCopaMatches.map((m) => {
                    const isFinished = m.status === 'finished';
                    const isScheduled = m.status === 'scheduled';
                    const isHomeWinner = isFinished && m.homeScore !== null && m.awayScore !== null && m.homeScore > m.awayScore;
                    const isAwayWinner = isFinished && m.homeScore !== null && m.awayScore !== null && m.awayScore > m.homeScore;

                    return (
                      <div
                        key={m.id}
                        className="p-4 rounded-2xl bg-[#121519] border border-white/[0.08] hover:border-[#DCA842]/30 transition-all flex flex-col justify-between space-y-3 shadow-xs"
                      >
                        <div>
                          {/* Top Header: Ronda y Horario en huso de Argentina */}
                          <div className="flex items-center justify-between text-[10px] text-[#8B949E] pb-2 border-b border-white/[0.06]">
                            <span className="font-bold text-[#DCA842] uppercase tracking-wider">
                              {m.round}
                            </span>
                            <div className="flex items-center gap-1.5 font-num">
                              <Clock className="w-3 h-3 text-[#8B949E]" />
                              <span>{formatMatchTime(m.time, m.date)}</span>
                            </div>
                          </div>

                          {/* Equipos y Marcador */}
                          <div className="py-2 space-y-2">
                            {/* Local */}
                            <div
                              onClick={() => m.homeTeamId && onSelectClub && onSelectClub(m.homeTeamId)}
                              className={`flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer ${
                                isHomeWinner ? 'bg-[#30A46C]/10 border border-[#30A46C]/30' : 'bg-[#181C22]/60 hover:bg-[#181C22]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {m.homeTeam?.logo ? (
                                  <TeamBadge logoUrl={m.homeTeam.logo} teamId={m.homeTeamId} size="xs" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center text-[9px] font-black text-[#8B949E]">
                                    L
                                  </div>
                                )}
                                <span className={`text-xs truncate ${isHomeWinner ? 'font-bold text-[#F1EDE6]' : 'text-[#8B949E]'}`}>
                                  {m.homeTeam?.name || 'Local'}
                                </span>
                              </div>
                              {isFinished && m.homeScore !== null ? (
                                <span className={`font-num text-sm font-bold pl-2 ${isHomeWinner ? 'text-[#30A46C]' : 'text-[#8B949E]'}`}>
                                  {m.homeScore}
                                </span>
                              ) : isScheduled ? (
                                <span className="text-[10px] font-bold text-[#8B949E] px-2 py-0.5 rounded bg-white/[0.04]">
                                  vs
                                </span>
                              ) : null}
                            </div>

                            {/* Visitante */}
                            <div
                              onClick={() => m.awayTeamId && onSelectClub && onSelectClub(m.awayTeamId)}
                              className={`flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer ${
                                isAwayWinner ? 'bg-[#30A46C]/10 border border-[#30A46C]/30' : 'bg-[#181C22]/60 hover:bg-[#181C22]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {m.awayTeam?.logo ? (
                                  <TeamBadge logoUrl={m.awayTeam.logo} teamId={m.awayTeamId} size="xs" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center text-[9px] font-black text-[#8B949E]">
                                    V
                                  </div>
                                )}
                                <span className={`text-xs truncate ${isAwayWinner ? 'font-bold text-[#F1EDE6]' : 'text-[#8B949E]'}`}>
                                  {m.awayTeam?.name || 'Visitante'}
                                </span>
                              </div>
                              {isFinished && m.awayScore !== null ? (
                                <span className={`font-num text-sm font-bold pl-2 ${isAwayWinner ? 'text-[#30A46C]' : 'text-[#8B949E]'}`}>
                                  {m.awayScore}
                                </span>
                              ) : isScheduled ? (
                                <span className="text-[10px] font-bold text-[#8B949E] px-2 py-0.5 rounded bg-white/[0.04]">
                                  vs
                                </span>
                              ) : null}
                            </div>
                          </div>

                          {/* Nota de penales si el partido empató y se definió por tanda */}
                          {(m as any).notes && (
                            <div className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-300 font-medium truncate">
                              {(m as any).notes}
                            </div>
                          )}
                        </div>

                        {/* Footer: Sede y Fecha */}
                        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-[#8B949E]">
                          <span className="truncate max-w-[170px]" title={m.stadium}>
                            <MapPin className="w-3 h-3 inline mr-1 text-[#8B949E]" />
                            {m.stadium || 'Estadio Neutral'}
                          </span>
                          <span className="font-num text-[11px] text-[#F1EDE6]">{m.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────
              SUB-TAB 2: CUADRO DE ELIMINACIÓN DIRECTA (BRACKET)
             ─────────────────────────────────────────────────────────── */}
          {copaSubTab === 'bracket' && (
            <div className="space-y-6">
              {/* Filtro de Fase de Bracket */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2 bg-[#121519] p-3 rounded-2xl border border-white/[0.08]">
                {[
                  { id: 'all', label: 'Todas las Rondas' },
                  { id: 'semifinales', label: 'Semifinales (2)' },
                  { id: 'cuartos', label: 'Cuartos de Final (5)' },
                  { id: 'octavos', label: 'Octavos de Final (7)' },
                  { id: '16vos', label: '16vos de Final (13)' },
                  { id: '32vos', label: '32vos de Final (35)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedBracketStage(s.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      selectedBracketStage === s.id
                        ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm'
                        : 'text-[#8B949E] hover:text-[#F1EDE6] bg-[#181C22]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Rondas del Cuadro */}
              <div className="space-y-6">
                {(copaBracket?.rounds || [])
                  .filter((stage) => {
                    if (selectedBracketStage === 'all') return true;
                    return stage.id.toLowerCase().includes(selectedBracketStage.toLowerCase());
                  })
                  .map((stage) => {
                    return (
                      <div key={stage.id} className="space-y-3">
                        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                          <h3 className="font-editorial font-bold text-lg text-[#F1EDE6] flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-[#DCA842]" />
                            {stage.name} ({stage.matches.length} cruces)
                          </h3>
                          <span className="text-[11px] text-[#8B949E]">
                            Sede Neutral Federal
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {stage.matches.map((m) => {
                            const isFinished = m.status === 'finished';
                            const isHomeWinner = isFinished && m.homeScore !== null && m.awayScore !== null && m.homeScore > m.awayScore;
                            const isAwayWinner = isFinished && m.homeScore !== null && m.awayScore !== null && m.awayScore > m.homeScore;

                            return (
                              <div
                                key={m.id}
                                className="p-3.5 rounded-2xl bg-[#121519] border border-white/[0.08] space-y-2.5 shadow-xs"
                              >
                                <div className="flex items-center justify-between text-[10px] text-[#8B949E]">
                                  <span>{m.date}</span>
                                  <span>{formatMatchTime(m.time, m.date)}</span>
                                </div>

                                <div className="space-y-1.5">
                                  <div
                                    className={`flex items-center justify-between p-2 rounded-xl ${
                                      isHomeWinner ? 'bg-[#30A46C]/10 border border-[#30A46C]/30' : 'bg-[#181C22]/60'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      {m.homeTeam?.logo && (
                                        <TeamBadge logoUrl={m.homeTeam.logo} teamId={m.homeTeamId} size="xs" />
                                      )}
                                      <span className={`text-xs truncate ${isHomeWinner ? 'font-bold text-[#F1EDE6]' : 'text-[#8B949E]'}`}>
                                        {m.homeTeam?.name}
                                      </span>
                                    </div>
                                    <span className="font-num text-xs font-bold text-[#F1EDE6]">
                                      {isFinished ? m.homeScore : '-'}
                                    </span>
                                  </div>

                                  <div
                                    className={`flex items-center justify-between p-2 rounded-xl ${
                                      isAwayWinner ? 'bg-[#30A46C]/10 border border-[#30A46C]/30' : 'bg-[#181C22]/60'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      {m.awayTeam?.logo && (
                                        <TeamBadge logoUrl={m.awayTeam.logo} teamId={m.awayTeamId} size="xs" />
                                      )}
                                      <span className={`text-xs truncate ${isAwayWinner ? 'font-bold text-[#F1EDE6]' : 'text-[#8B949E]'}`}>
                                        {m.awayTeam?.name}
                                      </span>
                                    </div>
                                    <span className="font-num text-xs font-bold text-[#F1EDE6]">
                                      {isFinished ? m.awayScore : '-'}
                                    </span>
                                  </div>
                                </div>

                                {(m as any).notes && (
                                  <div className="text-[10px] text-blue-300 bg-blue-500/10 px-2 py-1 rounded-lg truncate">
                                    {(m as any).notes}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────
              SUB-TAB 3: SOLO RESULTADOS CONCLUIDOS
             ─────────────────────────────────────────────────────────── */}
          {copaSubTab === 'results' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#121519] border border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#30A46C]" />
                  <span className="text-xs font-bold text-[#F1EDE6]">
                    60 Partidos Oficiales Concluidos
                  </span>
                </div>
                <span className="text-xs text-[#8B949E]">
                  Ordenados cronológicamente por disputa
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {copaMatches
                  .filter((m) => m.status === 'finished')
                  .map((m) => {
                    const isHomeWinner = m.homeScore !== null && m.awayScore !== null && m.homeScore > m.awayScore;
                    const isAwayWinner = m.homeScore !== null && m.awayScore !== null && m.awayScore > m.homeScore;

                    return (
                      <div
                        key={m.id}
                        className="p-4 rounded-2xl bg-[#121519] border border-white/[0.08] flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-[#8B949E] pb-2 border-b border-white/[0.06]">
                            <span className="font-bold text-[#DCA842] uppercase">{m.round}</span>
                            <span className="font-num">{m.date}</span>
                          </div>

                          <div className="py-2 space-y-2">
                            <div className={`flex items-center justify-between p-2 rounded-xl ${
                              isHomeWinner ? 'bg-[#30A46C]/10 border border-[#30A46C]/30' : 'bg-[#181C22]/60'
                            }`}>
                              <div className="flex items-center gap-2 min-w-0">
                                {m.homeTeam?.logo && (
                                  <TeamBadge logoUrl={m.homeTeam.logo} teamId={m.homeTeamId} size="xs" />
                                )}
                                <span className={`text-xs truncate ${isHomeWinner ? 'font-bold text-[#F1EDE6]' : 'text-[#8B949E]'}`}>
                                  {m.homeTeam?.name}
                                </span>
                              </div>
                              <span className={`font-num text-sm font-bold ${isHomeWinner ? 'text-[#30A46C]' : 'text-[#8B949E]'}`}>
                                {m.homeScore}
                              </span>
                            </div>

                            <div className={`flex items-center justify-between p-2 rounded-xl ${
                              isAwayWinner ? 'bg-[#30A46C]/10 border border-[#30A46C]/30' : 'bg-[#181C22]/60'
                            }`}>
                              <div className="flex items-center gap-2 min-w-0">
                                {m.awayTeam?.logo && (
                                  <TeamBadge logoUrl={m.awayTeam.logo} teamId={m.awayTeamId} size="xs" />
                                )}
                                <span className={`text-xs truncate ${isAwayWinner ? 'font-bold text-[#F1EDE6]' : 'text-[#8B949E]'}`}>
                                  {m.awayTeam?.name}
                                </span>
                              </div>
                              <span className={`font-num text-sm font-bold ${isAwayWinner ? 'text-[#30A46C]' : 'text-[#8B949E]'}`}>
                                {m.awayScore}
                              </span>
                            </div>
                          </div>

                          {(m as any).notes && (
                            <div className="text-[10px] text-blue-300 bg-blue-500/10 px-2 py-1 rounded-lg truncate">
                              {(m as any).notes}
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-white/[0.06] text-[10px] text-[#8B949E] flex items-center justify-between">
                          <span className="truncate">{m.stadium || 'Estadio Neutral'}</span>
                          <span className="font-semibold text-[#30A46C]">Finalizado</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────
              SUB-TAB 4: SEMIFINALES EN DISPUTA (DESTACADO)
             ─────────────────────────────────────────────────────────── */}
          {copaSubTab === 'semis' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900/30 via-[#121519] to-amber-900/20 border border-blue-500/30 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5" />
                  Instancia Decisiva
                </div>
                <h3 className="font-editorial font-black text-2xl sm:text-3xl text-[#F1EDE6]">
                  SEMIFINALES DE COPA ARGENTINA 2026
                </h3>
                <p className="text-xs sm:text-sm text-[#8B949E] max-w-2xl">
                  Los dos cruces que definirán a los finalistas del certamen federal más emblemático de la Argentina.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Semifinal 1: Atlético Tucumán vs Platense */}
                <div className="p-6 rounded-3xl bg-[#121519] border-2 border-blue-500/30 hover:border-blue-500/50 transition-all space-y-5 shadow-xl">
                  <div className="flex items-center justify-between text-xs text-[#8B949E]">
                    <span className="font-bold text-[#DCA842] uppercase tracking-wider">
                      SEMIFINAL 1
                    </span>
                    <span className="flex items-center gap-1.5 font-num text-[#F1EDE6]">
                      <Clock className="w-3.5 h-3.5 text-[#DCA842]" />
                      15:00 hs (ART)
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-4">
                    {/* Club 1 */}
                    <div
                      onClick={() => onSelectClub && onSelectClub('9785')}
                      className="flex-1 text-center space-y-2 cursor-pointer group"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.1] group-hover:border-blue-400/50 flex items-center justify-center mx-auto p-2 transition-all">
                        <TeamBadge logoUrl="https://a.espncdn.com/i/teamlogos/soccer/500/9785.png" teamId="9785" size="md" />
                      </div>
                      <span className="font-bold text-sm text-[#F1EDE6] block truncate">
                        Atlético Tucumán
                      </span>
                      <span className="text-[10px] text-[#8B949E] block">El Decano</span>
                    </div>

                    {/* VS Badge */}
                    <div className="w-10 h-10 rounded-full bg-[#181C22] border border-white/[0.1] flex items-center justify-center font-editorial font-black text-xs text-[#DCA842] shrink-0">
                      VS
                    </div>

                    {/* Club 2 */}
                    <div
                      onClick={() => onSelectClub && onSelectClub('7764')}
                      className="flex-1 text-center space-y-2 cursor-pointer group"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.1] group-hover:border-blue-400/50 flex items-center justify-center mx-auto p-2 transition-all">
                        <TeamBadge logoUrl="https://a.espncdn.com/i/teamlogos/soccer/500/7764.png" teamId="7764" size="md" />
                      </div>
                      <span className="font-bold text-sm text-[#F1EDE6] block truncate">
                        Platense
                      </span>
                      <span className="text-[10px] text-[#8B949E] block">El Calamar</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#181C22] border border-white/[0.06] space-y-1.5 text-xs text-[#8B949E]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#DCA842]" />
                        Estadio Neutral Designado AFA
                      </span>
                      <span className="font-semibold text-[#F1EDE6]">25 de Octubre de 2026</span>
                    </div>
                    <p className="text-[11px] text-[#8B949E]/80">
                      Definición a partido único. En caso de igualdad al término de los 90 minutos reglamentarios, se define por tanda de tiros desde el punto penal.
                    </p>
                  </div>
                </div>

                {/* Semifinal 2: Banfield vs Boca Juniors */}
                <div className="p-6 rounded-3xl bg-[#121519] border-2 border-blue-500/30 hover:border-blue-500/50 transition-all space-y-5 shadow-xl">
                  <div className="flex items-center justify-between text-xs text-[#8B949E]">
                    <span className="font-bold text-[#DCA842] uppercase tracking-wider">
                      SEMIFINAL 2
                    </span>
                    <span className="flex items-center gap-1.5 font-num text-[#F1EDE6]">
                      <Clock className="w-3.5 h-3.5 text-[#DCA842]" />
                      15:00 hs (ART)
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-4">
                    {/* Club 1 */}
                    <div
                      onClick={() => onSelectClub && onSelectClub('235')}
                      className="flex-1 text-center space-y-2 cursor-pointer group"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.1] group-hover:border-blue-400/50 flex items-center justify-center mx-auto p-2 transition-all">
                        <TeamBadge logoUrl="https://a.espncdn.com/i/teamlogos/soccer/500/235.png" teamId="235" size="md" />
                      </div>
                      <span className="font-bold text-sm text-[#F1EDE6] block truncate">
                        Banfield
                      </span>
                      <span className="text-[10px] text-[#8B949E] block">El Taladro</span>
                    </div>

                    {/* VS Badge */}
                    <div className="w-10 h-10 rounded-full bg-[#181C22] border border-white/[0.1] flex items-center justify-center font-editorial font-black text-xs text-[#DCA842] shrink-0">
                      VS
                    </div>

                    {/* Club 2 */}
                    <div
                      onClick={() => onSelectClub && onSelectClub('5')}
                      className="flex-1 text-center space-y-2 cursor-pointer group"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.1] group-hover:border-blue-400/50 flex items-center justify-center mx-auto p-2 transition-all">
                        <TeamBadge logoUrl="https://a.espncdn.com/i/teamlogos/soccer/500/5.png" teamId="5" size="md" />
                      </div>
                      <span className="font-bold text-sm text-[#F1EDE6] block truncate">
                        Boca Juniors
                      </span>
                      <span className="text-[10px] text-[#8B949E] block">Xeneize</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#181C22] border border-white/[0.06] space-y-1.5 text-xs text-[#8B949E]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#DCA842]" />
                        Estadio Neutral Designado AFA
                      </span>
                      <span className="font-semibold text-[#F1EDE6]">25 de Octubre de 2026</span>
                    </div>
                    <p className="text-[11px] text-[#8B949E]/80">
                      Definición a partido único. En caso de igualdad al término de los 90 minutos reglamentarios, se define por tanda de tiros desde el punto penal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Official Clarification Card */}
      <div className="p-5 rounded-2xl bg-[#121519] border border-white/[0.08] space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#F1EDE6]">
          <Info className="w-4 h-4 text-[#DCA842]" />
          <span>Reglamento AFA / LPF 2026 — Asignación de Plazas y Desempates</span>
        </div>
        <p className="text-xs text-[#8B949E] leading-relaxed">
          Cada final y supercopa nacional se definirá formalmente una vez concluidos los certámenes del calendario oficial. El único campeón oficial coronado hasta el momento en la temporada 2026 es <strong>Belgrano de Córdoba</strong> tras ganar la final del Torneo Apertura ante River Plate (3-2). Las copas nacionales, el Torneo Clausura y la Tabla General Anual permanecen por definir. En caso de que un mismo club se consagre en más de una competencia oficial, clasifica el Subcampeón de la Tabla General Anual correspondiente.
        </p>
      </div>
    </div>
  );
};
