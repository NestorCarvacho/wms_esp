import { useState, useCallback, useMemo } from 'react';
import { tableValueCompare } from '@/components/ui/tables/Table.utils.tsx';
import type { TableColumn, SortState, SortDirection } from '@/components/ui/tables/Table.types';


export interface UseTableSortOptions<T> {
  data: T[];
  columns: TableColumn<T>[];
  initialSort?: { key: string; direction: SortDirection };
  serverSideSort?: boolean;
  onSortChange?: (key: string, direction: SortDirection) => void;
  isLoading?: boolean;
}

export interface UseTableSortReturn<T> {
  sortedData: T[];
  sort: SortState | undefined;
  handleSort: (column: TableColumn<T>) => void;
}

/**
 * Hook to manage table sorting state and logic
 * Supports both client-side and server-side sorting
 */
export function useTableSort<T extends Record<string, any>>(
  options: UseTableSortOptions<T>,
): UseTableSortReturn<T> {
  const {
    data,
    columns,
    initialSort,
    serverSideSort = false,
    onSortChange,
    isLoading = false,
  } = options;

  const [sort, setSort] = useState<SortState | undefined>(initialSort);

  const handleSort = useCallback(
    (column: TableColumn<T>) => {
      if (isLoading || !column.sortable) return;

      const key = String(column.key);
      setSort((previousSort) => {
        let direction: SortDirection = 'asc';
        if (previousSort?.key === key) {
          direction = previousSort.direction === 'asc' ? 'desc' : 'asc';
        }
        const nextSort = { key, direction };
        onSortChange?.(nextSort.key, nextSort.direction);
        return nextSort;
      });
    },
    [onSortChange, isLoading],
  );

  const sortedData = useMemo(() => {
    if (serverSideSort || !sort) return data;

    const column = columns.find((col) => String(col.key) === sort.key);
    if (!column) return data;

    return [...data].sort((rowA, rowB) =>
      tableValueCompare(
        (rowA as any)[column.key as any],
        (rowB as any)[column.key as any],
        sort.direction,
      ),
    );
  }, [data, sort, columns, serverSideSort]);

  return {
    sortedData,
    sort,
    handleSort,
  };
}
