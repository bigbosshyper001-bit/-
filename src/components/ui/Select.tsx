import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      helperText,
      error,
      placeholder = 'โปรดเลือก...',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? `select-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5" id={selectId ? `${selectId}-group` : undefined}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-slate-700 select-none flex items-center justify-between"
          >
            <span>{label}</span>
            {props.required && <span className="text-[#D64545] text-xs">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            className={`w-full appearance-none text-sm bg-white text-slate-900 rounded-lg border pl-3.5 pr-9 py-2 h-9.5 transition-all duration-150 outline-none cursor-pointer
              ${
                error
                  ? 'border-[#D64545] focus:border-[#D64545] focus:ring-2 focus:ring-[#FDEDED]'
                  : 'border-[#FFDCE8] hover:border-[#FFD0E2] focus:border-[#E11463] focus:ring-2 focus:ring-[#FFE4EE]'
              }
              disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
        </div>

        {error ? (
          <p className="text-xs text-[#D64545] font-normal">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 font-normal">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
