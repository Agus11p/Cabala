import React from 'react';

interface StatBarProps {
  label: string;
  homeValue: number;
  awayValue: number;
  isPercentage?: boolean;
}

export const StatBar: React.FC<StatBarProps> = ({
  label,
  homeValue,
  awayValue,
  isPercentage = false,
}) => {
  const total = homeValue + awayValue;
  const homePct = total === 0 ? 50 : Math.round((homeValue / total) * 100);
  const awayPct = 100 - homePct;

  const homeLead = homeValue > awayValue;
  const awayLead = awayValue > homeValue;

  return (
    <div className="py-2.5 border-b border-[#22272E] last:border-b-0">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className={`font-num font-bold text-base tabular-nums ${homeLead ? 'text-[#DCA842]' : 'text-[#F1EDE6]'}`}>
          {homeValue}{isPercentage ? '%' : ''}
        </span>
        <span className="text-[11px] uppercase tracking-wider text-[#8B949E] font-medium">
          {label}
        </span>
        <span className={`font-num font-bold text-base tabular-nums ${awayLead ? 'text-[#DCA842]' : 'text-[#F1EDE6]'}`}>
          {awayValue}{isPercentage ? '%' : ''}
        </span>
      </div>
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[#181C22]">
        <div
          className={`h-full transition-all duration-300 ${homeLead ? 'bg-[#DCA842]' : 'bg-[#3A424D]'}`}
          style={{ width: `${isPercentage ? homeValue : homePct}%` }}
        />
        <div
          className={`h-full transition-all duration-300 ${awayLead ? 'bg-[#DCA842]' : 'bg-[#22272E]'}`}
          style={{ width: `${isPercentage ? awayValue : awayPct}%` }}
        />
      </div>
    </div>
  );
};
