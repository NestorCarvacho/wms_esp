import { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/cards/Card';
import { useTableColumns, useTableSort, useTableSelection } from '@/hooks/ui/table';
import { TableHeader } from './_TableHeader';
import { TableContainer, TableBody } from './_TableBody';
import { TableFooter } from './_TableFooter';
import { TableSkeleton } from './_TableSkeleton';
import type { TableProps } from './Table.types';

// Re-export types for convenience
export type {
  TableProps,
  TableColumn,
  TableAction,
  TablePagination,
  ColumnAlign,
  OverflowStrategy,
  SortDirection,
  ExpandableConfig,
  DetailField,
} from './Table.types';

/**
 * Tabla WMS — motor React + [shadcn/ui Table](https://ui.shadcn.com/docs/components/table).
 * Paginación y búsqueda en servidor vía props; sin DataTables.net.
 */
export function Table<T extends Record<string, any>>({
  columns,
  data,
  totalRows,
  pagination,
  searchable = true,
  searchPlaceholder = 'Buscar contenido',
  onSearch,
  initialSort,
  onSortChange,
  serverSideSort = false,
  selectable = false,
  onSelectionChange,
  getRowId,
  className = '',
  style,
  emptyMessage = 'Sin registros',
  'data-testid': dataTestId,
  isLoading = false,
  actions,
  actionsHeader,
  expandable,
}: TableProps<T>) {
  const chosenIdKey = useMemo(() => {
    if (!data || data.length === 0) return undefined as string | undefined;
    const candidates = ['id', 'uuid', '_id', 'key'];
    return candidates.find((key) =>
      data.every((row: any) => row?.[key] !== undefined && row?.[key] !== null),
    );
  }, [data]);

  const effectiveGetRowId = useMemo<NonNullable<TableProps<T>['getRowId']>>(() => {
    if (getRowId) return getRowId;
    if (chosenIdKey) {
      return (row: T) => (row as any)[chosenIdKey] as string | number;
    }
    return (row: T) => JSON.stringify(row);
  }, [getRowId, chosenIdKey]);

  const [searchValue, setSearchValue] = useState('');
  const [expandedRowKeys, setExpandedRowKeys] = useState<Set<string | number>>(new Set());

  const handleSearchChange = useCallback(
    (value: string) => {
      if (isLoading) return;
      setSearchValue(value);
      onSearch?.(value);
    },
    [onSearch, isLoading],
  );

  const toggleRowExpanded = useCallback((rowId: string | number) => {
    setExpandedRowKeys((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  }, []);

  const { effectiveColumns, minTableWidth } = useTableColumns({
    columns,
    actions,
    actionsHeader,
    selectable,
  });

  const { sortedData, sort, handleSort } = useTableSort({
    data,
    columns: effectiveColumns,
    initialSort,
    serverSideSort,
    onSortChange,
    isLoading,
  });

  const { selectedIds, allVisibleSelected, toggleSelectAll, toggleRow } = useTableSelection({
    data,
    getRowId: effectiveGetRowId,
    selectable,
    onSelectionChange,
    isLoading,
  });

  const hasExpandableRows = useMemo(() => {
    if (!expandable) return false;
    if (!expandable.rowExpandable) return data.length > 0;
    return data.some((row) => expandable.rowExpandable!(row));
  }, [expandable, data]);

  const effectiveExpandable = hasExpandableRows ? expandable : undefined;

  const bodyKey = useMemo(() => {
    if (pagination) {
      return `p:${pagination.page}-s:${pagination.pageSize}`;
    }
    return `len:${data.length}`;
  }, [pagination, data.length]);

  return (
    <Card
      elevation={1}
      padding="16px 0"
      className={`flex flex-col gap-4 relative ${className}`}
      style={style}
      data-testid={dataTestId}
      borderRadius="24px"
    >
      <TableHeader
        searchable={searchable}
        searchValue={searchValue}
        placeholder={searchPlaceholder}
        onSearchChange={handleSearchChange}
        disabled={isLoading}
      />
      <TableContainer
        columns={effectiveColumns}
        selectable={selectable}
        allVisibleSelected={allVisibleSelected}
        onToggleSelectAll={() => {
          if (!isLoading) toggleSelectAll();
        }}
        onSort={(column) => {
          if (!isLoading) handleSort(column);
        }}
        sort={sort}
        disabled={isLoading}
        minTableWidth={minTableWidth}
        expandable={effectiveExpandable}
      >
        {isLoading ? (
          <TableSkeleton columns={effectiveColumns} selectable={selectable} />
        ) : (
          <TableBody
            key={bodyKey}
            data={sortedData}
            columns={effectiveColumns}
            selectable={selectable}
            selectedIds={selectedIds}
            toggleRow={toggleRow}
            getRowId={effectiveGetRowId}
            emptyMessage={emptyMessage}
            disabled={isLoading}
            expandable={effectiveExpandable}
            expandedRowKeys={expandedRowKeys}
            toggleRowExpanded={toggleRowExpanded}
          />
        )}
      </TableContainer>
      <TableFooter
        pageInfo={
          pagination
            ? {
                current: pagination.page,
                pageSize: pagination.pageSize,
                total: pagination.total,
              }
            : null
        }
        onChangePage={isLoading ? undefined : pagination?.onChange}
        onChangePageSize={isLoading ? undefined : pagination?.onPageSizeChange}
        totalRows={totalRows}
        disabled={isLoading}
      />
    </Card>
  );
}

export default Table;
