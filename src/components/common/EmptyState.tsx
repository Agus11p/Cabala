import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-[#22272E] bg-[#121519]/50 my-4">
      <div className="w-10 h-10 mx-auto rounded-full bg-[#181C22] flex items-center justify-center text-[#8B949E] mb-3">
        <Search className="w-5 h-5 stroke-[1.5]" />
      </div>
      <h3 className="text-sm font-bold text-[#F1EDE6] mb-1 font-editorial">
        {title}
      </h3>
      <p className="text-xs text-[#8B949E] max-w-sm mx-auto mb-4">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#181C22] text-[#F1EDE6] hover:text-[#DCA842] border border-[#22272E] text-xs font-semibold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
