import React, { useState } from 'react';
import { Match, MatchEvent } from '../../types/football';
import { TeamBadge } from '../common/TeamBadge';
import { StatusIndicator } from '../common/StatusIndicator';
import { StatBar } from '../common/StatBar';
import { TabNav } from '../common/TabNav';
import { ArrowLeft, MapPin, User, Calendar, ShieldAlert } from 'lucide-react';

interface MatchDetailViewProps {
  match: Match;
  onBack: () => void;
  onSelectTeam?: (teamId: string) => void;
}

type MatchTab = 'eventos' | 'estadisticas' | 'alineaciones' | 'info';

export const MatchDetailView: React.FC<MatchDetailViewProps> = ({
  match,
  onBack,
  onSelectTeam,
}) => {
  const [activeTab, setActiveTab] = useState<MatchTab>('eventos');

  const homeTeam = match.homeTeam;
  const awayTeam = match.awayTeam;

  const homeName = homeTeam?.name || homeTeam?.shortName || match.homeTeamId;
  const awayName = awayTeam?.name || awayTeam?.shortName || match.awayTeamId;

  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  const tabs = [
    { id: 'eventos' as const, label: 'Cronología' },
    { id: 'estadisticas' as const, label: 'Estadísticas' },
    { id: 'alineaciones' as const, label: 'Alineaciones' },
    { id: 'info' as const, label: 'Ficha Técnica' },
  ];

  const renderEventIcon = (event: MatchEvent) => {
    switch (event.type) {
      case 'goal':
      case 'penalty_goal':
        return (
          <span className="w-5 h-5 rounded-full bg-[#181C22] border border-[#22272E] flex items-center justify-center text-xs shrink-0" title="Gol">
            ⚽
          </span>
        );
      case 'yellow_card':
        return (
          <span className="inline-block w-2.5 h-3.5 bg-amber-400 rounded-xs shadow-xs shrink-0" title="Tarjeta Amarilla" />
        );
      case 'red_card':
        return (
          <span className="inline-block w-2.5 h-3.5 bg-[#E5484D] rounded-xs shadow-xs shrink-0" title="Tarjeta Roja" />
        );
      case 'sub':
        return (
          <span className="w-5 h-5 rounded-full bg-[#181C22] border border-[#22272E] flex items-center justify-center text-[10px] text-[#8B949E] font-bold shrink-0">
            ⇄
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top action navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#8B949E] hover:text-[#DCA842] transition-colors py-1.5 focus:outline-hidden"
        >
          <ArrowLeft className="w-4 h-4 text-[#DCA842]" />
          <span>Volver al fixture</span>
        </button>

        <span className="text-xs text-[#8B949E] font-num">
          ID Oficial: {match.id}
        </span>
      </div>

      {/* Hero Match Board */}
      <div className="rounded-3xl bg-[#121519] border border-[#22272E] p-6 md:p-10 shadow-xl relative overflow-hidden">
        {isLive && (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#30A46C]" />
        )}

        {/* Tournament & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#8B949E] border-b border-[#22272E] pb-4 mb-6">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold uppercase tracking-wider text-[#F1EDE6]">{match.tournament}</span>
            <span className="text-[#3A424D]">/</span>
            <span>{match.round}</span>
          </div>

          <StatusIndicator status={match.status} minute={match.minute} time={match.time} />
        </div>

        {/* Central Clash Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-6 py-4">
          {/* Home team */}
          <div
            onClick={() => onSelectTeam && onSelectTeam(match.homeTeamId)}
            className="md:col-span-3 flex flex-col items-center md:items-end text-center md:text-right cursor-pointer group"
          >
            <div className="flex md:flex-row flex-col-reverse items-center gap-4">
              <div>
                <span className="block font-editorial font-extrabold text-2xl md:text-3xl text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors leading-tight">
                  {homeName}
                </span>
                <span className="text-xs text-[#8B949E] uppercase font-bold tracking-widest mt-1 block">
                  Local
                </span>
              </div>
              <TeamBadge
                teamId={match.homeTeamId}
                team={homeTeam}
                logoUrl={homeTeam?.logo}
                size="xl"
                className="transition-transform group-hover:scale-105"
              />
            </div>
          </div>

          {/* Scoreboard display */}
          <div className="md:col-span-1 flex flex-col items-center justify-center my-2">
            {isLive || isFinished ? (
              <div className="flex items-baseline justify-center gap-3 font-num font-black text-5xl md:text-7xl text-[#F1EDE6] tabular-nums tracking-tighter">
                <span className={isLive && match.homeScore !== null && match.homeScore > (match.awayScore ?? 0) ? 'text-[#30A46C]' : ''}>
                  {match.homeScore ?? 0}
                </span>
                <span className="text-[#3A424D] text-3xl font-light select-none">—</span>
                <span className={isLive && match.awayScore !== null && match.awayScore > (match.homeScore ?? 0) ? 'text-[#30A46C]' : ''}>
                  {match.awayScore ?? 0}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="font-num text-3xl md:text-4xl font-bold text-[#F1EDE6] px-4 py-2 rounded-xl bg-[#181C22] border border-[#22272E]">
                  {match.time || '--:--'}
                </span>
                <span className="text-xs text-[#8B949E] mt-2 font-medium">
                  {match.date}
                </span>
              </div>
            )}
          </div>

          {/* Away team */}
          <div
            onClick={() => onSelectTeam && onSelectTeam(match.awayTeamId)}
            className="md:col-span-3 flex flex-col items-center md:items-start text-center md:text-left cursor-pointer group"
          >
            <div className="flex md:flex-row flex-col items-center gap-4">
              <TeamBadge
                teamId={match.awayTeamId}
                team={awayTeam}
                logoUrl={awayTeam?.logo}
                size="xl"
                className="transition-transform group-hover:scale-105"
              />
              <div>
                <span className="block font-editorial font-extrabold text-2xl md:text-3xl text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors leading-tight">
                  {awayName}
                </span>
                <span className="text-xs text-[#8B949E] uppercase font-bold tracking-widest mt-1 block">
                  Visitante
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stadium & Meta Footer */}
        <div className="mt-8 pt-5 border-t border-[#22272E] flex flex-wrap items-center justify-between gap-4 text-xs text-[#8B949E]">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#DCA842]" />
            <span className="font-medium text-[#F1EDE6]">{match.stadium || 'Estadio Oficial de la Asociación del Fútbol Argentino'}</span>
          </div>

          {match.referee && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#DCA842]" />
              <span>Árbitro: <strong className="text-[#F1EDE6]">{match.referee}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-1 scrollbar-none">
        <TabNav
          tabs={tabs}
          activeTab={activeTab}
          onChange={(t) => setActiveTab(t as MatchTab)}
        />
      </div>

      {/* Tab: Eventos / Cronología */}
      {activeTab === 'eventos' && (
        <div className="bg-[#121519] border border-[#22272E] rounded-3xl p-6 md:p-8">
          <h3 className="font-editorial font-bold text-lg text-[#F1EDE6] mb-6">
            Línea de Tiempo del Encuentro
          </h3>

          {match.events && match.events.length > 0 ? (
            <div className="relative border-l border-[#22272E] ml-4 md:ml-6 space-y-6 my-2 pl-6">
              {match.events.map((evt) => {
                const isHome = evt.teamId === match.homeTeamId;
                const team = isHome ? homeTeam : awayTeam;

                return (
                  <div key={evt.id} className="relative flex items-start justify-between group">
                    {/* Minute marker */}
                    <div className="absolute -left-[35px] md:-left-[43px] top-0 flex items-center justify-center w-7 h-7 rounded-full bg-[#181C22] border border-[#2E353F] text-xs font-num font-bold text-[#F1EDE6]">
                      {evt.minute}'
                    </div>

                    <div className="min-w-0 pl-2">
                      <div className="flex items-center gap-2.5">
                        {renderEventIcon(evt)}
                        <span className="text-sm font-bold text-[#F1EDE6] tracking-tight">
                          {evt.player}
                        </span>
                      </div>
                      <div className="text-xs text-[#8B949E] mt-1 pl-7">
                        {evt.type === 'goal' && evt.assistOrSubOut && (
                          <span>Pase gol: <strong className="text-[#F1EDE6]">{evt.assistOrSubOut}</strong></span>
                        )}
                        {evt.type === 'sub' && evt.assistOrSubOut && (
                          <span>Reemplaza a: <strong className="text-[#F1EDE6]">{evt.assistOrSubOut}</strong></span>
                        )}
                        {evt.type === 'yellow_card' && <span>Amonestación</span>}
                        {evt.type === 'red_card' && <span className="text-[#E5484D] font-semibold">Expulsión directa</span>}
                      </div>
                    </div>

                    <div className="text-xs font-medium text-[#8B949E] shrink-0 uppercase tracking-wider">
                      {team?.shortName || evt.teamId}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-[#8B949E] py-8 text-center space-y-1">
              <p className="font-semibold text-[#F1EDE6]">Sin incidencias registradas</p>
              <p>Las incidencias oficiales se reportan durante y al finalizar el encuentro.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Estadísticas */}
      {activeTab === 'estadisticas' && (
        <div className="bg-[#121519] border border-[#22272E] rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-[#22272E] mb-4 text-xs font-bold text-[#8B949E]">
            <span className="text-[#F1EDE6] text-sm uppercase">{homeName}</span>
            <span className="uppercase tracking-widest text-[#DCA842]">Métricas Oficiales</span>
            <span className="text-[#F1EDE6] text-sm uppercase">{awayName}</span>
          </div>

          {match.stats ? (
            <div className="divide-y divide-[#22272E]">
              <StatBar
                label="Posesión de Balón"
                homeValue={match.stats.possession[0]}
                awayValue={match.stats.possession[1]}
                isPercentage
              />
              <StatBar
                label="Remates Totales"
                homeValue={match.stats.shots[0]}
                awayValue={match.stats.shots[1]}
              />
              <StatBar
                label="Tiros al Arco"
                homeValue={match.stats.shotsOnTarget[0]}
                awayValue={match.stats.shotsOnTarget[1]}
              />
              <StatBar
                label="Tiros de Esquina"
                homeValue={match.stats.corners[0]}
                awayValue={match.stats.corners[1]}
              />
              <StatBar
                label="Faltas Cometidas"
                homeValue={match.stats.fouls[0]}
                awayValue={match.stats.fouls[1]}
              />
              <StatBar
                label="Tarjetas Amarillas"
                homeValue={match.stats.yellowCards[0]}
                awayValue={match.stats.yellowCards[1]}
              />
              <StatBar
                label="Tarjetas Rojas"
                homeValue={match.stats.redCards[0]}
                awayValue={match.stats.redCards[1]}
              />
              <StatBar
                label="Fueras de Juego"
                homeValue={match.stats.offsides[0]}
                awayValue={match.stats.offsides[1]}
              />
            </div>
          ) : (
            <div className="text-xs text-[#8B949E] py-8 text-center space-y-1">
              <p className="font-semibold text-[#F1EDE6]">Estadísticas detalladas no disponibles</p>
              <p>Las métricas en tiempo real se habilitan para partidos con cobertura técnica oficial.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Alineaciones */}
      {activeTab === 'alineaciones' && (
        <div className="bg-[#121519] border border-[#22272E] rounded-3xl p-6 md:p-8">
          {match.lineups ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Home Lineup */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#22272E]">
                  <div className="flex items-center gap-2">
                    <TeamBadge teamId={match.homeTeamId} team={homeTeam} logoUrl={homeTeam?.logo} size="xs" />
                    <h4 className="font-editorial font-bold text-[#F1EDE6]">{homeName}</h4>
                  </div>
                  <span className="text-xs font-num font-bold text-[#DCA842]">
                    {match.lineups.home.formation}
                  </span>
                </div>
                <div className="text-xs text-[#8B949E] mb-2">
                  DT: <strong className="text-[#F1EDE6]">{match.lineups.home.coach}</strong>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider block">Titulares</span>
                  {match.lineups.home.starters.map((p) => (
                    <div key={p.number} className="flex items-center justify-between text-xs py-1 border-b border-[#22272E]/40">
                      <div className="flex items-center gap-2">
                        <span className="font-num text-[#DCA842] font-bold w-5">{p.number}</span>
                        <span className="text-[#F1EDE6] font-medium">{p.name}</span>
                        {p.isCaptain && <span className="text-[10px] px-1 bg-[#DCA842]/20 text-[#DCA842] rounded-xs font-bold">C</span>}
                      </div>
                      <span className="text-[#8B949E] font-num text-[11px]">{p.position}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Away Lineup */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#22272E]">
                  <div className="flex items-center gap-2">
                    <TeamBadge teamId={match.awayTeamId} team={awayTeam} logoUrl={awayTeam?.logo} size="xs" />
                    <h4 className="font-editorial font-bold text-[#F1EDE6]">{awayName}</h4>
                  </div>
                  <span className="text-xs font-num font-bold text-[#DCA842]">
                    {match.lineups.away.formation}
                  </span>
                </div>
                <div className="text-xs text-[#8B949E] mb-2">
                  DT: <strong className="text-[#F1EDE6]">{match.lineups.away.coach}</strong>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider block">Titulares</span>
                  {match.lineups.away.starters.map((p) => (
                    <div key={p.number} className="flex items-center justify-between text-xs py-1 border-b border-[#22272E]/40">
                      <div className="flex items-center gap-2">
                        <span className="font-num text-[#DCA842] font-bold w-5">{p.number}</span>
                        <span className="text-[#F1EDE6] font-medium">{p.name}</span>
                        {p.isCaptain && <span className="text-[10px] px-1 bg-[#DCA842]/20 text-[#DCA842] rounded-xs font-bold">C</span>}
                      </div>
                      <span className="text-[#8B949E] font-num text-[11px]">{p.position}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#8B949E] py-8 text-center space-y-1">
              <p className="font-semibold text-[#F1EDE6]">Alineaciones no disponibles</p>
              <p>Las formaciones oficiales se confirman habitualmente 60 minutos antes del inicio del partido.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Ficha Técnica */}
      {activeTab === 'info' && (
        <div className="bg-[#121519] border border-[#22272E] rounded-3xl p-6 md:p-8 space-y-6">
          <h3 className="font-editorial font-bold text-lg text-[#F1EDE6]">
            Información Oficial del Partido
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E]">
              <span className="text-[#8B949E] block mb-1">Torneo</span>
              <span className="text-sm font-bold text-[#F1EDE6]">{match.tournament}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E]">
              <span className="text-[#8B949E] block mb-1">Jornada</span>
              <span className="text-sm font-bold text-[#F1EDE6]">{match.round}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E]">
              <span className="text-[#8B949E] block mb-1">Fecha y Horario</span>
              <span className="text-sm font-bold text-[#F1EDE6]">{match.date} · {match.time} hs</span>
            </div>
            <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E]">
              <span className="text-[#8B949E] block mb-1">Estadio</span>
              <span className="text-sm font-bold text-[#F1EDE6]">{match.stadium || 'Estadio Oficial AFA'}</span>
            </div>
            {match.referee && (
              <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E] md:col-span-2">
                <span className="text-[#8B949E] block mb-1">Cuerpo Arbitral</span>
                <span className="text-sm font-bold text-[#F1EDE6]">{match.referee}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
