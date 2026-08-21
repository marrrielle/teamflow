import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export interface DataTableColumn<TRow> {
  id: string;
  header: string;
  accessor: (row: TRow) => ReactNode;
  className?: string;
}

interface DataTableProps<TRow> {
  data: readonly TRow[];
  columns: readonly DataTableColumn<TRow>[];
  getRowId: (row: TRow) => string;
  onRowClick?: (row: TRow) => void;
  emptyState?: ReactNode;
}

export function DataTable<TRow>({ data, columns, getRowId, onRowClick, emptyState }: DataTableProps<TRow>) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
          <tr>
            {columns.map((column) => (
              <th key={column.id} className={cn('px-4 py-2 font-medium', column.className)}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {data.map((row) => (
            <tr
              key={getRowId(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={
                onRowClick
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onRowClick(row);
                      }
                    }
                  : undefined
              }
              tabIndex={onRowClick ? 0 : undefined}
              className={cn(
                onRowClick && 'cursor-pointer hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:hover:bg-neutral-900',
              )}
            >
              {columns.map((column) => (
                <td key={column.id} className={cn('px-4 py-3', column.className)}>
                  {column.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
