import React, { useState } from 'react';
import { Club } from '../../types/football';
import { getTeamOfficialLogo, getTeamIdentity } from '../../utils/teamLogos';

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
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());

  const resolvedTeamId = teamId || team?.id || '';
  const identity = getTeamIdentity(resolvedTeamId, team?.code, team?.name || team?.shortName);
  const officialLogo = getTeamOfficialLogo(resolvedTeamId, team?.code, team?.name || team?.shortName);

  // Determinar candidatos de URL en orden de fidelidad oficial
  const candidates: string[] = [];
  if (logoUrl && !failedUrls.has(logoUrl)) candidates.push(logoUrl);
  if (officialLogo && !failedUrls.has(officialLogo) && !candidates.includes(officialLogo)) candidates.push(officialLogo);
  if (team?.logo && !failedUrls.has(team.logo) && !candidates.includes(team.logo)) candidates.push(team.logo);

  // Si teamId es numérico, agregar CDN de ESPN y Combiner de alta resolución
  if (resolvedTeamId && /^\d+$/.test(resolvedTeamId)) {
    const espnUrl = `https://a.espncdn.com/i/teamlogos/soccer/500/${resolvedTeamId}.png`;
    if (!failedUrls.has(espnUrl) && !candidates.includes(espnUrl)) candidates.push(espnUrl);
    const espnCombiner = `https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/${resolvedTeamId}.png&w=160&h=160`;
    if (!failedUrls.has(espnCombiner) && !candidates.includes(espnCombiner)) candidates.push(espnCombiner);
  }

  const currentLogo = !imgError && candidates.length > 0 ? candidates[0] : null;

  const displayName = team?.shortName || team?.name || identity?.shortName || identity?.name || 'Club';
  const displayCode = team?.code || identity?.code || displayName.slice(0, 3).toUpperCase();

  const dimensions = {
    xs: 'w-5 h-5 min-w-[20px]',
    sm: 'w-6 h-6 min-w-[24px]',
    md: 'w-9 h-9 min-w-[36px]',
    lg: 'w-14 h-14 min-w-[56px]',
    xl: 'w-20 h-20 min-w-[80px]',
  }[size];

  const primaryColor = team?.primaryColor || identity?.primaryColor || '#181C22';
  const secondaryColor = team?.secondaryColor || identity?.secondaryColor || '#DCA842';

  const handleImageError = () => {
    if (currentLogo) {
      setFailedUrls((prev) => {
        const next = new Set([...prev, currentLogo]);
        const remaining = candidates.filter((c) => !next.has(c));
        if (remaining.length === 0) {
          setImgError(true);
        }
        return next;
      });
    } else {
      setImgError(true);
    }
  };

  const renderContent = () => {
    if (currentLogo) {
      return (
        <img
          src={currentLogo}
          alt={displayName}
          onError={handleImageError}
          className="w-full h-full object-contain filter drop-shadow-sm select-none transition-opacity duration-150"
          loading="lazy"
        />
      );
    }

    // Monograma heráldico limpio de respaldo oficial si el CDN no estuviera accesible
    return (
      <div
        className="w-full h-full rounded-xl flex items-center justify-center font-bold text-center border shadow-sm select-none transition-all"
        style={{
          backgroundColor: primaryColor,
          borderColor: secondaryColor,
          color: secondaryColor,
        }}
      >
        <span
          className={`font-black tracking-wider leading-none ${
            size === 'xs'
              ? 'text-[8px]'
              : size === 'sm'
              ? 'text-[10px]'
              : size === 'md'
              ? 'text-xs'
              : size === 'lg'
              ? 'text-base'
              : 'text-xl'
          }`}
        >
          {displayCode.slice(0, 4)}
        </span>
      </div>
    );
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className={`relative flex items-center justify-center shrink-0 ${dimensions}`}>
        {renderContent()}
      </div>
      {showName && (
        <span className={`truncate ${nameClassName}`}>
          {displayName}
        </span>
      )}
    </div>
  );
};
