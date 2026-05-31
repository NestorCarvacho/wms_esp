import { useState, useCallback, useMemo } from 'react';


export interface UseTableSelectionOptions<T> {
  data: T[];
  getRowId: (row: T) => string | number;
  selectable: boolean;
  onSelectionChange?: (selected: T[]) => void;
  isLoading?: boolean;
}

export interface UseTableSelectionReturn<T> {
  selectedIds: Set<string | number>;
  allVisibleSelected: boolean;
  toggleSelectAll: () => void;
  toggleRow: (row: T) => void;
}

/**
 * Hook to manage table row selection state and logic
 * Handles single row selection, select all, and selection callbacks
 */
export function useTableSelection<T extends Record<string, any>>(
  options: UseTableSelectionOptions<T>,
): UseTableSelectionReturn<T> {
  const { data, getRowId, selectable, onSelectionChange, isLoading = false } = options;

  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  const allVisibleSelected = useMemo(() => (
    selectable &&
      data.length > 0 &&
      selectedIds.size >= data.length &&
      data.every((row) => selectedIds.has(getRowId(row)))
  ), [selectable, data, selectedIds, getRowId]);

  const toggleSelectAll = useCallback(() => {
    if (!selectable || isLoading) return;

    setSelectedIds((previousSelectedIds) => {
      let allSelected = true;
      if (previousSelectedIds.size < data.length) {
        allSelected = false;
      } else {
        for (const row of data) {
          if (!previousSelectedIds.has(getRowId(row))) {
            allSelected = false;
            break;
          }
        }
      }

      const nextSelectedIds = new Set(previousSelectedIds);
      if (allSelected) {
        for (const row of data) nextSelectedIds.delete(getRowId(row));
      } else {
        for (const row of data) nextSelectedIds.add(getRowId(row));
      }

      onSelectionChange?.(data.filter((row) => nextSelectedIds.has(getRowId(row))));
      return nextSelectedIds;
    });
  }, [selectable, data, getRowId, onSelectionChange, isLoading]);

  const toggleRow = useCallback(
    (row: T) => {
      if (!selectable || isLoading) return;

      const id = getRowId(row);
      setSelectedIds((previousSelectedIds) => {
        const nextSelectedIds = new Set(previousSelectedIds);
        if (nextSelectedIds.has(id)) {
          nextSelectedIds.delete(id);
        } else {
          nextSelectedIds.add(id);
        }
        onSelectionChange?.(data.filter((r) => nextSelectedIds.has(getRowId(r))));
        return nextSelectedIds;
      });
    },
    [selectable, getRowId, data, onSelectionChange, isLoading],
  );

  return {
    selectedIds,
    allVisibleSelected,
    toggleSelectAll,
    toggleRow,
  };
}
