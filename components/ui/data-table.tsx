'use client'

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/cn'

export interface SortState {
  key: string
  direction: 'asc' | 'desc'
}

export interface TableColumn<T> {
  key: string
  header: React.ReactNode
  cell: (row: T) => React.ReactNode
  sortable?: boolean
  className?: string
  headerClassName?: string
}

/**
 * Shared table: a real table on desktop, stacked cards on mobile.
 * Sorting state stays with the page so it can also drive URL params later.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  sort,
  onSortChange,
  loading = false,
  skeletonRows = 6,
  mobileCard,
  empty,
  ariaLabel,
}: {
  columns: TableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  sort?: SortState
  onSortChange?: (key: string) => void
  loading?: boolean
  skeletonRows?: number
  mobileCard: (row: T) => React.ReactNode
  empty?: React.ReactNode
  ariaLabel: string
}) {
  if (!loading && rows.length === 0) {
    return <div className="p-4">{empty}</div>
  }

  return (
    <div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[900px] border-collapse text-left" aria-label={ariaLabel}>
          <thead>
            <tr className="border-b border-line">
              {columns.map((column) => {
                const active = sort?.key === column.key
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={
                      column.sortable
                        ? active
                          ? sort?.direction === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                        : undefined
                    }
                    className={cn(
                      'whitespace-nowrap px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-faint',
                      column.headerClassName,
                    )}
                  >
                    {column.sortable && onSortChange ? (
                      <button
                        type="button"
                        onClick={() => onSortChange(column.key)}
                        className="inline-flex items-center gap-1 rounded text-[11px] uppercase tracking-wide text-faint transition-colors hover:text-fg"
                      >
                        {column.header}
                        {active ? (
                          sort?.direction === 'asc' ? (
                            <ArrowUp className="size-3 text-accent" aria-hidden />
                          ) : (
                            <ArrowDown className="size-3 text-accent" aria-hidden />
                          )
                        ) : (
                          <ArrowUpDown className="size-3 opacity-50" aria-hidden />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: skeletonRows }, (_, index) => (
                  <tr key={`skeleton-${index}`} className="border-b border-line/60">
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3.5">
                        <Skeleton className="h-4 w-full max-w-[140px]" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => (
                  <tr
                    key={rowKey(row)}
                    className="border-b border-line/60 transition-colors last:border-0 hover:bg-white/[0.02]"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn('px-4 py-3 align-middle text-[13px] text-fg', column.className)}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-line/60 md:hidden">
        {loading
          ? Array.from({ length: 4 }, (_, index) => (
              <div key={`mobile-skeleton-${index}`} className="space-y-2 p-4">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))
          : rows.map((row) => <div key={rowKey(row)}>{mobileCard(row)}</div>)}
      </div>
    </div>
  )
}
