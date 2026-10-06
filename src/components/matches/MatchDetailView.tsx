import React, { useState } from 'react';
import { Match, MatchEvent } from '../../types/football';
import { TeamBadge } from '../common/TeamBadge';
import { StatusIndicator } from '../common/StatusIndicator';
import { StatBar } from '../common/StatBar';
import { TabNav } from '../common/TabNav';
import { ArrowLeft, MapPin, User, Calendar, ShieldAlert } from 'lucide-react';
import { formatMatchTime, formatMatchDate, formatTextValue, formatMatchMinute } from '../../utils/formatters';
import { SinDatoBadge } from '../common/SinDatoBadge';
import { translateEventText } from '../../utils/argentineCommentary';

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
    { id: 'eventos' as const, label: 'Minuto a Minuto' },
    { id: 'estadisticas' as const, label: 'Estadísticas' },
    { id: 'alineaciones' as const, label: 'Alineaciones' },
    { id: 'info' as const, label: 'Ficha Oficial' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12 max-w-5xl mx-auto px-1 sm:px-0">
      {/* Top action navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#8B949E] hover:text-[#DCA842] transition-colors py-1.5 focus:outline-hidden"
        >
          <ArrowLeft className="w-4 h-4 text-[#DCA842]" />
          <span>Volver al fixture</span>
        </button>

        <span className="text-[11px] text-[#8B949E] font-num">
          ID: {match.id}
        </span>
      </div>

      {/* Hero Match Board - Responsive & Compact Horizontal Layout for Mobile & Desktop */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#121519] border border-[#22272E] p-3.5 sm:p-6 md:p-8 shadow-xl relative overflow-hidden">
        {isLive && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#10B981] animate-pulse" />
        )}

        {/* Tournament & Status */}
        <div className="flex items-center justify-between gap-2 text-xs text-[#8B949E] border-b border-[#22272E] pb-2.5 mb-3 sm:pb-3 sm:mb-5">
          <div className="flex items-center gap-1.5 font-medium truncate max-w-[200px] sm:max-w-none">
            <span className="font-bold uppercase tracking-wider text-[#F1EDE6] text-[10px] sm:text-[11px] truncate">{match.tournament}</span>
            <span className="text-[#3A424D]">/</span>
            <span className="text-[10px] sm:text-[11px] text-[#DCA842] truncate">{match.round}</span>
          </div>

          <StatusIndicator
            status={match.status}
            minute={match.minute}
            time={match.time}
            date={match.date}
            timestamp={match.timestamp}
          />
        </div>

        {/* Central Clash Grid - True Horizontal Scoreboard on Mobile (Team 1  Score - Score  Team 2) */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-6 py-1 sm:py-2">
          {/* Home team */}
          <div
            onClick={() => onSelectTeam && onSelectTeam(match.homeTeamId)}
            className="flex-1 flex items-center justify-end gap-2 sm:gap-3 cursor-pointer group min-w-0"
          >
            <div className="text-right min-w-0">
              <span className="block font-editorial font-bold text-xs sm:text-xl md:text-2xl text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors leading-tight truncate">
                {homeName}
              </span>
              <span className="text-[9px] sm:text-[10px] text-[#8B949E] uppercase font-bold tracking-widest block">
                Local
              </span>
            </div>
            <TeamBadge
              teamId={match.homeTeamId}
              team={homeTeam}
              logoUrl={homeTeam?.logo}
              size="md"
              className="transition-transform group-hover:scale-105 shrink-0"
            />
          </div>

          {/* Scoreboard display */}
          <div className="shrink-0 flex flex-col items-center justify-center px-1 sm:px-3">
            {isLive || isFinished ? (
              <div className="flex items-baseline justify-center gap-1.5 sm:gap-3 font-num font-black text-xl sm:text-4xl md:text-5xl text-[#F1EDE6] tabular-nums tracking-tight bg-[#181C22] px-3 sm:px-5 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl border border-white/[0.08]">
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
                <span className="text-[#8B949E] text-sm sm:text-2xl font-light select-none">—</span>
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
                <span className="font-num text-xs sm:text-2xl font-bold text-[#F1EDE6] px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-xl bg-[#181C22] border border-[#22272E]">
                  {formatMatchTime(match.time, match.date, match.timestamp)}
                </span>
                <span className="text-[9px] sm:text-[11px] text-[#8B949E] mt-0.5 font-medium">
                  {formatMatchDate(match.date, match.timestamp)}
                </span>
              </div>
            )}
          </div>

          {/* Away team */}
          <div
            onClick={() => onSelectTeam && onSelectTeam(match.awayTeamId)}
            className="flex-1 flex items-center justify-start gap-2 sm:gap-3 cursor-pointer group min-w-0"
          >
            <TeamBadge
              teamId={match.awayTeamId}
              team={awayTeam}
              logoUrl={awayTeam?.logo}
              size="md"
              className="transition-transform group-hover:scale-105 shrink-0"
            />
            <div className="text-left min-w-0">
              <span className="block font-editorial font-bold text-xs sm:text-xl md:text-2xl text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors leading-tight truncate">
                {awayName}
              </span>
              <span className="text-[9px] sm:text-[10px] text-[#8B949E] uppercase font-bold tracking-widest block">
                Visitante
              </span>
            </div>
          </div>
        </div>

        {/* Stadium & Referee Bar */}
        <div className="mt-3 sm:mt-5 pt-2 sm:pt-3 border-t border-[#22272E] flex flex-row items-center justify-between gap-2 text-[10px] sm:text-xs text-[#8B949E]">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3 h-3 text-[#DCA842] shrink-0" />
            <span className="truncate">Estadio: <strong className="text-[#F1EDE6]">{formatTextValue(match.stadium)}</strong></span>
          </div>
          {match.referee && (
            <div className="flex items-center gap-1.5 truncate">
              <User className="w-3 h-3 text-[#DCA842] shrink-0" />
              <span className="truncate">Árbitro: <strong className="text-[#F1EDE6]">{formatTextValue(match.referee)}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation tabs - Scrollable on mobile */}
      <div className="flex justify-start overflow-x-auto scrollbar-none pb-1">
        <TabNav tabs={tabs} activeTab={activeTab} onChange={(t) => setActiveTab(t as MatchTab)} />
      </div>

      {/* Tab: Minuto a Minuto (En Español) */}
      {activeTab === 'eventos' && (
        <div className="bg-[#121519] border border-[#22272E] rounded-3xl p-5 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#DCA842] block mb-0.5">
                Transmisión Oficial
              </span>
              <h3 className="font-editorial font-bold text-lg text-[#F1EDE6]">
                Relato Minuto a Minuto en Español
              </h3>
            </div>
            <span className="text-[11px] text-[#8B949E]">
              {match.events?.length || 0} incidencias registradas
            </span>
          </div>

          {match.events && match.events.length > 0 ? (
            <div className="relative border-l-2 border-[#22272E] ml-4 sm:ml-8 space-y-5 pl-5 sm:pl-6 py-2">
              {match.events.map((event) => {
                const isHome = event.teamId === match.homeTeamId;
                const translated = translateEventText(event.player || '', event.type);
                const teamLabel = isHome ? homeName : awayName;

                return (
                  <div key={event.id} className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-2 group">
                    {/* Minute Node */}
                    <span className="absolute -left-[33px] sm:-left-[35px] font-num font-bold text-[#DCA842] text-xs bg-[#121519] py-0.5 px-1.5 rounded-md border border-[#22272E] shadow-xs">
                      {formatMatchMinute(event.minute)}
                    </span>

                    {/* Event Content in Argentine Spanish */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{translated.icon}</span>
                        <span className={`font-bold text-xs uppercase tracking-wide ${translated.colorClass}`}>
                          {translated.title}
                        </span>
                        {teamLabel && (
                          <span className="text-[10px] text-[#8B949E] font-medium">
                            ({teamLabel})
                          </span>
                        )}
                      </div>
                      {translated.detail && translated.detail.toLowerCase() !== 'incidencia' && translated.detail !== translated.title && (
                        <p className="text-xs text-[#F1EDE6]/90 leading-relaxed font-medium">
                          {translated.detail}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-[#8B949E] py-8 text-center space-y-3">
              <SinDatoBadge inline label="SIN INCIDENCIAS" />
              <p className="font-semibold text-[#F1EDE6]">No hay incidencias detalladas registradas en el feed</p>
              <p className="max-w-md mx-auto">
                Los goles, tarjetas, cambios y jugadas destacadas se actualizan automáticamente durante el desarrollo del encuentro.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Estadísticas */}
      {activeTab === 'estadisticas' && (
        <div className="bg-[#121519] border border-[#22272E] rounded-3xl p-5 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h3 className="font-editorial font-bold text-lg text-[#F1EDE6]">
              Estadísticas Comparativas
            </h3>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-[#DCA842]">{homeName}</span>
              <span className="text-[#8B949E]">vs</span>
              <span className="text-[#F1EDE6]">{awayName}</span>
            </div>
          </div>

          {match.stats ? (
            <div className="space-y-5 max-w-xl mx-auto pt-2">
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
                label="Posiciones Adelantadas (Offsides)"
                homeValue={match.stats.offsides[0]}
                awayValue={match.stats.offsides[1]}
              />
            </div>
          ) : (
            <div className="text-xs text-[#8B949E] py-8 text-center space-y-3">
              <SinDatoBadge inline label="SIN DATO" />
              <p className="font-semibold text-[#F1EDE6]">Estadísticas avanzadas no disponibles en la fuente oficial</p>
              <p className="max-w-md mx-auto">
                Las métricas de posesión, remates y faltas se computan al cierre de la planilla oficial de AFA / ESPN.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Alineaciones */}
      {activeTab === 'alineaciones' && (
        <div className="bg-[#121519] border border-[#22272E] rounded-3xl p-5 sm:p-8">
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
                  Director Técnico: <strong className="text-[#F1EDE6]">{match.lineups.home.coach}</strong>
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
                  Director Técnico: <strong className="text-[#F1EDE6]">{match.lineups.away.coach}</strong>
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

      {/* Tab: Ficha Oficial */}
      {activeTab === 'info' && (
        <div className="bg-[#121519] border border-[#22272E] rounded-3xl p-5 sm:p-8 space-y-6">
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
                {formatMatchDate(match.date, match.timestamp)} · {formatMatchTime(match.time, match.date, match.timestamp)}
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
