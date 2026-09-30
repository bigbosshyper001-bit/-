import React from 'react';
import { FolderOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button.tsx';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-slate-200/80 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-[#FAFAFC] border border-slate-200 flex items-center justify-center text-slate-400 mb-3 shadow-2xs">
        {icon || <FolderOpen className="w-6 h-6 text-slate-400" />}
      </div>
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      {description && (
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-normal">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
  message = 'ระบบไม่สามารถดึงข้อมูลที่ร้องขอได้ในขณะนี้ โปรดลองใหม่อีกครั้ง',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-[#FDEDED]/40 rounded-xl border border-[#F6BEBE] ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-[#FDEDED] border border-[#F6BEBE] flex items-center justify-center text-[#A32828] mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-[#A32828]">{title}</h4>
      <p className="text-xs text-[#A32828]/80 max-w-sm mt-1 mb-4 leading-normal">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          ลองใหม่อีกครั้ง
        </Button>
      )}
    </div>
  );
};
