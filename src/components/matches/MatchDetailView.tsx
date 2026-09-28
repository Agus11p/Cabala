import React, { useState } from 'react';
import { Match, MatchEvent } from '../../types/football';
import { TeamBadge } from '../common/TeamBadge';
import { StatusIndicator } from '../common/StatusIndicator';
import { StatBar } from '../common/StatBar';
import { TabNav } from '../common/TabNav';
import { ArrowLeft, MapPin, User, Calendar, ShieldAlert } from 'lucide-react';
import { formatMatchTime, formatTextValue } from '../../utils/formatters';
import { SinDatoBadge } from '../common/SinDatoBadge';

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

  const homeScoreDisplay =
    match.homeScore !== null && match.homeScore !== undefined
      ? match.homeScore
      : isLive || isFinished
      ? 'SIN DATO'
      : null;

  const awayScoreDisplay =
    match.awayScore !== null && match.awayScore !== undefined
      ? match.awayScore
      : isLive || isFinished
      ? 'SIN DATO'
      : null;

  const tabs = [
    { id: 'eventos' as const, label: 'Cronología' },
    { id: 'estadisticas' as const, label: 'Estadísticas' },
    { id: 'alineaciones' as const, label: 'Alineaciones' },
    { id: 'info' as const, label: 'Ficha Técnica' },
  ];

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
          ID: {match.id}
        </span>
      </div>

      {/* Hero Match Board */}
      <div className="rounded-3xl bg-[#121519] border border-[#22272E] p-6 md:p-10 shadow-xl relative overflow-hidden">
        {isLive && (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#10B981]" />
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
                <span
                  className={
                    isLive &&
                    match.homeScore !== null &&
                    match.awayScore !== null &&
                    match.homeScore > match.awayScore
                      ? 'text-[#10B981]'
                      : ''
                  }
                >
                  {homeScoreDisplay}
                </span>
                <span className="text-[#3A424D] text-3xl font-light select-none">—</span>
                <span
                  className={
                    isLive &&
                    match.homeScore !== null &&
                    match.awayScore !== null &&
                    match.awayScore > match.homeScore
                      ? 'text-[#10B981]'
                      : ''
                  }
                >
                  {awayScoreDisplay}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="font-num text-3xl md:text-4xl font-bold text-[#F1EDE6] px-4 py-2 rounded-xl bg-[#181C22] border border-[#22272E]">
                  {formatMatchTime(match.time)}
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

        {/* Stadium & Referee Bar */}
        <div className="mt-8 pt-4 border-t border-[#22272E] flex flex-wrap items-center justify-between gap-4 text-xs text-[#8B949E]">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#DCA842]" />
            <span>Estadio: <strong className="text-[#F1EDE6]">{formatTextValue(match.stadium)}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-[#DCA842]" />
            <span>Árbitro: <strong className="text-[#F1EDE6]">{formatTextValue(match.referee)}</strong></span>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex justify-start">
        <TabNav tabs={tabs} activeTab={activeTab} onChange={(t) => setActiveTab(t as MatchTab)} />
      </div>

      {/* Tab: Cronología */}
      {activeTab === 'eventos' && (
        <div className="bg-[#121519] border border-[#22272E] rounded-3xl p-6 md:p-8 space-y-6">
          <h3 className="font-editorial font-bold text-lg text-[#F1EDE6]">
            Incidencias y Cronología
          </h3>

          {match.events && match.events.length > 0 ? (
            <div className="relative border-l-2 border-[#22272E] ml-4 md:ml-32 space-y-6 pl-6 py-2">
              {match.events.map((event) => {
                const isHome = event.teamId === match.homeTeamId;
                return (
                  <div key={event.id} className="relative flex items-center justify-between text-xs">
                    <span className="absolute -left-[35px] font-num font-bold text-[#DCA842] text-xs bg-[#121519] py-0.5 px-1 rounded-sm border border-[#22272E]">
                      {event.minute}'
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-[#F1EDE6]">{event.player}</span>
                      <span className="text-[#8B949E]">({isHome ? homeName : awayName})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-[#8B949E] py-8 text-center space-y-3">
              <SinDatoBadge inline label="SIN DATO" />
              <p className="font-semibold text-[#F1EDE6]">Sin incidencias registradas en la transmisión oficial</p>
              <p>Las acciones de gol, sustituciones y tarjetas se registran automáticamente durante el juego.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Estadísticas */}
      {activeTab === 'estadisticas' && (
        <div className="bg-[#121519] border border-[#22272E] rounded-3xl p-6 md:p-8 space-y-6">
          <h3 className="font-editorial font-bold text-lg text-[#F1EDE6]">
            Estadísticas Comparativas
          </h3>

          {match.stats ? (
            <div className="space-y-5 max-w-xl mx-auto">
              <StatBar
                label="Posesión de Balón"
                homeValue={match.stats.possession[0]}
                awayValue={match.stats.possession[1]}
                isPercentage
              />
              <StatBar
                label="Tiros Totales"
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
            <div className="text-xs text-[#8B949E] py-8 text-center space-y-3">
              <SinDatoBadge inline label="SIN DATO" />
              <p className="font-semibold text-[#F1EDE6]">Estadísticas detalladas no disponibles en el feed de datos</p>
              <p>Las métricas avanzadas (posesión, tiros, faltas) se habilitan cuando el proveedor computa la planilla oficial.</p>
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
            <div className="text-xs text-[#8B949E] py-8 text-center space-y-3">
              <SinDatoBadge inline label="SIN DATO" />
              <p className="font-semibold text-[#F1EDE6]">Alineaciones no informadas en el proveedor</p>
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
              <span className="text-sm font-bold text-[#F1EDE6]">
                {match.date} · {formatMatchTime(match.time)} hs
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E]">
              <span className="text-[#8B949E] block mb-1">Estadio</span>
              <span className="text-sm font-bold text-[#F1EDE6]">
                {formatTextValue(match.stadium)}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E] md:col-span-2">
              <span className="text-[#8B949E] block mb-1">Cuerpo Arbitral</span>
              <span className="text-sm font-bold text-[#F1EDE6]">
                {formatTextValue(match.referee)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
