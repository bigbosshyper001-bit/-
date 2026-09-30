import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { TableColumn } from '../../types.ts';
import { Pagination } from './Pagination.tsx';
import { EmptyState, ErrorState } from './EmptyState.tsx';

export interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string | number;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyText?: string;
  selectable?: boolean;
  selectedKeys?: (string | number)[];
  onSelectionChange?: (keys: (string | number)[]) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  error,
  onRetry,
  emptyText = 'ไม่พบข้อมูลในระบบ',
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  sortColumn,
  sortDirection,
  onSort,
  pagination,
  className = '',
}: DataTableProps<T>) {
  const allKeys = data.map((item, index) => keyExtractor(item, index));
  const isAllSelected = allKeys.length > 0 && allKeys.every((k) => selectedKeys.includes(k));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(allKeys);
    }
  };

  const toggleSelectRow = (key: string | number) => {
    if (selectedKeys.includes(key)) {
      onSelectionChange?.(selectedKeys.filter((k) => k !== key));
    } else {
      onSelectionChange?.([...selectedKeys, key]);
    }
  };

  return (
    <div className={`w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FAFAFC] border-b border-slate-200/80 text-xs font-semibold text-slate-700 select-none">
              {selectable && (
                <th className="w-10 px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-[#D94F87] focus:ring-[#D94F87] cursor-pointer accent-[#D94F87]"
                  />
                </th>
              )}
              {columns.map((col) => {
                const isSorted = sortColumn === col.key;
                return (
                  <th
                    key={String(col.key)}
                    style={{ width: col.width }}
                    className={`px-4 py-3.5 tracking-tight ${
                      col.align === 'center'
                        ? 'text-center'
                        : col.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                    } ${col.sortable ? 'cursor-pointer hover:bg-slate-100 transition-colors' : ''}`}
                    onClick={() => col.sortable && onSort?.(String(col.key))}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'center'
                          ? 'justify-center'
                          : col.align === 'right'
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <span>{col.title}</span>
                      {col.sortable && (
                        <span className="text-slate-400">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-[#D94F87]" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-[#D94F87]" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  {selectable && (
                    <td className="px-4 py-3.5">
                      <div className="w-4 h-4 bg-slate-100 rounded" />
                    </td>
                  )}
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-4 py-3.5">
                      <div className="h-4 bg-slate-100 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="p-8 text-center"
                >
                  <ErrorState
                    title="เกิดข้อผิดพลาดในการโหลดตารางข้อมูล"
                    message={error}
                    onRetry={onRetry}
                    className="border-0 shadow-none bg-transparent p-4"
                  />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="p-8 text-center"
                >
                  <EmptyState
                    title={emptyText}
                    description="ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหาหรือตัวกรองที่เลือก"
                    className="border-0 shadow-none bg-transparent p-4"
                  />
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const rowKey = keyExtractor(row, index);
                const isSelected = selectedKeys.includes(rowKey);

                return (
                  <tr
                    key={rowKey}
                    className={`transition-colors duration-100 ${
                      isSelected ? 'bg-[#FBE7EF]/30' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {selectable && (
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(rowKey)}
                          className="w-4 h-4 rounded border-slate-300 text-[#D94F87] focus:ring-[#D94F87] cursor-pointer accent-[#D94F87]"
                        />
                      </td>
                    )}
                    {columns.map((col) => {
                      return (
                        <td
                          key={String(col.key)}
                          className={`px-4 py-3 ${
                            col.align === 'center'
                              ? 'text-center'
                              : col.align === 'right'
                              ? 'text-right'
                              : 'text-left'
                          }`}
                        >
                          {col.render
                            ? col.render(row, index)
                            : (row as any)[col.key] ?? '-'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      )}
    </div>
  );
}
