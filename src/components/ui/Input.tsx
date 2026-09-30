import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClear?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5" id={inputId ? `${inputId}-group` : undefined}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-700 select-none flex items-center justify-between"
          >
            <span>{label}</span>
            {props.required && <span className="text-[#D64545] text-xs">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`w-full text-sm bg-white text-slate-900 placeholder:text-slate-400 rounded-lg border transition-all duration-150 outline-none
              ${leftIcon ? 'pl-9' : 'pl-3.5'}
              ${rightIcon ? 'pr-9' : 'pr-3.5'}
              py-2 h-9.5
              ${
                error
                  ? 'border-[#D64545] focus:border-[#D64545] focus:ring-2 focus:ring-[#FDEDED]'
                  : 'border-[#FFDCE8] hover:border-[#FFD0E2] focus:border-[#E11463] focus:ring-2 focus:ring-[#FFE4EE]'
              }
              disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 text-slate-400 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-[#D64545] font-normal flex items-center gap-1">
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 font-normal">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
