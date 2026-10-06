import React from 'react';
import { MatchStatus } from '../../types/football';
import { formatMatchTime, formatMatchMinute } from '../../utils/formatters';

interface StatusIndicatorProps {
  status: MatchStatus;
  minute?: number | string;
  time?: string;
  date?: string;
  timestamp?: number;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  minute,
  time,
  date,
  timestamp,
  className = '',
}) => {
  if (status === 'live') {
    const formattedMinute = formatMatchMinute(minute);
    const minuteText = formattedMinute || 'EN VIVO';
    return (
      <div className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#30A46C] ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30A46C] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#30A46C]"></span>
        </span>
        <span className="font-num text-sm tracking-wide">{minuteText}</span>
      </div>
    );
  }

  if (status === 'finished') {
    return (
      <span className={`text-[11px] uppercase tracking-widest text-[#8B949E] font-medium ${className}`}>
        Finalizado
      </span>
    );
  }

  if (status === 'suspended') {
    return (
      <span className={`text-[11px] uppercase tracking-widest text-amber-500 font-semibold ${className}`}>
        Suspendido
      </span>
    );
  }

  if (status === 'delayed') {
    return (
      <span className={`text-[11px] uppercase tracking-widest text-amber-400 font-semibold ${className}`}>
        Demorado
      </span>
    );
  }

  if (status === 'postponed') {
    return (
      <span className={`text-[11px] uppercase tracking-widest text-[#8B949E] font-medium ${className}`}>
        Postergado
      </span>
    );
  }

  if (status === 'cancelled') {
    return (
      <span className={`text-[11px] uppercase tracking-widest text-rose-500 font-semibold ${className}`}>
        Cancelado
      </span>
    );
  }

  return (
    <span className={`text-xs tracking-wider text-[#8B949E] font-medium font-num ${className}`}>
      {formatMatchTime(time, date, timestamp)}
    </span>
  );
};
