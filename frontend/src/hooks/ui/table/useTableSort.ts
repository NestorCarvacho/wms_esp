import { useCallback, useMemo, useState } from 'react';
import { tableValueCompare } from '@/components/ui/tables/Table.utils';
import type { SortDirection, SortState, TableColumn } from '@/components/ui/tables/Table.types';

interface UseTableSortParams<T> {
  data: T[];
  columns: TableColumn<T>[];
  initialSort?: { key: string; direction: SortDirection };
  serverSideSort?: boolean;
  onSortChange?: (key: string, direction: SortDirection) => void;
  isLoading?: boolean;
}

export function useTableSort<T extends Record<string, unknown>>({
  data,
  columns,
  initialSort,
  serverSideSort = false,
  onSortChange,
  isLoading = false,
}: UseTableSortParams<T>) {
  const [sort, setSort] = useState<SortState | undefined>(
    initialSort ? { key: initialSort.key, direction: initialSort.direction } : undefined,
  );

  const handleSort = useCallback(
    (column: TableColumn<T>) => {
      if (isLoading || !column.sortable) return;

      const key = String(column.key);
      setSort((prev) => {
        const nextDirection: SortDirection =
          prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc';
        onSortChange?.(key, nextDirection);
        return { key, direction: nextDirection };
      });
    },
    [isLoading, onSortChange],
  );

  const sortedData = useMemo(() => {
    if (serverSideSort || !sort) return data;

    const column = columns.find((c) => String(c.key) === sort.key);
    if (!column?.sortable) return data;

    return [...data].sort((rowA, rowB) => {
      const valueA = (rowA as Record<string, unknown>)[sort.key];
      const valueB = (rowB as Record<string, unknown>)[sort.key];
      return tableValueCompare(valueA, valueB, sort.direction);
    });
  }, [data, sort, columns, serverSideSort]);

  return { sortedData, sort, handleSort };
}
