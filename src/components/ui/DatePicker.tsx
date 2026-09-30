import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface DatePickerProps {
  label?: string;
  value?: string; // YYYY-MM-DD
  onChange?: (date: string) => void;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
}

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

const THAI_DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  helperText,
  error,
  required,
  disabled,
  placeholder = 'เลือกวันที่ (วว/ดด/ปปปป)',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial or default to current date
  const initialDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const formatThaiDisplay = (isoStr?: string) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      const day = d.getDate();
      const monthStr = THAI_MONTHS[d.getMonth()];
      const thaiYear = d.getFullYear() + 543;
      return `${day} ${monthStr} ${thaiYear}`;
    } catch {
      return isoStr;
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysCount = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const selectedIso = `${viewYear}-${mm}-${dd}`;
    onChange?.(selectedIso);
    setIsOpen(false);
  };

  const setToday = () => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const selectedIso = `${now.getFullYear()}-${mm}-${dd}`;
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    onChange?.(selectedIso);
    setIsOpen(false);
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('');
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const [y, m, d] = value.split('-').map(Number);
    return y === viewYear && m === viewMonth + 1 && d === day;
  };

  return (
    <div className="w-full flex flex-col gap-1.5 relative" ref={containerRef} id={id}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 select-none flex items-center justify-between">
          <span>{label}</span>
          {required && <span className="text-[#D64545] text-xs">*</span>}
        </label>
      )}

      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between text-sm bg-white rounded-lg border px-3 py-2 h-9.5 cursor-pointer transition-all duration-150 select-none
          ${
            error
              ? 'border-[#D64545] focus:ring-2 focus:ring-[#FDEDED]'
              : isOpen
              ? 'border-[#E11463] ring-2 ring-[#FFE4EE]'
              : 'border-[#FFDCE8] hover:border-[#FFD0E2]'
          }
          ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'text-slate-900'}
        `}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
          <span className={value ? 'text-slate-900 truncate' : 'text-slate-400 truncate'}>
            {value ? formatThaiDisplay(value) : placeholder}
          </span>
        </div>

        {value && !disabled && (
          <button
            type="button"
            onClick={clearDate}
            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
            title="ล้างวันที่"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full mt-1.5 left-0 z-50 w-72 bg-white rounded-xl shadow-lg border border-slate-200 p-3 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-xs font-semibold text-slate-800">
              {THAI_MONTHS[viewMonth]} {viewYear + 543}
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {THAI_DAYS.map((d) => (
              <span key={d} className="text-[11px] font-medium text-slate-400 py-0.5">
                {d}
              </span>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysCount }).map((_, i) => {
              const day = i + 1;
              const selected = isSelected(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 w-8 text-xs rounded-lg flex items-center justify-center transition-colors font-medium
                    ${
                      selected
                        ? 'bg-[#E11463] text-white shadow-xs'
                        : 'text-slate-700 hover:bg-[#FFF0F5] hover:text-[#E11463]'
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Bottom actions */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={setToday}
              className="text-[#E11463] hover:text-[#C80C54] font-medium cursor-pointer"
            >
              วันนี้
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-700 font-medium"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      {error ? (
        <p className="text-xs text-[#D64545] font-normal">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 font-normal">{helperText}</p>
      ) : null}
    </div>
  );
};
