import React from 'react';
import { Team, StandingRow } from '../types/football';
import { TeamBadge } from '../components/common/TeamBadge';
import {
  Trophy,
  Award,
  Calendar,
  MapPin,
  Info,
  Shield,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface CopasNacionalesPageProps {
  topStandings?: StandingRow[];
  teams?: Team[];
  onSelectClub?: (clubId: string) => void;
}

export const CopasNacionalesPage: React.FC<CopasNacionalesPageProps> = ({ onSelectClub }) => {
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
              Definición de Títulos
            </span>
          </div>
          <h1 className="font-editorial font-black text-3xl sm:text-5xl text-[#F1EDE6] tracking-tight">
            COPAS NACIONALES
          </h1>
          <p className="text-xs sm:text-sm text-[#8B949E] mt-1 max-w-2xl leading-relaxed">
            Árbol oficial de clasificación a los trofeos de campeones del fútbol argentino. El Torneo Apertura consagró a Belgrano (Córdoba); los campeones de las copas nacionales permanecen por definir.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-[#181C22] border border-white/[0.08] text-xs font-semibold text-[#8B949E]">
            Temporada 2026
          </span>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────
          THE OFFICIAL FLOWCHART TREE
         ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0A1120] via-[#090D15] to-[#0A0C0E] border border-blue-500/20 p-6 sm:p-10 shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-12">
          {/* ═══════════════════════════════════════════════════════════
              NIVEL 3 (CÚSPIDE): RECOPA DE LOS CAMPEONES
             ═══════════════════════════════════════════════════════════ */}
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

          {/* ═══════════════════════════════════════════════════════════
              NIVEL 2 (COPAS INTERMEDIAS):
              SUPERCOPA ARGENTINA  ──  COPA ARGENTINA  ──  SUPERCOPA INTERNACIONAL
             ═══════════════════════════════════════════════════════════ */}
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

                {/* Matchup Teams */}
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

            {/* 2.2 COPA ARGENTINA (CENTRAL TIE) */}
            <div className="p-5 rounded-3xl bg-gradient-to-b from-[#141C2E] to-[#0E1524] border-2 border-blue-400/30 hover:border-blue-400/60 transition-all space-y-3 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" />
                    Federal / Todos los niveles
                  </span>
                  <span className="text-[10px] text-[#8B949E]">AFA Oficial</span>
                </div>

                <h4 className="font-editorial font-bold text-lg text-[#F1EDE6] mb-1">
                  COPA ARGENTINA
                </h4>
                <p className="text-[10px] text-[#8B949E] leading-relaxed mb-3">
                  Otorga clasificación directa a Libertadores (Arg 3) y Supercopa Argentina
                </p>

                {/* Champion Display */}
                <div className="p-3.5 rounded-2xl bg-[#0D1422] border border-blue-400/20 text-center space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-[#8B949E]">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#F1EDE6] block">
                      Por definir
                    </span>
                    <span className="text-[10px] text-[#8B949E] font-medium block">
                      Fase eliminatoria federal en disputa
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] text-[10px] text-[#8B949E] text-center">
                Clasifica a Copa Libertadores 2027 (Argentina 3) · Campeón: Por definir
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

                {/* Matchup Teams */}
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

          {/* ═══════════════════════════════════════════════════════════
              TROFEO DE CAMPEONES (NEXO DIRECTO CON APERTURA Y CLAUSURA)
             ═══════════════════════════════════════════════════════════ */}
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
                {/* Belgrano clasificado por Apertura */}
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

                {/* Por definir para Clausura */}
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

            {/* Connecting Line Down to Level 1 */}
            <div className="w-0.5 h-8 bg-blue-500/30" />
          </div>

          {/* ═══════════════════════════════════════════════════════════
              NIVEL 1 (BASE): LOS 3 PILARES DE PRIMERA DIVISIÓN
              APERTURA  ──  CLAUSURA  ──  CAMPEÓN DE LIGA (1° TABLA ANUAL)
             ═══════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* 1.1 TORNEO APERTURA */}
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

            {/* 1.2 TORNEO CLAUSURA */}
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

            {/* 1.3 TABLA GENERAL ANUAL (CAMPEÓN DE LIGA) */}
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
