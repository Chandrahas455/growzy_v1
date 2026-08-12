import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (row: T) => any;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  headerActions?: React.ReactNode;
  className?: string;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  searchPlaceholder = 'SEARCH RECORDS...',
  searchFields = [],
  onRowClick,
  emptyMessage = 'NO RECORDS FOUND.',
  headerActions,
  className,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((row) => {
        if (searchFields.length > 0) {
          return searchFields.some((field) => {
            const val = row[field];
            return val ? String(val).toLowerCase().includes(lowerSearch) : false;
          });
        }

        return Object.values(row).some((val) => {
          if (val === null || val === undefined) return false;
          if (typeof val === 'object') return false;
          return String(val).toLowerCase().includes(lowerSearch);
        });
      });
    }

    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      result.sort((a, b) => {
        let aVal = col?.accessor ? col.accessor(a) : (a as any)[sortKey];
        let bVal = col?.accessor ? col.accessor(b) : (b as any)[sortKey];

        if (aVal === null || aVal === undefined) aVal = '';
        if (bVal === null || bVal === undefined) bVal = '';

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortKey, sortDirection, columns, searchFields]);

  return (
    <div className={cn('space-y-4 font-mono', className)}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#18181B] p-4 border-b-2 border-[#3F3F46]">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-[#09090B] border-2 border-[#3F3F46] pl-9 pr-4 py-2 text-xs text-[#FAFAFA] uppercase placeholder-zinc-500 focus:outline-none focus:border-[#DFE104]"
          />
        </div>
        {headerActions && <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">{headerActions}</div>}
      </div>

      <div className="overflow-x-auto border-2 border-[#3F3F46] bg-[#09090B]">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="border-b-2 border-[#3F3F46] bg-[#18181B] text-[#A1A1AA] uppercase">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={cn(
                    'py-3.5 px-4 font-extrabold tracking-wider select-none',
                    col.sortable ? 'cursor-pointer hover:text-[#DFE104]' : '',
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                    col.className
                  )}
                >
                  <div className={cn('flex items-center space-x-1', col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start')}>
                    <span>{col.header}</span>
                    {col.sortable && sortKey === col.key && (
                      <span>{sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-[#3F3F46]">
            {filteredAndSortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-[#A1A1AA] uppercase text-xs">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredAndSortedData.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn(
                    'hover:bg-[#18181B] transition-colors',
                    onRowClick ? 'cursor-pointer' : ''
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'py-4 px-4 text-[#FAFAFA]',
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                        col.className
                      )}
                    >
                      {col.render ? col.render(row) : col.accessor ? col.accessor(row) : (row as any)[col.key]}
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
