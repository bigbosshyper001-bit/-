import React, { useState } from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'right' | 'bottom' | 'left';
  disabled?: boolean;
  delayMs?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'right',
  disabled = false,
  delayMs = 150,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  if (disabled || !content) return children;

  const handleMouseEnter = () => {
    const t = setTimeout(() => setIsVisible(true), delayMs);
    setTimer(t);
  };

  const handleMouseLeave = () => {
    if (timer) clearTimeout(timer);
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2.5',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 ${positionClasses[position]} px-2.5 py-1 text-xs font-medium text-slate-100 bg-slate-900/90 backdrop-blur-xs rounded-md shadow-md whitespace-nowrap pointer-events-none transition-all duration-150 animate-in fade-in-50`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
