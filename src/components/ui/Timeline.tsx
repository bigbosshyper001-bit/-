import React from 'react';
import type { SemanticAccent } from '../../design-tokens.ts';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: React.ReactNode;
  accent?: SemanticAccent;
  status?: string;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ items, className = '' }) => {
  const iconBgs: Record<SemanticAccent, string> = {
    pink: 'bg-[#FBE7EF] text-[#B83B6F] border-[#F8CBDD]',
    purple: 'bg-[#F3EFFF] text-[#5B419B] border-[#DACFF6]',
    teal: 'bg-[#E6F6F6] text-[#0E6A6A] border-[#BFE7E7]',
    blue: 'bg-[#EDF4FC] text-[#265799] border-[#BCD5F4]',
    green: 'bg-[#EAF6F0] text-[#27744B] border-[#C1E6D3]',
    orange: 'bg-[#FEF5EA] text-[#A36817] border-[#F9DCB4]',
    red: 'bg-[#FDEDED] text-[#A32828] border-[#F6BEBE]',
  };

  return (
    <div className={`relative pl-6 space-y-6 ${className}`}>
      {/* Vertical line */}
      <div className="absolute top-2 bottom-2 left-2.5 w-0.5 bg-slate-200" />

      {items.map((item) => {
        const accent = item.accent || 'pink';
        return (
          <div key={item.id} className="relative flex items-start gap-4">
            {/* Timeline node */}
            <div
              className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${iconBgs[accent]} shadow-2xs z-10`}
            >
              {item.icon || <div className="w-1.5 h-1.5 rounded-full bg-current" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 bg-white p-3 rounded-lg border border-slate-100 shadow-2xs">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-xs font-semibold text-slate-800 truncate">{item.title}</h4>
                <span className="text-[11px] text-slate-400 shrink-0">{item.timestamp}</span>
              </div>
              {item.description && (
                <p className="text-xs text-slate-500 leading-normal">{item.description}</p>
              )}
              {item.status && (
                <div className="mt-2 text-[11px] text-slate-600 font-medium">
                  สถานะ: <span className="font-semibold">{item.status}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
