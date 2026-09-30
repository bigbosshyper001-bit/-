import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  BookOpen,
  GraduationCap,
  Info,
  Building,
  RotateCw,
  FileCheck,
} from 'lucide-react';
import type { StatusType } from '../../types.ts';
import type { SemanticAccent } from '../../design-tokens.ts';

export interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

interface StatusDefinition {
  label: string;
  accent: SemanticAccent;
  icon: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  className = '',
}) => {
  const statusMap: Record<string, StatusDefinition> = {
    approved: {
      label: 'อนุมัติแล้ว',
      accent: 'green',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    completed: {
      label: 'ดำเนินการแล้วเสร็จ',
      accent: 'green',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    pending: {
      label: 'รอดำเนินการ',
      accent: 'orange',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    warning: {
      label: 'รอตรวจสอบ',
      accent: 'orange',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    overdue: {
      label: 'เกินกำหนด',
      accent: 'red',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    critical: {
      label: 'เร่งด่วนที่สุด',
      accent: 'red',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    'in-progress': {
      label: 'กำลังดำเนินการ',
      accent: 'blue',
      icon: <RotateCw className="w-3.5 h-3.5 animate-spin-reverse" />,
    },
    draft: {
      label: 'ฉบับร่าง',
      accent: 'blue',
      icon: <Info className="w-3.5 h-3.5" />,
    },
    curriculum: {
      label: 'หลักสูตร',
      accent: 'purple',
      icon: <BookOpen className="w-3.5 h-3.5" />,
    },
    credit: {
      label: 'Credit Bank',
      accent: 'teal',
      icon: <GraduationCap className="w-3.5 h-3.5" />,
    },
    academic: {
      label: 'กองวิชาการ',
      accent: 'pink',
      icon: <Building className="w-3.5 h-3.5" />,
    },
    active: {
      label: 'เปิดใช้งาน',
      accent: 'green',
      icon: <FileCheck className="w-3.5 h-3.5" />,
    },
    inactive: {
      label: 'ระงับชั่วคราว',
      accent: 'orange',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
  };

  const current = statusMap[status] || {
    label: label || status,
    accent: 'blue' as SemanticAccent,
    icon: <Info className="w-3.5 h-3.5" />,
  };

  const displayText = label || current.label;

  const accentStyles: Record<SemanticAccent, string> = {
    green: 'bg-[#EAF6F0] text-[#27744B] border-[#C1E6D3]',
    orange: 'bg-[#FEF5EA] text-[#A36817] border-[#F9DCB4]',
    red: 'bg-[#FDEDED] text-[#A32828] border-[#F6BEBE]',
    blue: 'bg-[#EDF4FC] text-[#265799] border-[#BCD5F4]',
    purple: 'bg-[#F3EFFF] text-[#5B419B] border-[#DACFF6]',
    teal: 'bg-[#E6F6F6] text-[#0E6A6A] border-[#BFE7E7]',
    pink: 'bg-[#FBE7EF] text-[#B83B6F] border-[#F8CBDD]',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${sizeStyles[size]} ${accentStyles[current.accent]} select-none whitespace-nowrap ${className}`}
    >
      <span className="shrink-0">{current.icon}</span>
      <span>{displayText}</span>
    </span>
  );
};
