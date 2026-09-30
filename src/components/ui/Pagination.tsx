import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className = '',
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 select-none py-3 px-4 bg-white border-t border-slate-100 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span>
          แสดง <strong className="font-semibold text-slate-800">{startItem}-{endItem}</strong> จากทั้งหมด{' '}
          <strong className="font-semibold text-slate-800">{totalItems}</strong> รายการ
        </span>
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-3">
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">แถวต่อหน้า:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-[#FFDCE8] rounded px-2 py-1 text-xs outline-none focus:border-[#E11463]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-[#FFDCE8] bg-white hover:bg-[#FFF0F5] hover:text-[#E11463] text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="หน้าก่อนหน้า"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
          let pageNum = idx + 1;
          if (totalPages > 5 && currentPage > 3) {
            pageNum = currentPage - 3 + idx;
            if (pageNum > totalPages) pageNum = totalPages - (4 - idx);
          }
          if (pageNum < 1 || pageNum > totalPages) return null;

          const isCurrent = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[30px] h-[30px] rounded-lg text-xs font-medium transition-colors flex items-center justify-center cursor-pointer
                ${
                  isCurrent
                    ? 'bg-[#E11463] text-white font-semibold shadow-xs'
                    : 'bg-white border border-[#FFDCE8] hover:bg-[#FFF0F5] hover:text-[#E11463] text-slate-700'
                }
              `}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="หน้าถัดไป"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
