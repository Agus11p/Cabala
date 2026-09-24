import React from 'react';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
}

interface TabNavProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const TabNav = <T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
  size = 'md',
}: TabNavProps<T>) => {
  return (
    <div className={`inline-flex items-center p-1 bg-[#121519] rounded-xl border border-[#22272E] ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 font-medium transition-all rounded-lg whitespace-nowrap ${
              size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-xs md:text-sm'
            } ${
              isActive
                ? 'bg-[#181C22] text-[#F1EDE6] font-bold shadow-xs border border-[#2E353F]'
                : 'text-[#8B949E] hover:text-[#F1EDE6]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[11px] font-num px-1.5 py-0.2 rounded ${
                  isActive ? 'bg-[#DCA842] text-[#0A0C0E] font-bold' : 'text-[#8B949E] bg-[#181C22]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
