import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-surface-200 px-4 py-3 sm:px-6 mt-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn-secondary text-xs px-3 py-1.5"
        >
          Previous
        </button>
        <span className="text-xs font-medium text-surface-600 flex items-center">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="btn-secondary text-xs px-3 py-1.5"
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-surface-600">
            Page <span className="font-semibold text-surface-900">{page}</span> of{' '}
            <span className="font-semibold text-surface-900">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="relative inline-flex items-center rounded-l-lg px-2.5 py-1.5 text-surface-500 border border-surface-200 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && p - prev > 1;
                return (
                  <React.Fragment key={p}>
                    {showEllipsis && (
                      <span className="relative inline-flex items-center px-3 py-1.5 text-xs text-surface-400 border border-surface-200 bg-white">
                        ...
                      </span>
                    )}
                    <button
                      onClick={() => onPageChange(p)}
                      className={`relative inline-flex items-center px-3 py-1.5 text-xs font-semibold border ${
                        p === page
                          ? 'z-10 bg-primary-600 text-white border-primary-600'
                          : 'border-surface-200 text-surface-700 bg-white hover:bg-surface-50'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="relative inline-flex items-center rounded-r-lg px-2.5 py-1.5 text-surface-500 border border-surface-200 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
