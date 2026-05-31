import { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/cards/Card';
import { TABLE_PALETTE } from './Table.constants';
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
 * Advanced table component with sorting, pagination, selection, search, and actions
 * 
 * @example
 * ```tsx
 * <Table
 *   data={users}
 *   columns={[
 *     { key: 'name', header: 'Name', sortable: true },
 *     { key: 'email', header: 'Email' },
 *   ]}
 *   totalRows={100}
 *   searchable
 *   onSearch={handleSearch}
 *   pagination={{
 *     page: 1,
 *     pageSize: 10,
 *     total: 100,
 *     onChange: handlePageChange,
 *   }}
 * />
 * ```
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
  // Auto-detect row ID function
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

  // Local state for search and expanded rows
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

  // Use custom hooks for table logic
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

  // Auto-detect if any row is expandable
  const hasExpandableRows = useMemo(() => {
    if (!expandable) return false;
    if (!expandable.rowExpandable) return data.length > 0;
    return data.some((row) => expandable.rowExpandable!(row));
  }, [expandable, data]);

  // Effective expandable config: only show if there are expandable rows
  const effectiveExpandable = hasExpandableRows ? expandable : undefined;

  // Body key for forcing remount on page change
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
      style={{
        ...style,
        ['--row-hover' as any]: TABLE_PALETTE.rowHover,
      }}
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
