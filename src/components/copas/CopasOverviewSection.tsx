import React from 'react';
import { Team, StandingRow } from '../../types/football';
import { TeamBadge } from '../common/TeamBadge';
import {
  Trophy,
  Calendar,
  MapPin,
  ChevronRight,
  Shield,
  Clock,
  HelpCircle,
} from 'lucide-react';

interface CopasOverviewSectionProps {
  topStandings?: StandingRow[];
  teams?: Team[];
  onSelectClub?: (clubId: string) => void;
  onNavigate: (view: string) => void;
}

export const CopasOverviewSection: React.FC<CopasOverviewSectionProps> = ({
  onNavigate,
  onSelectClub,
}) => {
  const cupsList = [
    {
      title: 'Trofeo de Campeones',
      season: '2026',
      statusBadge: 'Por definir',
      venue: 'Estadio Único Madre de Ciudades, Santiago del Estero',
      date: 'Diciembre 2026 · Final Oficial',
      slot1: {
        criterion: 'Campeón Torneo Apertura 2026',
        teamName: 'Belgrano (Córdoba)',
        teamId: '4',
        logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/4.png',
        confirmed: true,
        status: 'Clasificado Oficial',
      },
      slot2: {
        criterion: 'Campeón Torneo Clausura 2026',
        teamName: 'Por definir',
        teamId: undefined,
        logo: undefined,
        confirmed: false,
        status: 'Por definir',
      },
      note: 'Si un mismo club gana Apertura y Clausura (Bicampeón), clasifica el Subcampeón de la Tabla Anual.',
    },
    {
      title: 'Supercopa Argentina',
      season: '2026',
      statusBadge: 'Por definir',
      venue: 'Estadio Mario Alberto Kempes, Córdoba',
      date: 'Principios de 2027 · Sede Neutral',
      slot1: {
        criterion: 'Campeón de Liga (1° Tabla General Anual)',
        teamName: 'Por definir',
        teamId: undefined,
        logo: undefined,
        confirmed: false,
        status: 'Por definir',
      },
      slot2: {
        criterion: 'Campeón Copa Argentina 2026',
        teamName: 'Por definir',
        teamId: undefined,
        logo: undefined,
        confirmed: false,
        status: 'Por definir',
      },
      note: 'Enfrenta al Campeón de Liga frente al Campeón de la Copa Argentina federal.',
    },
    {
      title: 'Supercopa Internacional',
      season: '2026',
      statusBadge: 'Por definir',
      venue: 'Estadio Hazza Bin Zayed, Abu Dhabi / Sede Internacional',
      date: 'Ventana Internacional 2027',
      slot1: {
        criterion: 'Ganador Trofeo de Campeones (Clasif. Apertura)',
        teamName: 'Belgrano (Córdoba)',
        teamId: '4',
        logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/4.png',
        confirmed: true,
        status: 'Clasificado Apertura',
      },
      slot2: {
        criterion: '1° Tabla General Anual 2026',
        teamName: 'Por definir',
        teamId: undefined,
        logo: undefined,
        confirmed: false,
        status: 'Por definir',
      },
      note: 'Enfrenta al ganador del Trofeo de Campeones frente al mejor ubicado en la Tabla Anual.',
    },
  ];

  return (
    <section className="space-y-5">
      {/* Header del apartado */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.06] text-[#8B949E] border border-white/[0.1] flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-[#DCA842]" />
              AFA / LPF · Temporada Oficial 2026
            </span>
            <span className="text-[11px] text-[#8B949E]">
              Definición de Títulos
            </span>
          </div>
          <h2 className="font-editorial font-black text-xl sm:text-2xl text-[#F1EDE6] tracking-tight">
            COPAS NACIONALES Y SUPERCOPAS
          </h2>
          <p className="text-xs text-[#8B949E] mt-0.5">
            Estructura de las finales oficiales de la temporada. Belgrano de Córdoba está clasificado como Campeón del Apertura; los campeones de cada copa permanecen por definir.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('copas_nacionales')}
            className="px-3.5 py-1.5 rounded-xl bg-[#181C22] hover:bg-[#22272E] text-xs font-semibold text-[#F1EDE6] hover:text-[#DCA842] transition-colors border border-white/[0.08] flex items-center gap-1.5 shadow-sm"
          >
            <span>Ver diagrama de clasificación</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#DCA842]" />
          </button>
        </div>
      </div>

      {/* Grid de las 3 Copas Nacionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cupsList.map((cup, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[#121519] border border-white/[0.08] hover:border-[#DCA842]/30 transition-all flex flex-col justify-between group shadow-sm"
          >
            <div>
              {/* Header de la Copa */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#DCA842]/10 border border-[#DCA842]/20 flex items-center justify-center shrink-0">
                    <Trophy className="w-3.5 h-3.5 text-[#DCA842]" />
                  </div>
                  <div>
                    <h3 className="font-editorial font-bold text-sm text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors leading-tight">
                      {cup.title}
                    </h3>
                    <span className="text-[10px] text-[#8B949E]">Edición {cup.season}</span>
                  </div>
                </div>

                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.04] text-[#8B949E] border border-white/[0.08] shrink-0">
                  {cup.statusBadge}
                </span>
              </div>

              {/* Los dos contendientes de la final */}
              <div className="py-4 space-y-3">
                {/* Equipo 1 */}
                <div
                  onClick={() => cup.slot1.teamId && onSelectClub && onSelectClub(cup.slot1.teamId)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    cup.slot1.confirmed
                      ? 'bg-[#182338]/70 border-[#DCA842]/30 cursor-pointer hover:bg-[#182338]'
                      : 'bg-[#181C22]/80 border border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {cup.slot1.logo ? (
                      <TeamBadge logoUrl={cup.slot1.logo} teamId={cup.slot1.teamId} size="xs" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 text-[#8B949E]" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className={`text-xs font-bold truncate ${cup.slot1.confirmed ? 'text-[#F1EDE6]' : 'text-[#8B949E]'}`}>
                        {cup.slot1.teamName}
                      </h4>
                      <span className="text-[10px] text-[#8B949E] font-medium block truncate">
                        {cup.slot1.criterion}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                    cup.slot1.confirmed
                      ? 'bg-[#30A46C]/15 text-[#30A46C] border border-[#30A46C]/30'
                      : 'bg-white/[0.04] text-[#8B949E]'
                  }`}>
                    {cup.slot1.status}
                  </span>
                </div>

                {/* Separador VS */}
                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-white/[0.06]" />
                  <span className="absolute px-2 bg-[#121519] text-[9px] font-black uppercase text-[#8B949E] tracking-widest">
                    VS
                  </span>
                </div>

                {/* Equipo 2 */}
                <div
                  onClick={() => cup.slot2.teamId && onSelectClub && onSelectClub(cup.slot2.teamId)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    cup.slot2.confirmed
                      ? 'bg-[#182338]/70 border-[#DCA842]/30 cursor-pointer hover:bg-[#182338]'
                      : 'bg-[#181C22]/80 border border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {cup.slot2.logo ? (
                      <TeamBadge logoUrl={cup.slot2.logo} teamId={cup.slot2.teamId} size="xs" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 text-[#8B949E]" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className={`text-xs font-bold truncate ${cup.slot2.confirmed ? 'text-[#F1EDE6]' : 'text-[#8B949E]'}`}>
                        {cup.slot2.teamName}
                      </h4>
                      <span className="text-[10px] text-[#8B949E] font-medium block truncate">
                        {cup.slot2.criterion}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                    cup.slot2.confirmed
                      ? 'bg-[#30A46C]/15 text-[#30A46C] border border-[#30A46C]/30'
                      : 'bg-white/[0.04] text-[#8B949E]'
                  }`}>
                    {cup.slot2.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer de la Card: Fecha y Sede */}
            <div className="pt-3 border-t border-white/[0.06] space-y-1.5 text-[10px] text-[#8B949E]">
              <div className="flex items-center gap-1.5 truncate">
                <Calendar className="w-3 h-3 text-[#DCA842] shrink-0" />
                <span className="truncate">{cup.date}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3 h-3 text-[#8B949E] shrink-0" />
                <span className="truncate">{cup.venue}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
