import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';

export default function Table({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = 'Filter records...',
  emptyMessage = 'No records found.',
  rowKey = '_id',
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    if (!key) return;
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const processedData = useMemo(() => {
    const safeArray = Array.isArray(data) ? data : [];
    let filtered = safeArray;

    if (searchable && searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = safeArray.filter((row) =>
        columns.some((col) => {
          if (!col.accessor) return false;
          const val = row[col.accessor];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(lower);
        })
      );
    }

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, columns, searchable, searchTerm, sortConfig]);

  return (
    <div className="space-y-3">
      {searchable && (
        <div className="relative max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/70 border-b border-gray-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-300">
              {columns.map((col, idx) => (
                <th
                  key={col.accessor || idx}
                  onClick={() => col.sortable !== false && handleSort(col.accessor)}
                  className={`px-4 py-3 select-none ${
                    col.sortable !== false && col.accessor ? 'cursor-pointer hover:text-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable !== false && col.accessor && (
                      <span className="text-gray-400">
                        {sortConfig.key === col.accessor ? (
                          sortConfig.direction === 'asc' ? (
                            <ArrowUp size={13} />
                          ) : (
                            <ArrowDown size={13} />
                          )
                        ) : (
                          <ArrowUpDown size={13} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {processedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-500 dark:text-slate-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              processedData.map((row, rIndex) => (
                <tr
                  key={row[rowKey] || rIndex}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition"
                >
                  {columns.map((col, cIndex) => (
                    <td key={col.accessor || cIndex} className="px-4 py-3 whitespace-nowrap">
                      {col.render ? col.render(row) : row[col.accessor] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
