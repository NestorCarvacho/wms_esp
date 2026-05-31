import { ROW_BORDER_STYLE, SKELETON_ROWS_COUNT, SKELETON_COLORS } from './Table.constants';
import { getColumnWidth } from './Table.utils';
import type { TableColumn } from './Table.types';


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
        <tr key={`sk-${rowIndex}`} className="animate-pulse" style={ROW_BORDER_STYLE}>
          {selectable && (
            <td className="px-4 py-1">
              <div
                className="h-5 w-5 rounded"
                style={{ backgroundColor: SKELETON_COLORS.box }}
              />
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
                className={`px-4 py-1 ${bodyAlignClass}`}
                style={{
                  ...ROW_BORDER_STYLE,
                  width: column.width || `${columnWidth}px`,
                  minWidth: `${columnWidth}px`,
                }}
              >
                <div
                  className="h-6 rounded"
                  style={{ width: barWidth, backgroundColor: SKELETON_COLORS.bar }}
                />
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  );
}
