import React, { useState } from 'react';
import { Club } from '../../types/football';

interface TeamBadgeProps {
  teamId?: string;
  team?: Partial<Club>;
  logoUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showName?: boolean;
  nameClassName?: string;
}

export const TeamBadge: React.FC<TeamBadgeProps> = ({
  teamId = '',
  team,
  logoUrl,
  size = 'md',
  className = '',
  showName = false,
  nameClassName = 'text-sm font-medium text-[#F1EDE6]',
}) => {
  const [imgError, setImgError] = useState(false);

  const normalizedId = (teamId || team?.id || team?.code || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const effectiveLogo = !imgError ? (logoUrl || team?.logo) : undefined;
  const displayName = team?.shortName || team?.name || 'Club';
  const displayCode = team?.code || displayName.slice(0, 3).toUpperCase();

  const dimensions = {
    xs: 'w-5 h-5 min-w-[20px]',
    sm: 'w-6 h-6 min-w-[24px]',
    md: 'w-9 h-9 min-w-[36px]',
    lg: 'w-14 h-14 min-w-[56px]',
    xl: 'w-20 h-20 min-w-[80px]',
  }[size];

  // Heraldic SVG shield renderers for authentic Argentine football identity
  const renderEmblem = () => {
    if (effectiveLogo) {
      return (
        <img
          src={effectiveLogo}
          alt={displayName}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain filter drop-shadow-xs"
          loading="lazy"
        />
      );
    }

    // Match by ID or name
    if (normalizedId.includes('boca') || normalizedId === '5' || displayCode === 'BOC' || displayCode === 'CABJ') {
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm" fill="none">
          <path d="M10 10 H90 V70 C90 98 50 115 50 115 C50 115 10 98 10 70 Z" fill="#002B49" stroke="#FFB81C" strokeWidth="4" />
          <rect x="10" y="45" width="80" height="28" fill="#FFB81C" />
          <text x="50" y="65" fill="#002B49" fontSize="17" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="2">CABJ</text>
          <circle cx="50" cy="28" r="4.5" fill="#FFB81C" />
          <circle cx="32" cy="34" r="3.5" fill="#FFB81C" />
          <circle cx="68" cy="34" r="3.5" fill="#FFB81C" />
          <circle cx="50" cy="94" r="4" fill="#FFB81C" />
        </svg>
      );
    }

    if (normalizedId.includes('river') || normalizedId === '16' || displayCode === 'RIV' || displayCode === 'CARP') {
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm" fill="none">
          <path d="M10 10 H90 V70 C90 98 50 115 50 115 C50 115 10 98 10 70 Z" fill="#FFFFFF" stroke="#0B0D0F" strokeWidth="3" />
          <clipPath id="river-clip">
            <path d="M10 10 H90 V70 C90 98 50 115 50 115 C50 115 10 98 10 70 Z" />
          </clipPath>
          <g clipPath="url(#river-clip)">
            <line x1="-10" y1="15" x2="110" y2="105" stroke="#E60000" strokeWidth="26" />
          </g>
          <circle cx="50" cy="62" r="19" fill="#FFFFFF" stroke="#0B0D0F" strokeWidth="2.5" />
          <text x="50" y="67" fill="#0B0D0F" fontSize="11" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.5">CARP</text>
        </svg>
      );
    }

    if (normalizedId.includes('racing') || normalizedId === '15' || displayCode === 'RAC') {
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm" fill="none">
          <path d="M10 10 H90 V68 C90 98 50 115 50 115 C50 115 10 98 10 68 Z" fill="#FFFFFF" stroke="#181D22" strokeWidth="3" />
          <clipPath id="racing-clip">
            <path d="M10 10 H90 V68 C90 98 50 115 50 115 C50 115 10 98 10 68 Z" />
          </clipPath>
          <g clipPath="url(#racing-clip)">
            <rect x="10" y="10" width="16" height="110" fill="#75AADB" />
            <rect x="42" y="10" width="16" height="110" fill="#75AADB" />
            <rect x="74" y="10" width="16" height="110" fill="#75AADB" />
            <rect x="10" y="10" width="80" height="24" fill="#002B49" />
            <text x="50" y="27" fill="#FFFFFF" fontSize="13" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="1.5">RACING</text>
          </g>
        </svg>
      );
    }

    if (normalizedId.includes('independiente') || normalizedId === '10' || displayCode === 'IND' || displayCode === 'CAI') {
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm" fill="none">
          <path d="M10 10 H90 V70 C90 98 50 115 50 115 C50 115 10 98 10 70 Z" fill="#D80000" stroke="#FFFFFF" strokeWidth="3" />
          <circle cx="50" cy="62" r="28" fill="#FFFFFF" />
          <circle cx="50" cy="62" r="25" fill="#D80000" />
          <text x="50" y="68" fill="#FFFFFF" fontSize="16" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="1">CAI</text>
        </svg>
      );
    }

    if (normalizedId.includes('sanlorenzo') || normalizedId.includes('lorenzo') || normalizedId === '17' || displayCode === 'SLO' || displayCode === 'CASLA') {
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm" fill="none">
          <circle cx="50" cy="60" r="46" fill="#002B49" stroke="#C41230" strokeWidth="4" />
          <clipPath id="sl-clip">
            <circle cx="50" cy="60" r="44" />
          </clipPath>
          <g clipPath="url(#sl-clip)">
            <rect x="22" y="10" width="12" height="100" fill="#C41230" />
            <rect x="44" y="10" width="12" height="100" fill="#C41230" />
            <rect x="66" y="10" width="12" height="100" fill="#C41230" />
          </g>
          <circle cx="50" cy="60" r="23" fill="#FFFFFF" stroke="#002B49" strokeWidth="2.5" />
          <text x="50" y="65" fill="#002B49" fontSize="10" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">CASLA</text>
        </svg>
      );
    }

    if (normalizedId.includes('velez') || normalizedId === '20' || displayCode === 'VEL' || displayCode === 'CAVS') {
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm" fill="none">
          <path d="M10 10 H90 V70 C90 98 50 115 50 115 C50 115 10 98 10 70 Z" fill="#FFFFFF" stroke="#003399" strokeWidth="3.5" />
          <path d="M10 10 L50 68 L90 10 L75 10 L50 48 L25 10 Z" fill="#003399" />
          <text x="50" y="86" fill="#003399" fontSize="12" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="1">CAVS</text>
        </svg>
      );
    }

    if (normalizedId.includes('estudiantes') || normalizedId === '7' || displayCode === 'EDLP') {
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm" fill="none">
          <path d="M10 10 H90 V68 C90 98 50 115 50 115 C50 115 10 98 10 68 Z" fill="#FFFFFF" stroke="#0B0D0F" strokeWidth="3" />
          <clipPath id="edlp-clip">
            <path d="M10 10 H90 V68 C90 98 50 115 50 115 C50 115 10 98 10 68 Z" />
          </clipPath>
          <g clipPath="url(#edlp-clip)">
            <rect x="18" y="10" width="14" height="110" fill="#DC0000" />
            <rect x="43" y="10" width="14" height="110" fill="#DC0000" />
            <rect x="68" y="10" width="14" height="110" fill="#DC0000" />
          </g>
          <circle cx="50" cy="58" r="18" fill="#0B0D0F" />
          <text x="50" y="63" fill="#FFFFFF" fontSize="11" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">EDLP</text>
        </svg>
      );
    }

    if (normalizedId.includes('talleres') || normalizedId === '19' || displayCode === 'TAL') {
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm" fill="none">
          <path d="M10 10 H90 V68 C90 98 50 115 50 115 C50 115 10 98 10 68 Z" fill="#0C2340" stroke="#FFFFFF" strokeWidth="2.5" />
          <clipPath id="tal-clip">
            <path d="M10 10 H90 V68 C90 98 50 115 50 115 C50 115 10 98 10 68 Z" />
          </clipPath>
          <g clipPath="url(#tal-clip)">
            <rect x="25" y="10" width="12" height="110" fill="#FFFFFF" />
            <rect x="44" y="10" width="12" height="110" fill="#FFFFFF" />
            <rect x="63" y="10" width="12" height="110" fill="#FFFFFF" />
          </g>
          <circle cx="50" cy="58" r="20" fill="#0C2340" stroke="#FFFFFF" strokeWidth="2" />
          <text x="50" y="66" fill="#FFFFFF" fontSize="20" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">T</text>
        </svg>
      );
    }

    if (normalizedId.includes('rosario') || normalizedId.includes('central') || normalizedId === '18' || displayCode === 'CEN' || displayCode === 'CARC') {
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm" fill="none">
          <path d="M10 10 H90 V70 C90 98 50 115 50 115 C50 115 10 98 10 70 Z" fill="#002B7F" stroke="#FFCC00" strokeWidth="3" />
          <clipPath id="cen-clip">
            <path d="M10 10 H90 V70 C90 98 50 115 50 115 C50 115 10 98 10 70 Z" />
          </clipPath>
          <g clipPath="url(#cen-clip)">
            <rect x="20" y="10" width="15" height="110" fill="#FFCC00" />
            <rect x="42" y="10" width="16" height="110" fill="#FFCC00" />
            <rect x="65" y="10" width="15" height="110" fill="#FFCC00" />
          </g>
          <circle cx="50" cy="62" r="20" fill="#002B7F" stroke="#FFCC00" strokeWidth="2.5" />
          <text x="50" y="67" fill="#FFCC00" fontSize="11" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">CARC</text>
        </svg>
      );
    }

    if (normalizedId.includes('newell') || normalizedId === '13' || displayCode === 'NOB') {
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm" fill="none">
          <path d="M10 10 H90 V70 C90 98 50 115 50 115 C50 115 10 98 10 70 Z" fill="#000000" stroke="#FFFFFF" strokeWidth="2.5" />
          <clipPath id="nob-clip">
            <path d="M10 10 H90 V70 C90 98 50 115 50 115 C50 115 10 98 10 70 Z" />
          </clipPath>
          <g clipPath="url(#nob-clip)">
            <rect x="50" y="10" width="50" height="110" fill="#E60000" />
          </g>
          <text x="50" y="68" fill="#FFFFFF" fontSize="18" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="1">NOB</text>
        </svg>
      );
    }

    // Default clean heraldic shield with team abbreviation
    return (
      <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xs" fill="none">
        <path d="M10 10 H90 V70 C90 98 50 115 50 115 C50 115 10 98 10 70 Z" fill="#181C22" stroke="#2E353F" strokeWidth="3" />
        <path d="M15 15 H85 V68 C85 92 50 108 50 108 C50 108 15 92 15 68 Z" fill="#121519" />
        <text
          x="50"
          y="68"
          fill="#DCA842"
          fontSize="18"
          fontWeight="900"
          fontFamily="sans-serif"
          textAnchor="middle"
          letterSpacing="0.5"
        >
          {displayCode.slice(0, 4)}
        </text>
      </svg>
    );
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className={`relative flex items-center justify-center shrink-0 ${dimensions}`}>
        {renderEmblem()}
      </div>
      {showName && (
        <span className={`truncate ${nameClassName}`}>
          {displayName}
        </span>
      )}
    </div>
  );
};
