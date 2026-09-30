import React from 'react';

interface McuLogoProps {
  /** Optional custom logo image URL. When empty, displays standard MCU LOGO placeholder */
  imageUrl?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show text alongside logo */
  showText?: boolean;
  /** Inverted/white style for dark backgrounds */
  inverted?: boolean;
  className?: string;
}

export const McuLogo: React.FC<McuLogoProps> = ({
  imageUrl,
  size = 'md',
  showText = true,
  inverted = false,
  className = '',
}) => {
  const boxSizes = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-[11px]',
    lg: 'w-12 h-12 text-xs',
  };

  const textSizes = {
    sm: {
      dept: 'text-xs font-semibold',
      univ: 'text-[10px] text-slate-500',
    },
    md: {
      dept: 'text-sm font-semibold tracking-tight',
      univ: 'text-[11px] text-slate-500 leading-tight',
    },
    lg: {
      dept: 'text-base font-bold tracking-tight',
      univ: 'text-xs text-slate-500 leading-tight',
    },
  };

  return (
    <div className={`flex items-center gap-3 ${className}`} id="mcu-logo-wrapper">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="MCU Logo"
          className={`${boxSizes[size].split(' ')[0]} ${boxSizes[size].split(' ')[1]} object-contain rounded-md`}
        />
      ) : (
        /* Placeholder specified strictly in brand guidelines */
        <div
          id="mcu-logo-placeholder-box"
          className={`${boxSizes[size]} flex-shrink-0 flex items-center justify-center font-bold tracking-wider rounded-xl transition-all ${
            inverted
              ? 'bg-white/10 text-white border border-white/20'
              : 'bg-[#E11463] text-white shadow-xs'
          }`}
          title="MCU LOGO (มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย)"
        >
          MCU
        </div>
      )}

      {showText && (
        <div className="flex flex-col min-w-0">
          <span
            className={`${textSizes[size].dept} truncate ${
              inverted ? 'text-white' : 'text-slate-900'
            }`}
          >
            กองวิชาการ
          </span>
          <span
            className={`${textSizes[size].univ} truncate ${
              inverted ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
          </span>
        </div>
      )}
    </div>
  );
};
