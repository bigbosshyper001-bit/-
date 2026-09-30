import React from 'react';
import type { TableColumn } from '../../types.ts';
import { DataTable, type DataTableProps } from './DataTable.tsx';
import { ResponsiveCardList, type ResponsiveCardItem } from '../common/ResponsiveCardList.tsx';
import { Pagination } from './Pagination.tsx';

export interface ResponsiveTableProps<T extends Record<string, any>> extends DataTableProps<T> {
  /**
   * Optional custom card renderer for mobile.
   * If provided, transforms each record `item` into a mobile card item.
   * If omitted, an automatic card mapping is generated from `columns`.
   */
  renderCard?: (item: T, index: number) => ResponsiveCardItem<T>;
  /**
   * On mobile card click handler (e.g. to open detail modal or drawer)
   */
  onRowClick?: (item: T) => void;
  /**
   * Custom empty text message alias
   */
  emptyMessage?: string;
}

export function ResponsiveTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  renderCard,
  onRowClick,
  isLoading,
  error,
  onRetry,
  emptyText,
  emptyMessage,
  selectable,
  selectedKeys,
  onSelectionChange,
  sortColumn,
  sortDirection,
  onSort,
  pagination,
  className = '',
}: ResponsiveTableProps<T>) {
  const resolvedEmptyText = emptyText || emptyMessage || 'ไม่พบข้อมูลในระบบ';
  // Mobile Card items generation
  const cardItems: ResponsiveCardItem<T>[] = data.map((item, index) => {
    if (renderCard) {
      const customCard = renderCard(item, index);
      const rowKey = customCard.key ?? customCard.id ?? keyExtractor(item, index);
      return {
        ...customCard,
        key: rowKey,
        rawItem: customCard.rawItem ?? item,
        onClick: customCard.onClick ?? (onRowClick ? () => onRowClick(item) : undefined),
      };
    }

    // Auto card fallback from columns
    const titleCol = columns.find(
      (c) => c.key === 'title' || c.key === 'name' || c.key === 'topic' || c.key === 'label'
    ) || columns[0];

    const statusCol = columns.find(
      (c) => c.key === 'status' || c.key === 'state' || c.key === 'level'
    );

    const otherCols = columns.filter(
      (c) => c !== titleCol && c !== statusCol && c.key !== 'actions' && c.key !== 'manage'
    );

    const rowKey = keyExtractor(item, index);
    const isSelected = selectedKeys?.includes(rowKey);

    return {
      key: rowKey,
      rawItem: item,
      highlighted: isSelected,
      onClick: onRowClick ? () => onRowClick(item) : undefined,
      title: titleCol ? (titleCol.render ? titleCol.render(item, index) : item[titleCol.key]) : `รายการที่ ${index + 1}`,
      statusBadge: statusCol ? (statusCol.render ? statusCol.render(item, index) : item[statusCol.key]) : undefined,
      fields: otherCols.slice(0, 4).map((col) => ({
        label: col.title,
        value: col.render ? col.render(item, index) : (item[col.key] ?? '-'),
      })),
      actions: columns.find((c) => c.key === 'actions' || c.key === 'manage')?.render?.(item, index),
    };
  });

  return (
    <div className="w-full" id="responsive-table-wrapper">
      {/* 1. Desktop & Tablet View (md and up): Standard Dense Data Table */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={data}
          keyExtractor={keyExtractor}
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          emptyText={resolvedEmptyText}
          selectable={selectable}
          selectedKeys={selectedKeys}
          onSelectionChange={onSelectionChange}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={onSort}
          pagination={pagination}
          className={className}
        />
      </div>

      {/* 2. Mobile View (< md): High-readability Touch Card List */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse space-y-3"
              >
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div className="h-3 bg-slate-100 rounded" />
                  <div className="h-3 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-rose-200 p-6 text-center">
            <p className="text-xs text-rose-600 font-semibold">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                ลองใหม่อีกครั้ง
              </button>
            )}
          </div>
        ) : (
          <>
            <ResponsiveCardList items={cardItems} emptyText={resolvedEmptyText} />
            {pagination && (
              <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  pageSize={pagination.pageSize}
                  onPageChange={pagination.onPageChange}
                  onPageSizeChange={pagination.onPageSizeChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
