import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex items-baseline justify-between mb-4 ${className}`}>
      <div>
        <h2 className="text-xl md:text-2xl font-editorial font-black text-[#F1EDE6] tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-[#8B949E] mt-0.5 font-normal tracking-wide">
            {subtitle}
          </p>
        )}
      </div>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="text-xs font-semibold text-[#8B949E] hover:text-[#DCA842] transition-colors flex items-center gap-1 group py-1"
        >
          <span>{actionText}</span>
          <span className="inline-block transition-transform group-hover:translate-x-0.5 text-[#DCA842]">→</span>
        </button>
      )}
    </div>
  );
};
