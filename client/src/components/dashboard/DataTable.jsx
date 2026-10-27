import React from 'react';
import LoadingState from '../common/LoadingState';
import EmptyState from '../common/EmptyState';

export default function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = 'No data available',
  emptyTitle = 'No records',
  keyField = '_id',
}) {
  if (isLoading) {
    return (
      <div className="card border border-surface-200 overflow-hidden bg-white">
        <LoadingState message="Loading table data..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card border border-surface-200 overflow-hidden bg-white">
        <EmptyState title={emptyTitle} description={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="card border border-surface-200 overflow-hidden bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-200 bg-surface-50/75">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-surface-600 ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {data.map((row, rowIdx) => (
              <tr key={row[keyField] || rowIdx} className="hover:bg-surface-50/60 transition-colors">
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`py-3.5 px-4 text-sm text-surface-700 ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
