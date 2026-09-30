import React from 'react';
import type { SemanticAccent } from '../../design-tokens.ts';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showPercentage?: boolean;
  accent?: SemanticAccent;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  accent = 'pink',
  size = 'md',
  className = '',
}) => {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const fillColors: Record<SemanticAccent, string> = {
    pink: 'bg-[#E11463]',
    teal: 'bg-[#168C8C]',
    blue: 'bg-[#3977C8]',
    green: 'bg-[#3A9D68]',
    orange: 'bg-[#E59A35]',
    red: 'bg-[#D64545]',
    purple: 'bg-[#7357B8]',
  };

  return (
    <div className={`w-full flex flex-col gap-1.5 select-none ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-medium text-slate-700">{label}</span>}
          {showPercentage && (
            <span className="font-semibold text-slate-600 ml-auto">
              {percentage}%
            </span>
          )}
        </div>
      )}

      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${fillColors[accent]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
