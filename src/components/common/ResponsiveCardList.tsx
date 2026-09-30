import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface ResponsiveCardField {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export interface ResponsiveCardItem<T> {
  key?: string | number;
  id?: string | number;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  statusBadge?: React.ReactNode;
  fields?: ResponsiveCardField[];
  actions?: React.ReactNode;
  primaryAction?: React.ReactNode;
  onClick?: () => void;
  rawItem?: T;
  highlighted?: boolean;
}

export interface ResponsiveCardListProps<T> {
  items: ResponsiveCardItem<T>[];
  emptyText?: string;
  className?: string;
}

/**
 * ResponsiveCardList:
 * Renders data as mobile-optimized touch-friendly cards with high visual contrast,
 * clean typography, and 44px minimum touch targets, avoiding horizontal scroll.
 */
export function ResponsiveCardList<T>({
  items,
  emptyText = 'ไม่พบข้อมูลในระบบ',
  className = '',
}: ResponsiveCardListProps<T>) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-xs">
        {emptyText}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`} id="responsive-card-list">
      {items.map((card, idx) => {
        const isClickable = Boolean(card.onClick);
        const cardKey = card.key ?? card.id ?? idx;
        const renderedActions = card.actions || card.primaryAction;

        return (
          <div
            key={cardKey}
            onClick={card.onClick}
            className={`bg-white rounded-xl border p-4 shadow-2xs transition-all relative ${
              card.highlighted
                ? 'border-[#B83B6F] ring-1 ring-[#B83B6F]/20'
                : 'border-slate-200/90 hover:border-slate-300'
            } ${isClickable ? 'cursor-pointer active:bg-slate-50' : ''}`}
          >
            {/* Header: Title + Status Badge */}
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex-1 min-w-0">
                {card.badge && <div className="mb-1.5">{card.badge}</div>}
                <h4 className="text-sm font-bold text-slate-900 leading-snug break-words">
                  {card.title}
                </h4>
                {card.subtitle && (
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed break-words">
                    {card.subtitle}
                  </p>
                )}
              </div>

              {card.statusBadge && (
                <div className="shrink-0">{card.statusBadge}</div>
              )}
            </div>

            {/* Field Grid */}
            {card.fields && card.fields.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                {card.fields.map((field, fIdx) => (
                  <div
                    key={fIdx}
                    className={`min-w-0 ${field.fullWidth ? 'col-span-2' : ''} ${field.className || ''}`}
                  >
                    <span className="text-[11px] text-slate-400 block font-medium">
                      {field.label}
                    </span>
                    <div className="text-slate-700 font-medium flex items-center gap-1 mt-0.5 truncate">
                      {field.icon && (
                        <span className="text-slate-400 shrink-0">{field.icon}</span>
                      )}
                      <span className="truncate">{field.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Bar / Chevron */}
            {(renderedActions || isClickable) && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex-1 flex flex-wrap items-center gap-2">
                  {renderedActions}
                </div>
                {isClickable && !renderedActions && (
                  <span className="text-xs font-semibold text-[#B83B6F] flex items-center gap-0.5 ml-auto">
                    ดูรายละเอียด
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
