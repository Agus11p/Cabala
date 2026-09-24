import React from 'react';
import { MatchStatus } from '../../types/football';

interface StatusIndicatorProps {
  status: MatchStatus;
  minute?: number;
  time?: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  minute,
  time,
  className = '',
}) => {
  if (status === 'live') {
    return (
      <div className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#30A46C] ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30A46C] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#30A46C]"></span>
        </span>
        <span className="font-num text-sm tracking-wide">{minute ? `${minute}'` : 'EN VIVO'}</span>
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

  return (
    <span className={`text-xs tracking-wider text-[#8B949E] font-medium font-num ${className}`}>
      {time || 'Programado'}
    </span>
  );
};
