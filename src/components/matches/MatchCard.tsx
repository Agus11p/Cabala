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

  const homeName = homeTeam?.name || homeTeam?.shortName || match.homeTeamId;
  const awayName = awayTeam?.name || awayTeam?.shortName || match.awayTeamId;

  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  const handleClick = () => {
    if (onClick) onClick(match.id);
  };

  if (featured) {
    return (
      <div
        onClick={handleClick}
        className={`relative overflow-hidden rounded-2xl bg-[#121519] border transition-all duration-200 cursor-pointer group ${
          isLive
            ? 'border-[#30A46C]/50 shadow-lg shadow-black/40'
            : 'border-[#22272E] hover:border-[#DCA842]/50 hover:bg-[#15191F]'
        } p-6 md:p-8`}
      >
        {/* Subtle accent bar if live */}
        {isLive && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#30A46C]" />
        )}

        {/* Top Header: Tournament, round & live badge */}
        <div className="flex items-center justify-between text-xs text-[#8B949E] mb-6 border-b border-[#22272E] pb-3">
          <div className="flex items-center gap-2 tracking-wide">
            <span className="font-bold text-[#F1EDE6] uppercase tracking-wider">{match.tournament}</span>
            <span aria-hidden="true" className="text-[#3A424D]">/</span>
            <span className="text-[#8B949E]">{match.round}</span>
          </div>
          <StatusIndicator status={match.status} minute={match.minute} time={match.time} />
        </div>

        {/* Teams & Scoreboard - Massive Editorial Stature */}
        <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-6 my-4">
          {/* Home team */}
          <div className="md:col-span-3 flex md:flex-row flex-col-reverse items-center md:justify-end gap-4 md:text-right text-center">
            <div className="min-w-0">
              <span className="block font-editorial font-extrabold text-xl md:text-2xl text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors leading-tight">
                {homeName}
              </span>
              <span className="text-xs text-[#8B949E] font-medium tracking-wider uppercase mt-0.5 block">
                Local
              </span>
            </div>
            <TeamBadge
              teamId={match.homeTeamId}
              team={homeTeam}
              logoUrl={homeTeam?.logo}
              size="lg"
              className="transition-transform group-hover:scale-105 shrink-0"
            />
          </div>

          {/* Central Score / Time Display */}
          <div className="md:col-span-1 flex flex-col items-center justify-center py-2">
            {isLive || isFinished ? (
              <div className="flex items-baseline justify-center gap-3 font-num font-black text-5xl md:text-6xl text-[#F1EDE6] tabular-nums tracking-tight">
                <span className={isLive && match.homeScore !== null && match.homeScore > (match.awayScore ?? 0) ? 'text-[#30A46C]' : ''}>
                  {match.homeScore ?? 0}
                </span>
                <span className="text-[#3A424D] text-3xl font-light select-none">—</span>
                <span className={isLive && match.awayScore !== null && match.awayScore > (match.homeScore ?? 0) ? 'text-[#30A46C]' : ''}>
                  {match.awayScore ?? 0}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <span className="font-num text-3xl font-bold text-[#F1EDE6] px-3.5 py-1 rounded-lg bg-[#181C22] border border-[#22272E]">
                  {match.time || '--:--'}
                </span>
                <span className="text-[11px] text-[#8B949E] mt-1.5 font-medium tracking-wide">
                  {match.date}
                </span>
              </div>
            )}
          </div>

          {/* Away team */}
          <div className="md:col-span-3 flex md:flex-row flex-col items-center md:justify-start gap-4 md:text-left text-center">
            <TeamBadge
              teamId={match.awayTeamId}
              team={awayTeam}
              logoUrl={awayTeam?.logo}
              size="lg"
              className="transition-transform group-hover:scale-105 shrink-0"
            />
            <div className="min-w-0">
              <span className="block font-editorial font-extrabold text-xl md:text-2xl text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors leading-tight">
                {awayName}
              </span>
              <span className="text-xs text-[#8B949E] font-medium tracking-wider uppercase mt-0.5 block">
                Visitante
              </span>
            </div>
          </div>
        </div>

        {/* Bottom meta: Stadium & Details affordance */}
        <div className="mt-6 pt-4 border-t border-[#22272E] flex items-center justify-between text-xs text-[#8B949E]">
          <span className="truncate max-w-[280px] font-medium">{match.stadium || 'Estadio Oficial'}</span>
          <span className="text-xs font-semibold text-[#8B949E] group-hover:text-[#DCA842] transition-colors flex items-center gap-1.5">
            <span>Ver ficha del partido</span>
            <span className="text-[#DCA842]">→</span>
          </span>
        </div>
      </div>
    );
  }

  // Standard agenda row / card
  return (
    <div
      onClick={handleClick}
      className={`rounded-xl bg-[#121519] border transition-all duration-150 cursor-pointer p-4 group ${
        isLive
          ? 'border-[#30A46C]/40 hover:border-[#30A46C]'
          : 'border-[#22272E] hover:border-[#DCA842]/40 hover:bg-[#16191F]'
      }`}
    >
      <div className="flex items-center justify-between text-xs text-[#8B949E] mb-3 border-b border-[#22272E]/60 pb-2">
        <span className="truncate font-medium">{match.tournament} · {match.round}</span>
        <StatusIndicator status={match.status} minute={match.minute} time={match.time} />
      </div>

      <div className="space-y-2.5">
        {/* Home Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <TeamBadge teamId={match.homeTeamId} team={homeTeam} logoUrl={homeTeam?.logo} size="sm" />
            <span className="text-sm font-semibold text-[#F1EDE6] truncate group-hover:text-[#DCA842] transition-colors">
              {homeName}
            </span>
          </div>
          {(isLive || isFinished) ? (
            <span className={`font-num text-xl font-bold tabular-nums ${isLive && (match.homeScore ?? 0) > (match.awayScore ?? 0) ? 'text-[#30A46C]' : 'text-[#F1EDE6]'}`}>
              {match.homeScore ?? 0}
            </span>
          ) : (
            <span className="text-xs text-[#8B949E] font-num">{match.time || '--:--'}</span>
          )}
        </div>

        {/* Away Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <TeamBadge teamId={match.awayTeamId} team={awayTeam} logoUrl={awayTeam?.logo} size="sm" />
            <span className="text-sm font-semibold text-[#F1EDE6] truncate group-hover:text-[#DCA842] transition-colors">
              {awayName}
            </span>
          </div>
          {(isLive || isFinished) && (
            <span className={`font-num text-xl font-bold tabular-nums ${isLive && (match.awayScore ?? 0) > (match.homeScore ?? 0) ? 'text-[#30A46C]' : 'text-[#F1EDE6]'}`}>
              {match.awayScore ?? 0}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-[#22272E]/40 flex items-center justify-between text-[11px] text-[#8B949E]">
        <span className="truncate">{match.stadium || 'Estadio Oficial'}</span>
        <span className="text-[#8B949E] group-hover:text-[#DCA842] transition-colors text-[11px] font-medium">
          Ficha →
        </span>
      </div>
    </div>
  );
};
