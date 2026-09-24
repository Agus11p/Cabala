import React from 'react';

export const MatchCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#121519] border border-[#22272E] rounded-2xl p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-3 w-24 bg-[#181C22] rounded"></div>
        <div className="h-3 w-16 bg-[#181C22] rounded"></div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#181C22]"></div>
            <div className="h-4 w-32 bg-[#181C22] rounded"></div>
          </div>
          <div className="h-6 w-8 bg-[#181C22] rounded"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#181C22]"></div>
            <div className="h-4 w-32 bg-[#181C22] rounded"></div>
          </div>
          <div className="h-6 w-8 bg-[#181C22] rounded"></div>
        </div>
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between py-3.5 px-4 border-b border-[#22272E] animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 bg-[#181C22] rounded"></div>
        <div className="w-7 h-7 bg-[#181C22] rounded-full"></div>
        <div className="w-28 h-4 bg-[#181C22] rounded"></div>
      </div>
      <div className="flex items-center gap-6">
        <div className="w-6 h-4 bg-[#181C22] rounded"></div>
        <div className="w-6 h-4 bg-[#181C22] rounded"></div>
        <div className="w-8 h-4 bg-[#181C22] rounded"></div>
      </div>
    </div>
  );
};

export const ClubCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#121519] border border-[#22272E] rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-[#181C22] rounded-full"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 w-28 bg-[#181C22] rounded"></div>
          <div className="h-3 w-20 bg-[#181C22] rounded"></div>
        </div>
      </div>
      <div className="h-8 bg-[#181C22] rounded mt-2"></div>
    </div>
  );
};
