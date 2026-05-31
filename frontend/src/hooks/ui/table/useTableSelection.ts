import { useCallback, useEffect, useMemo, useState } from 'react';

interface UseTableSelectionParams<T> {
  data: T[];
  getRowId: (row: T) => string | number;
  selectable: boolean;
  onSelectionChange?: (selected: T[]) => void;
  isLoading?: boolean;
}

export function useTableSelection<T>({
  data,
  getRowId,
  selectable,
  onSelectionChange,
  isLoading = false,
}: UseTableSelectionParams<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  useEffect(() => {
    if (!selectable) {
      setSelectedIds(new Set());
    }
  }, [selectable, data]);

  const selectedRows = useMemo(
    () => data.filter((row) => selectedIds.has(getRowId(row))),
    [data, selectedIds, getRowId],
  );

  useEffect(() => {
    if (selectable) {
      onSelectionChange?.(selectedRows);
    }
  }, [selectedRows, selectable, onSelectionChange]);

  const toggleRow = useCallback(
    (row: T) => {
      if (isLoading) return;
      const id = getRowId(row);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [getRowId, isLoading],
  );

  const toggleSelectAll = useCallback(() => {
    if (isLoading) return;
    setSelectedIds((prev) => {
      if (prev.size === data.length) return new Set();
      return new Set(data.map(getRowId));
    });
  }, [data, getRowId, isLoading]);

  const allVisibleSelected = data.length > 0 && selectedIds.size === data.length;

  return {
    selectedIds,
    allVisibleSelected,
    toggleSelectAll,
    toggleRow,
  };
}
