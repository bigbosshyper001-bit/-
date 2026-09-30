import React from 'react';
import type { SemanticAccent } from '../../design-tokens.ts';

export interface BadgeProps {
  children: React.ReactNode;
  accent?: SemanticAccent | 'slate';
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  accent = 'slate',
  icon,
  size = 'md',
  className = '',
}) => {
  const accentStyles: Record<SemanticAccent | 'slate', string> = {
    pink: 'bg-[#FBE7EF] text-[#B83B6F] border-[#F8CBDD]',
    purple: 'bg-[#F3EFFF] text-[#5B419B] border-[#DACFF6]',
    teal: 'bg-[#E6F6F6] text-[#0E6A6A] border-[#BFE7E7]',
    blue: 'bg-[#EDF4FC] text-[#265799] border-[#BCD5F4]',
    green: 'bg-[#EAF6F0] text-[#27744B] border-[#C1E6D3]',
    orange: 'bg-[#FEF5EA] text-[#A36817] border-[#F9DCB4]',
    red: 'bg-[#FDEDED] text-[#A32828] border-[#F6BEBE]',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border border-solid ${sizeStyles[size]} ${accentStyles[accent]} select-none whitespace-nowrap ${className}`}
    >
      {icon && <span className="inline-flex shrink-0 text-current">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
