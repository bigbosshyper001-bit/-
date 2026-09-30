import React from 'react';
import type { SemanticAccent } from '../../design-tokens.ts';

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  accent?: SemanticAccent;
  formattedValue?: string;
}

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: ChartDataPoint[];
  type?: 'bar' | 'distribution';
  unit?: string;
  action?: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  data,
  type = 'bar',
  unit = '',
  action,
  className = '',
}) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);

  const fillColors: Record<SemanticAccent, string> = {
    pink: 'bg-[#E11463]',
    purple: 'bg-[#7357B8]',
    teal: 'bg-[#168C8C]',
    blue: 'bg-[#3977C8]',
    green: 'bg-[#3A9D68]',
    orange: 'bg-[#E59A35]',
    red: 'bg-[#E11463]',
  };

  const badgeColors: Record<SemanticAccent, string> = {
    pink: 'bg-[#FFE4EE] text-[#E11463]',
    purple: 'bg-[#F3EFFF] text-[#5B419B]',
    teal: 'bg-[#E6F6F6] text-[#0E6A6A]',
    blue: 'bg-[#EDF4FC] text-[#265799]',
    green: 'bg-[#EAF6F0] text-[#27744B]',
    orange: 'bg-[#FEF5EA] text-[#A36817]',
    red: 'bg-[#FDEDED] text-[#A32828]',
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 shadow-2xs ${className}`}>
      {/* Card Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 leading-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {type === 'bar' ? (
        <div className="space-y-3 pt-2">
          {data.map((item, idx) => {
            const pct = Math.round((item.value / maxValue) * 100);
            const accent = item.accent || 'pink';
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 truncate max-w-[200px]">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-semibold text-slate-800">
                      {item.formattedValue || item.value}
                    </span>
                    {unit && <span className="text-slate-400 text-[11px]">{unit}</span>}
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${fillColors[accent]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Distribution bar */
        <div className="pt-2">
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex mb-4">
            {data.map((item, idx) => {
              const pct = (item.value / (totalValue || 1)) * 100;
              const accent = item.accent || 'pink';
              return (
                <div
                  key={idx}
                  className={`h-full ${fillColors[accent]} transition-all duration-300`}
                  style={{ width: `${pct}%` }}
                  title={`${item.label}: ${item.value}`}
                />
              );
            })}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {data.map((item, idx) => {
              const accent = item.accent || 'pink';
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-[#FAFAFC]"
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${fillColors[accent]} shrink-0`} />
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-500 block truncate leading-tight">
                      {item.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 block mt-0.5">
                      {item.formattedValue || item.value} {unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
