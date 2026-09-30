import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { SemanticAccent } from '../../design-tokens.ts';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
}

export interface ToastOptions {
  title: string;
  message?: string;
  type?: ToastType | string;
  durationMs?: number;
}

interface ToastContextValue {
  showToast: (
    arg1: ToastType | string | ToastOptions,
    arg2?: string | ToastType | number,
    arg3?: string | number,
    arg4?: number
  ) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
};

const VALID_TOAST_TYPES = new Set<string>(['success', 'error', 'warning', 'info']);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (
      arg1: ToastType | string | ToastOptions,
      arg2?: string | ToastType | number,
      arg3?: string | number,
      arg4?: number
    ) => {
      let type: ToastType = 'info';
      let title = '';
      let message: string | undefined = undefined;
      let durationMs = 3500;

      if (typeof arg1 === 'object' && arg1 !== null) {
        const opt = arg1 as ToastOptions;
        title = opt.title || '';
        message = opt.message;
        if (opt.type && VALID_TOAST_TYPES.has(opt.type.toLowerCase())) {
          type = opt.type.toLowerCase() as ToastType;
        } else {
          type = 'info';
        }
        if (typeof opt.durationMs === 'number') {
          durationMs = opt.durationMs;
        }
      } else {
        const isArg1Type = typeof arg1 === 'string' && VALID_TOAST_TYPES.has(arg1.toLowerCase());
        const isArg2Type = typeof arg2 === 'string' && VALID_TOAST_TYPES.has(arg2.toLowerCase());

        if (isArg1Type) {
          // Pattern 1: showToast('success', 'บันทึกสำเร็จ', 'รายละเอียด', 3500)
          type = (arg1 as string).toLowerCase() as ToastType;
          title = typeof arg2 === 'string' ? arg2 : '';
          if (typeof arg3 === 'string') {
            message = arg3;
          } else if (typeof arg3 === 'number') {
            durationMs = arg3;
          }
          if (typeof arg4 === 'number') {
            durationMs = arg4;
          }
        } else if (isArg2Type) {
          // Pattern 2: showToast('บันทึกสำเร็จ', 'success', 'รายละเอียด'?, 3500?)
          type = (arg2 as string).toLowerCase() as ToastType;
          title = typeof arg1 === 'string' ? arg1 : '';
          if (typeof arg3 === 'string') {
            message = arg3;
          } else if (typeof arg3 === 'number') {
            durationMs = arg3;
          }
          if (typeof arg4 === 'number') {
            durationMs = arg4;
          }
        } else {
          // Pattern 3: showToast('ข้อความแจ้งเตือน', 'รายละเอียด'?, 3500?)
          type = 'info';
          title = typeof arg1 === 'string' ? arg1 : '';
          if (typeof arg2 === 'string') {
            message = arg2;
          } else if (typeof arg2 === 'number') {
            durationMs = arg2;
          }
          if (typeof arg3 === 'number') {
            durationMs = arg3;
          }
        }
      }

      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, message, durationMs };
      setToasts((prev) => [...prev, newToast]);

      if (durationMs > 0) {
        setTimeout(() => {
          removeToast(id);
        }, durationMs);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        id="toast-container"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onClose: () => void }> = ({ toast, onClose }) => {
  const configs: Record<
    ToastType,
    { icon: React.ReactNode; border: string; bg: string; text: string }
  > = {
    success: {
      icon: <CheckCircle2 className="w-4 h-4 text-[#3A9D68]" />,
      border: 'border-[#C1E6D3]',
      bg: 'bg-white',
      text: 'text-[#27744B]',
    },
    error: {
      icon: <AlertCircle className="w-4 h-4 text-[#D64545]" />,
      border: 'border-[#F6BEBE]',
      bg: 'bg-white',
      text: 'text-[#A32828]',
    },
    warning: {
      icon: <AlertTriangle className="w-4 h-4 text-[#E59A35]" />,
      border: 'border-[#F9DCB4]',
      bg: 'bg-white',
      text: 'text-[#A36817]',
    },
    info: {
      icon: <Info className="w-4 h-4 text-[#3977C8]" />,
      border: 'border-[#BCD5F4]',
      bg: 'bg-white',
      text: 'text-[#265799]',
    },
  };

  const cfg = (toast.type && configs[toast.type]) ? configs[toast.type] : configs.info;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border ${cfg.border} ${cfg.bg} shadow-lg transition-all duration-200 animate-in slide-in-from-bottom-2 fade-in`}
      role="alert"
    >
      <div className="shrink-0 mt-0.5">{cfg.icon}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-semibold text-slate-900 leading-tight">{toast.title}</h4>
        {toast.message && (
          <p className="text-xs text-slate-500 mt-0.5 leading-normal">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="shrink-0 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
