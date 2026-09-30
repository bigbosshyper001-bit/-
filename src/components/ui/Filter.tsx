import React from 'react';
import { Filter as FilterIcon, RotateCcw, Check } from 'lucide-react';
import type { SemanticAccent } from '../../design-tokens.ts';

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
  accent?: SemanticAccent;
}

export interface FilterGroupProps {
  label: string;
  options: FilterOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  onReset?: () => void;
  className?: string;
}

export const Filter: React.FC<FilterGroupProps> = ({
  label,
  options,
  selectedId,
  onSelect,
  onReset,
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs select-none ${className}`}>
      <div className="flex items-center gap-1.5 text-slate-500 font-medium mr-1">
        <FilterIcon className="w-3.5 h-3.5 text-slate-400" />
        <span>{label}:</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {options.map((opt) => {
          const isSelected = opt.id === selectedId;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer border
                ${
                  isSelected
                    ? 'bg-[#FFF0F5] text-[#E11463] border-[#FFD0E2] shadow-2xs font-semibold'
                    : 'bg-white text-slate-600 border-[#FFDCE8] hover:border-[#FFD0E2] hover:text-[#E11463]'
                }
              `}
            >
              {isSelected && <Check className="w-3 h-3 text-[#E11463]" />}
              <span>{opt.label}</span>
              {opt.count !== undefined && (
                <span
                  className={`text-[10px] px-1 rounded ${
                    isSelected ? 'bg-white/80 text-[#E11463]' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {opt.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {onReset && selectedId !== 'all' && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#E11463] ml-2 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>ล้างตัวกรอง</span>
        </button>
      )}
    </div>
  );
};
