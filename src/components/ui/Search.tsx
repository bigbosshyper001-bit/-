import React from 'react';
import { Search as SearchIcon, X } from 'lucide-react';

export interface SearchProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onClear?: () => void;
  shortcutHint?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const Search: React.FC<SearchProps> = ({
  value,
  onChange,
  placeholder = 'ค้นหา...',
  onClear,
  shortcutHint,
  className = '',
  size = 'md',
}) => {
  const heightClasses = {
    sm: 'h-8 text-xs pl-8 pr-7',
    md: 'h-9.5 text-sm pl-9 pr-8',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5 left-2.5',
    md: 'w-4 h-4 left-3',
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <SearchIcon
        className={`absolute ${iconSizes[size]} text-slate-400 pointer-events-none`}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-white text-slate-900 placeholder:text-slate-400 rounded-xl border border-[#FFDCE8] hover:border-[#FFD0E2] focus:border-[#E11463] focus:ring-2 focus:ring-[#FFE4EE] outline-none transition-all duration-150 ${heightClasses[size]}`}
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          className="absolute right-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
          title="ล้างคำค้น"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : shortcutHint ? (
        <span className="absolute right-2.5 text-[10px] font-medium text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 pointer-events-none bg-slate-50">
          {shortcutHint}
        </span>
      ) : null}
    </div>
  );
};
