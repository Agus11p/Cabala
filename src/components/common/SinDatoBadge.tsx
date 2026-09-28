import React from 'react';
import { HelpCircle } from 'lucide-react';

interface SinDatoBadgeProps {
  label?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
  inline?: boolean;
}

export const SinDatoBadge: React.FC<SinDatoBadgeProps> = ({
  label = 'SIN DATO',
  className = '',
  size = 'xs',
  inline = false,
}) => {
  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-xs px-3 py-1.5',
  }[size];

  if (inline) {
    return (
      <span
        className={`font-mono font-bold tracking-wider text-[#8B949E] bg-white/[0.04] border border-white/[0.08] rounded-md ${sizeClasses} ${className}`}
        title="Dato no disponible en fuentes oficiales verificadas. En CÁBALA no se inventan datos."
      >
        {label}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md font-mono font-bold tracking-wider text-[#8B949E] bg-[#181C22] border border-white/[0.08] ${sizeClasses} ${className}`}
      title="Dato no disponible en fuentes oficiales verificadas. En CÁBALA no se inventan datos."
    >
      <HelpCircle className="w-3 h-3 text-[#DCA842] shrink-0" />
      <span>{label}</span>
    </div>
  );
};
