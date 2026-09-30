import React from 'react';
import { Database, Plus, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button.tsx';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'ยังไม่มีข้อมูล',
  description = 'เริ่มต้นด้วยการเพิ่มข้อมูลรายการแรกในระบบฐานข้อมูลส่วนกลาง',
  actionLabel = '+ เพิ่มข้อมูล',
  onAction,
  icon,
  className = '',
}) => {
  return (
    <div
      className={`p-10 sm:p-14 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-2xs max-w-lg mx-auto ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-pink-50 text-[#B83B6F] flex items-center justify-center mx-auto mb-4 border border-pink-100/80 shadow-2xs">
        {icon || <Database className="w-6 h-6" />}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed max-w-sm mx-auto">
        {description}
      </p>
      {onAction && (
        <div className="mt-6">
          <Button
            type="button"
            variant="primary"
            onClick={onAction}
            className="text-xs sm:text-sm shadow-sm inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{actionLabel}</span>
          </Button>
        </div>
      )}
    </div>
  );
};
