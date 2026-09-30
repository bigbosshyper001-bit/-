import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'underline' | 'pill';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className = '',
}) => {
  if (variant === 'pill') {
    return (
      <div
        className={`inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200/80 gap-1 select-none ${className}`}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
                ${
                  isActive
                    ? 'bg-white text-[#E11463] shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }
              `}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-[#FFE4EE] text-[#E11463]' : 'bg-slate-200 text-slate-600'
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
  }

  return (
    <div className={`border-b border-[#FFDCE8] w-full select-none ${className}`}>
      <nav className="flex space-x-6 -mb-px overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-all duration-150 cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed
                ${
                  isActive
                    ? 'border-[#E11463] text-[#E11463] font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-[#FFD0E2]'
                }
              `}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    isActive
                      ? 'bg-[#FFE4EE] text-[#E11463]'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
