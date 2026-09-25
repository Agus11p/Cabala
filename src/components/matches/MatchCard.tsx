import React from 'react';
import { Match } from '../../types/football';
import { TeamBadge } from '../common/TeamBadge';
import { StatusIndicator } from '../common/StatusIndicator';

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

  // FEATURED MATCH HERO CARD
  if (featured) {
    return (
      <div
        onClick={handleClick}
        className={`relative overflow-hidden rounded-2xl bg-[#121519] border transition-all duration-200 cursor-pointer group ${
          isLive
            ? 'border-[#10B981]/50 shadow-md shadow-[#10B981]/5'
            : 'border-white/[0.08] hover:border-[#DCA842]/40 hover:bg-[#15191F]'
        } p-5 sm:p-7`}
      >
        {isLive && (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#10B981]" />
        )}

        {/* Top Header: Tournament, round & status */}
        <div className="flex items-center justify-between text-xs text-[#8B949E] mb-5 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2 tracking-wide font-medium">
            <span className="font-bold text-[#F1EDE6] uppercase tracking-wider text-[11px]">
              {match.tournament || 'Liga Profesional'}
            </span>
            <span aria-hidden="true" className="text-white/20">/</span>
            <span className="text-[#8B949E] text-xs">{match.round || 'Fecha Oficial'}</span>
          </div>
          <StatusIndicator status={match.status} minute={match.minute} time={match.time} />
        </div>

        {/* Teams & Scoreboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-7 items-center gap-5 my-2">
          {/* Home team */}
          <div className="sm:col-span-3 flex sm:flex-row flex-col-reverse items-center sm:justify-end gap-3 sm:text-right text-center">
            <div className="min-w-0">
              <span className="block font-editorial font-bold text-lg sm:text-xl text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors leading-tight">
                {homeName}
              </span>
              <span className="text-[10px] text-[#8B949E] font-medium tracking-wider uppercase mt-0.5 block">
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
          <div className="sm:col-span-1 flex flex-col items-center justify-center py-1">
            {isLive || isFinished ? (
              <div className="flex items-baseline justify-center gap-2.5 font-num font-black text-4xl sm:text-5xl text-[#F1EDE6] tabular-nums tracking-tight">
                <span className={isLive && (match.homeScore ?? 0) > (match.awayScore ?? 0) ? 'text-[#10B981]' : ''}>
                  {match.homeScore ?? 0}
                </span>
                <span className="text-white/20 text-2xl font-light select-none">—</span>
                <span className={isLive && (match.awayScore ?? 0) > (match.homeScore ?? 0) ? 'text-[#10B981]' : ''}>
                  {match.awayScore ?? 0}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <span className="font-num text-2xl sm:text-3xl font-bold text-[#F1EDE6] px-3 py-1 rounded-lg bg-[#181C22] border border-white/[0.08]">
                  {match.time || '--:--'}
                </span>
                <span className="text-[10px] text-[#8B949E] mt-1 font-medium tracking-wide">
                  {match.date}
                </span>
              </div>
            )}
          </div>

          {/* Away team */}
          <div className="sm:col-span-3 flex sm:flex-row flex-col items-center sm:justify-start gap-3 sm:text-left text-center">
            <TeamBadge
              teamId={match.awayTeamId}
              team={awayTeam}
              logoUrl={awayTeam?.logo}
              size="md"
              className="shrink-0"
            />
            <div className="min-w-0">
              <span className="block font-editorial font-bold text-lg sm:text-xl text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors leading-tight">
                {awayName}
              </span>
              <span className="text-[10px] text-[#8B949E] font-medium tracking-wider uppercase mt-0.5 block">
                Visitante
              </span>
            </div>
          </div>
        </div>

        {/* Bottom meta */}
        <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#8B949E]">
          <span className="truncate max-w-[240px]">{match.stadium || 'Estadio Oficial'}</span>
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
        <span className="truncate font-medium">{match.tournament || 'Liga Profesional'} · {match.round || 'Fecha Oficial'}</span>
        <StatusIndicator status={match.status} minute={match.minute} time={match.time} />
      </div>

      <div className="space-y-2">
        {/* Local */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <TeamBadge teamId={match.homeTeamId} team={homeTeam} logoUrl={homeTeam?.logo} size="xs" />
            <span className="text-xs sm:text-sm font-medium text-[#F1EDE6] truncate group-hover:text-[#DCA842] transition-colors">
              {homeName}
            </span>
          </div>
          {(isLive || isFinished) ? (
            <span className={`font-num text-lg font-bold tabular-nums ${isLive && (match.homeScore ?? 0) > (match.awayScore ?? 0) ? 'text-[#10B981]' : 'text-[#F1EDE6]'}`}>
              {match.homeScore ?? 0}
            </span>
          ) : (
            <span className="text-xs text-[#8B949E] font-num">{match.time || '--:--'}</span>
          )}
        </div>

        {/* Visitante */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <TeamBadge teamId={match.awayTeamId} team={awayTeam} logoUrl={awayTeam?.logo} size="xs" />
            <span className="text-xs sm:text-sm font-medium text-[#F1EDE6] truncate group-hover:text-[#DCA842] transition-colors">
              {awayName}
            </span>
          </div>
          {(isLive || isFinished) && (
            <span className={`font-num text-lg font-bold tabular-nums ${isLive && (match.awayScore ?? 0) > (match.homeScore ?? 0) ? 'text-[#10B981]' : 'text-[#F1EDE6]'}`}>
              {match.awayScore ?? 0}
            </span>
          )}
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-[#8B949E]">
        <span className="truncate">{match.stadium || 'Estadio Oficial'}</span>
        <span className="text-[#8B949E] group-hover:text-[#DCA842] transition-colors font-medium">
          Ver ficha →
        </span>
      </div>
    </div>
  );
};
