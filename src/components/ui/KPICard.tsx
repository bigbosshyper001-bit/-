import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import type { SemanticAccent } from '../../design-tokens.ts';
import { ProgressBar } from './ProgressBar.tsx';

export interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  target?: string;
  progress?: number; // 0-100
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  accent?: SemanticAccent;
  icon?: React.ReactNode;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit,
  target,
  progress,
  trend,
  accent = 'pink',
  icon,
  subtitle,
  className = '',
  onClick,
}) => {
  const accentBorders: Record<SemanticAccent, string> = {
    pink: 'hover:border-[#E11463]/50',
    purple: 'hover:border-[#7357B8]/40',
    teal: 'hover:border-[#168C8C]/40',
    blue: 'hover:border-[#3977C8]/40',
    green: 'hover:border-[#3A9D68]/40',
    orange: 'hover:border-[#E59A35]/40',
    red: 'hover:border-[#E11463]/40',
  };

  const iconColors: Record<SemanticAccent, { bg: string; text: string; border: string }> = {
    pink: { bg: 'bg-[#FFF0F5]', text: 'text-[#E11463]', border: 'border-[#FFD0E2]' },
    purple: { bg: 'bg-[#F3EFFF]', text: 'text-[#5B419B]', border: 'border-[#DACFF6]' },
    teal: { bg: 'bg-[#E6F6F6]', text: 'text-[#0E6A6A]', border: 'border-[#BFE7E7]' },
    blue: { bg: 'bg-[#EDF4FC]', text: 'text-[#265799]', border: 'border-[#BCD5F4]' },
    green: { bg: 'bg-[#EAF6F0]', text: 'text-[#27744B]', border: 'border-[#C1E6D3]' },
    orange: { bg: 'bg-[#FEF5EA]', text: 'text-[#A36817]', border: 'border-[#F9DCB4]' },
    red: { bg: 'bg-[#FDEDED]', text: 'text-[#A32828]', border: 'border-[#F6BEBE]' },
  };

  const activeIconCfg = (accent && iconColors[accent]) ? iconColors[accent] : iconColors.pink;
  const activeBorder = (accent && accentBorders[accent]) ? accentBorders[accent] : accentBorders.pink;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 p-5 shadow-2xs transition-all duration-200 ${activeBorder} ${
        onClick ? 'cursor-pointer hover:shadow-xs' : ''
      } ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <span className="text-xs font-medium text-slate-600 block truncate">
            {title}
          </span>
          {subtitle && (
            <span className="text-[11px] text-slate-400 block truncate mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
        {icon && (
          <div
            className={`w-8 h-8 rounded-lg ${activeIconCfg.bg} ${activeIconCfg.text} border ${activeIconCfg.border} flex items-center justify-center shrink-0`}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline gap-1.5 my-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
        {unit && <span className="text-xs font-medium text-slate-500">{unit}</span>}
      </div>

      {/* Progress if present */}
      {progress !== undefined && (
        <div className="mt-3 pt-2">
          <ProgressBar value={progress} accent={accent} size="sm" showPercentage={true} />
        </div>
      )}

      {/* Bottom Target / Trend row */}
      {(target || trend) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {target && (
            <span className="truncate">
              เป้าหมาย: <strong className="font-semibold text-slate-700">{target}</strong>
            </span>
          )}
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 font-medium shrink-0 ml-auto ${
                trend.direction === 'up'
                  ? 'text-[#27744B]'
                  : trend.direction === 'down'
                  ? 'text-[#A32828]'
                  : 'text-slate-500'
              }`}
            >
              {trend.direction === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
              {trend.direction === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
              {trend.direction === 'neutral' && <Minus className="w-3.5 h-3.5" />}
              <span>{trend.value}</span>
              {trend.label && (
                <span className="text-[11px] text-slate-400 font-normal ml-0.5">
                  ({trend.label})
                </span>
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
