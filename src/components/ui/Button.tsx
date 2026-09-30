import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      icon,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const effectiveLeftIcon = leftIcon || icon;
    // Color adherence to MCU vibrant pink palette:
    // Primary: #E11463, hover: #C80C54
    // Secondary: Soft blush background #FFF0F5, magenta text #E11463, border #FFD0E2
    // Outline: subtle border with pink hover
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#E11463]/40 active:scale-[0.98] whitespace-nowrap';

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2 gap-2 h-9.5',
      lg: 'text-base px-5 py-2.5 gap-2.5 h-11',
    };

    const variantStyles = {
      primary:
        'bg-[#E11463] text-white hover:bg-[#C80C54] shadow-xs border border-transparent font-medium',
      secondary:
        'bg-[#FFF0F5] text-[#E11463] hover:bg-[#FFE4EE] border border-[#FFD0E2]',
      outline:
        'bg-white text-slate-700 border border-[#FFDCE8] hover:bg-[#FFF0F5] hover:text-[#E11463] hover:border-[#FFD0E2] shadow-2xs',
      ghost:
        'bg-transparent text-slate-600 hover:bg-[#FFF0F5] hover:text-[#E11463]',
      danger:
        'bg-[#FDEDED] text-[#A32828] border border-[#F6BEBE] hover:bg-[#F6BEBE]/50',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          effectiveLeftIcon && <span className="inline-flex shrink-0">{effectiveLeftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
