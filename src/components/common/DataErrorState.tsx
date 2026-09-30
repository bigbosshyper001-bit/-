import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button.tsx';

export interface DataErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const DataErrorState: React.FC<DataErrorStateProps> = ({
  title = 'ไม่สามารถโหลดข้อมูลได้',
  message = 'เกิดข้อผิดพลาดในการเชื่อมต่อกับฐานข้อมูล Cloud Database กรุณาลองใหม่อีกครั้ง',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`p-8 text-center bg-white rounded-2xl border border-rose-200 shadow-2xs max-w-lg mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3.5">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{message}</p>
      {onRetry && (
        <div className="mt-5">
          <Button
            variant="outline"
            onClick={onRetry}
            className="text-xs inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ลองใหม่</span>
          </Button>
        </div>
      )}
    </div>
  );
};
