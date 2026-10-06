import React from 'react';
import { Match } from '../../types/football';
import { TeamBadge } from '../common/TeamBadge';
import { StatusIndicator } from '../common/StatusIndicator';
import { formatMatchTime, formatMatchDate, formatTextValue } from '../../utils/formatters';

interface MatchCardProps {
  match: Match;
  onClick?: (matchId: string) => void;
  featured?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onClick,
  featured = false,
}) => {
  const homeTeam = match.homeTeam;
  const awayTeam = match.awayTeam;

  const homeName = homeTeam?.shortName || homeTeam?.name || match.homeTeamId;
  const awayName = awayTeam?.shortName || awayTeam?.name || match.awayTeamId;

  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  const handleClick = () => {
    if (onClick) onClick(match.id);
  };

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

  // FEATURED MATCH HERO CARD (TRUE HORIZONTAL SCOREBOARD ON MOBILE & DESKTOP)
  if (featured) {
    return (
      <div
        onClick={handleClick}
        className={`relative overflow-hidden rounded-2xl bg-[#121519] border transition-all duration-200 cursor-pointer group ${
          isLive
            ? 'border-[#10B981]/50 shadow-md shadow-[#10B981]/5'
            : 'border-white/[0.08] hover:border-[#DCA842]/40 hover:bg-[#15191F]'
        } p-3.5 sm:p-6`}
      >
        {isLive && (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#10B981]" />
        )}

        {/* Top Header: Tournament, round & status */}
        <div className="flex items-center justify-between text-xs text-[#8B949E] mb-2.5 sm:mb-4 border-b border-white/[0.06] pb-2 sm:pb-3">
          <div className="flex items-center gap-1.5 sm:gap-2 tracking-wide font-medium truncate max-w-[200px] sm:max-w-none">
            <span className="font-bold text-[#F1EDE6] uppercase tracking-wider text-[10px] sm:text-[11px] truncate">
              {match.tournament || 'Liga Profesional'}
            </span>
            <span aria-hidden="true" className="text-white/20">/</span>
            <span className="text-[#8B949E] text-[10px] sm:text-xs truncate">
              {match.round || 'Fecha Oficial'} · {formatMatchDate(match.date, match.timestamp)}
            </span>
          </div>
          <StatusIndicator
            status={match.status}
            minute={match.minute}
            time={match.time}
            date={match.date}
            timestamp={match.timestamp}
          />
        </div>

        {/* Teams & Scoreboard Grid - Horizontal on Mobile */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-6 my-1 sm:my-3">
          {/* Home team */}
          <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3 min-w-0 text-right">
            <div className="min-w-0">
              <span className="block font-editorial font-bold text-xs sm:text-xl text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors leading-tight truncate">
                {homeName}
              </span>
              <span className="text-[9px] sm:text-[10px] text-[#8B949E] font-medium tracking-wider uppercase mt-0.5 block">
                Local
              </span>
            </div>
            <TeamBadge
              teamId={match.homeTeamId}
              team={homeTeam}
              logoUrl={homeTeam?.logo}
              size="md"
              className="shrink-0"
            />
          </div>

          {/* Central Score / Time Display */}
          <div className="shrink-0 flex flex-col items-center justify-center px-1 sm:px-3">
            {isLive || isFinished ? (
              <div className="flex items-baseline justify-center gap-1.5 sm:gap-2.5 font-num font-black text-xl sm:text-4xl text-[#F1EDE6] tabular-nums tracking-tight bg-[#181C22] px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl border border-white/[0.08]">
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
                <span className="text-white/20 text-sm sm:text-2xl font-light select-none">—</span>
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
              <div className="flex flex-col items-center justify-center">
                <span className="font-num text-xs sm:text-2xl font-bold text-[#F1EDE6] px-2.5 sm:px-3 py-1 rounded-xl bg-[#181C22] border border-white/[0.08]">
                  {formatMatchTime(match.time, match.date, match.timestamp)}
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#8B949E] mt-0.5 font-medium tracking-wide">
                  {formatMatchDate(match.date, match.timestamp)}
                </span>
              </div>
            )}
          </div>

          {/* Away team */}
          <div className="flex-1 flex items-center justify-start gap-2 sm:gap-3 min-w-0 text-left">
            <TeamBadge
              teamId={match.awayTeamId}
              team={awayTeam}
              logoUrl={awayTeam?.logo}
              size="md"
              className="shrink-0"
            />
            <div className="min-w-0">
              <span className="block font-editorial font-bold text-xs sm:text-xl text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors leading-tight truncate">
                {awayName}
              </span>
              <span className="text-[9px] sm:text-[10px] text-[#8B949E] font-medium tracking-wider uppercase mt-0.5 block">
                Visitante
              </span>
            </div>
          </div>
        </div>

        {/* Bottom meta */}
        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] sm:text-[11px] text-[#8B949E]">
          <span className="truncate max-w-[200px] sm:max-w-[280px]">{formatTextValue(match.stadium)}</span>
          <span className="font-semibold text-[#8B949E] group-hover:text-[#DCA842] transition-colors flex items-center gap-1">
            <span>Ficha del encuentro</span>
            <span>→</span>
          </span>
        </div>
      </div>
    );
  }

  // STANDARD COMPACT FIXTURE CARD (HIGH DENSITY)
  return (
    <div
      onClick={handleClick}
      className={`rounded-xl bg-[#121519] border transition-all duration-150 cursor-pointer p-3 sm:p-3.5 group ${
        isLive
          ? 'border-[#10B981]/40 hover:border-[#10B981]'
          : 'border-white/[0.08] hover:border-[#DCA842]/40 hover:bg-[#15191F]'
      }`}
    >
      <div className="flex items-center justify-between text-[11px] text-[#8B949E] mb-2.5 pb-1.5 border-b border-white/[0.04]">
        <div className="flex items-center gap-1.5 truncate">
          <span className="font-semibold text-[#F1EDE6]">{match.round || 'Fecha Oficial'}</span>
          <span className="text-white/20">·</span>
          <span>{formatMatchDate(match.date, match.timestamp)}</span>
        </div>
        <StatusIndicator
          status={match.status}
          minute={match.minute}
          time={match.time}
          date={match.date}
          timestamp={match.timestamp}
        />
      </div>

      {/* Horizontal Clash: Equipo 1 [Gol] - [Gol] Equipo 2 */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-4 my-1">
        {/* Local */}
        <div className="flex-1 flex items-center justify-end gap-1.5 sm:gap-2.5 min-w-0 text-right">
          <span className="text-xs sm:text-sm font-bold text-[#F1EDE6] truncate group-hover:text-[#DCA842] transition-colors leading-tight">
            {homeName}
          </span>
          <TeamBadge teamId={match.homeTeamId} team={homeTeam} logoUrl={homeTeam?.logo} size="xs" className="shrink-0" />
        </div>

        {/* Central: Score or Time */}
        <div className="shrink-0 flex items-center justify-center px-1">
          {isLive || isFinished ? (
            <div className="flex items-center gap-1 sm:gap-2 font-num font-black text-sm sm:text-base tabular-nums px-2.5 sm:px-3 py-0.5 rounded-lg bg-[#181C22] border border-white/[0.08]">
              <span className={isLive && match.homeScore !== null && match.awayScore !== null && match.homeScore > match.awayScore ? 'text-[#10B981]' : 'text-[#F1EDE6]'}>
                {homeScoreDisplay}
              </span>
              <span className="text-white/25 text-xs sm:text-sm font-light select-none">—</span>
              <span className={isLive && match.homeScore !== null && match.awayScore !== null && match.awayScore > match.homeScore ? 'text-[#10B981]' : 'text-[#F1EDE6]'}>
                {awayScoreDisplay}
              </span>
            </div>
          ) : (
            <span className="text-xs font-semibold text-[#F1EDE6] font-num bg-[#181C22] px-2.5 py-0.5 rounded-lg border border-white/[0.08] shrink-0">
              {formatMatchTime(match.time, match.date, match.timestamp)}
            </span>
          )}
        </div>

        {/* Visitante */}
        <div className="flex-1 flex items-center justify-start gap-1.5 sm:gap-2.5 min-w-0 text-left">
          <TeamBadge teamId={match.awayTeamId} team={awayTeam} logoUrl={awayTeam?.logo} size="xs" className="shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-[#F1EDE6] truncate group-hover:text-[#DCA842] transition-colors leading-tight">
            {awayName}
          </span>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-[#8B949E]">
        <span className="truncate">{formatTextValue(match.stadium)}</span>
        <span className="text-[#8B949E] group-hover:text-[#DCA842] transition-colors font-medium">
          Ver ficha →
        </span>
      </div>
    </div>
  );
};
