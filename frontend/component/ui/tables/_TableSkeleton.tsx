import { TABLE_ROW_BORDER_CLASS, SKELETON_ROWS_COUNT } from './Table.constants';
import { getColumnWidth } from './Table.utils';
import type { TableColumn } from './Table.types';
import { cn } from '@/lib/utils';


export interface TableSkeletonProps<T> {
  columns: TableColumn<T>[];
  selectable: boolean;
}

/**
 * Internal component for skeleton loading state
 * Displays animated placeholder rows while data is loading
 */
export function TableSkeleton<T extends Record<string, any>>({
  columns,
  selectable,
}: TableSkeletonProps<T>) {
  const pattern = [0.6, 0.4, 0.8, 0.5, 0.7];

  return (
    <tbody data-testid="table-skeleton-body">
      {Array.from({ length: SKELETON_ROWS_COUNT }).map((_, rowIndex) => (
        <tr key={`sk-${rowIndex}`} className={cn('animate-pulse', TABLE_ROW_BORDER_CLASS)}>
          {selectable && (
            <td className="px-4 py-1">
              <div className="h-5 w-5 rounded bg-muted" />
            </td>
          )}
          {columns.map((column, columnIndex) => {
            const align = column.align ?? 'left';
            const columnWidth = getColumnWidth(column);
            const widthRatio = pattern[columnIndex % pattern.length];
            const barWidth = Math.max(24, Math.floor(columnWidth * widthRatio));
            const bodyAlignClass =
              align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
            return (
              <td
                key={`skc-${String(column.key)}-${columnIndex}`}
                className={cn('px-4 py-1', TABLE_ROW_BORDER_CLASS, bodyAlignClass)}
                style={{
                  width: column.width || `${columnWidth}px`,
                  minWidth: `${columnWidth}px`,
                }}
              >
                <div className="h-6 rounded bg-muted" style={{ width: barWidth }} />
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  );
}
