import * as React from 'react';
import { Checkbox } from '@/components/ui/inputs/Checkbox';
import { Text } from '@/components/ui/text/Text';
import { IconScout } from '@/components/ui/images/IconScout';
import {
  Table as UiTable,
  TableHeader as UiTableHeader,
  TableBody as UiTableBody,
  TableRow as UiTableRow,
  TableHead as UiTableHead,
  TableCell as UiTableCell,
} from '@/components/ui/shadcn/table';
import { cn } from '@/lib/utils';
import { TABLE_PALETTE, ROW_BORDER_STYLE } from './Table.constants';
import { resolveCellContent, getAlignmentClasses, getColumnWidth } from './Table.utils';
import { TableCell } from './_TableCell';
import { ExpandedRowDetails } from './ExpandedRowDetails';
import type { TableColumn, SortState, ExpandableConfig } from './Table.types';


export interface TableContainerProps<T> {
  columns: TableColumn<T>[];
  selectable: boolean;
  allVisibleSelected: boolean;
  onToggleSelectAll: () => void;
  onSort: (col: TableColumn<T>) => void;
  sort: SortState | undefined;
  children: React.ReactNode;
  disabled?: boolean;
  minTableWidth: number;
  expandable?: ExpandableConfig<T>;
}

/**
 * Internal component for table container with header
 * Maintains responsivity with overflow-x-auto
 */
export function TableContainer<T extends Record<string, any>>({
  columns,
  selectable,
  allVisibleSelected,
  onToggleSelectAll,
  onSort,
  sort,
  children,
  disabled = false,
  minTableWidth,
  expandable,
}: TableContainerProps<T>) {
  return (
    <div className="px-4">
      <UiTable
        className="border-collapse"
        style={{
          borderSpacing: 0,
          minWidth: `${minTableWidth}px`,
          tableLayout: 'fixed',
        }}
      >
        <UiTableHeader>
          <UiTableRow className="text-left hover:bg-transparent">
            {expandable?.showExpandColumn !== false && expandable && (
              <UiTableHead className="w-10" style={ROW_BORDER_STYLE} />
            )}
            {selectable && (
              <UiTableHead className="w-10" style={ROW_BORDER_STYLE}>
                <Checkbox
                  checked={allVisibleSelected}
                  onChange={() => !disabled && onToggleSelectAll()}
                  data-testid="checkbox-all"
                  disabled={disabled}
                />
              </UiTableHead>
            )}
            {columns.map((column) => {
              const isActive = sort?.key === String(column.key);
              const interactiveClass = column.sortable
                ? disabled
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer'
                : '';
              const align = column.align ?? 'left';
              const columnWidth = getColumnWidth(column);
              const ariaSort = column.sortable
                ? isActive
                  ? sort.direction === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
                : undefined;
              const { text: alignClass, justify: justifyClass } = getAlignmentClasses(align);
              return (
                <UiTableHead
                  key={String(column.key)}
                  onClick={() => column.sortable && !disabled && onSort(column)}
                  onKeyDown={(event) => {
                    if (!disabled && column.sortable && (event.key === 'Enter' || event.key === ' ')) {
                      event.preventDefault();
                      onSort(column);
                    }
                  }}
                  tabIndex={column.sortable && !disabled ? 0 : -1}
                  aria-sort={ariaSort as React.AriaAttributes['aria-sort']}
                  scope="col"
                  className={cn(
                    'h-auto py-2 font-medium text-slate-900 select-none whitespace-nowrap',
                    interactiveClass,
                    alignClass,
                    'focus:outline-none focus:ring-2',
                  )}
                  aria-disabled={disabled || undefined}
                  style={{
                    ...ROW_BORDER_STYLE,
                    width: column.width || `${columnWidth}px`,
                    minWidth: `${columnWidth}px`,
                    maxWidth: column.width || `${columnWidth}px`,
                  }}
                >
                  <div className={`flex gap-1 items-center ${justifyClass}`}>
                    <Text variant="subheader-medium" color={TABLE_PALETTE.headerText} className="truncate">
                      {column.header}
                    </Text>
                    {column.sortable && (
                      <IconScout
                        name={isActive ? (sort.direction === 'asc' ? 'arrowUp' : 'arrowDown') : 'arrowUp'}
                        size="lg"
                        color={TABLE_PALETTE.arrow}
                        className={cn('transition-transform', !isActive && 'opacity-40')}
                      />
                    )}
                  </div>
                </UiTableHead>
              );
            })}
          </UiTableRow>
        </UiTableHeader>
        {children}
      </UiTable>
    </div>
  );
}

export interface TableBodyProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  selectable: boolean;
  selectedIds: Set<string | number>;
  toggleRow: (row: T) => void;
  getRowId: (row: T) => string | number;
  emptyMessage: string;
  disabled?: boolean;
  expandable?: ExpandableConfig<T>;
  expandedRowKeys?: Set<string | number>;
  toggleRowExpanded?: (rowId: string | number) => void;
}

/**
 * Internal component for table body with rows and cells
 * Uses TableCell for consistent rendering with improvements
 */
export function TableBody<T extends Record<string, any>>({
  data,
  columns,
  selectable,
  selectedIds,
  toggleRow,
  getRowId,
  emptyMessage,
  disabled = false,
  expandable,
  expandedRowKeys,
  toggleRowExpanded,
}: TableBodyProps<T>) {
  const colSpan =
    columns.length +
    (selectable ? 1 : 0) +
    (expandable?.showExpandColumn !== false && expandable ? 1 : 0);

  return (
    <UiTableBody>
      {data.length === 0 && (
        <UiTableRow className="hover:bg-transparent">
          <UiTableCell colSpan={colSpan} className="py-4 text-center" style={ROW_BORDER_STYLE}>
            <Text variant="subheader-regular" color={TABLE_PALETTE.rowText}>
              {emptyMessage}
            </Text>
          </UiTableCell>
        </UiTableRow>
      )}
      {data.map((row) => {
        const id = getRowId(row);
        const isExpanded = expandedRowKeys?.has(id) ?? false;
        const canExpand = expandable?.rowExpandable ? expandable.rowExpandable(row) : true;
        const showExpandable = expandable && canExpand;

        return (
          <React.Fragment key={String(id)}>
            <UiTableRow
              className="hover:bg-[var(--row-hover)]"
              style={ROW_BORDER_STYLE}
            >
              {expandable?.showExpandColumn !== false && expandable && (
                <UiTableCell className="py-2">
                  {canExpand && (
                    <button
                      type="button"
                      onClick={() => !disabled && toggleRowExpanded?.(id)}
                      className="flex items-center justify-center w-6 h-6"
                      disabled={disabled}
                      aria-label={isExpanded ? 'Colapsar fila' : 'Expandir fila'}
                      data-testid={`expand-button-${id}`}
                    >
                      <IconScout
                        name={isExpanded ? 'angleUp' : 'angleDown'}
                        size="lg"
                        color="currentColor"
                        className="text-orange-600"
                      />
                    </button>
                  )}
                </UiTableCell>
              )}
              {selectable && (
                <UiTableCell className="py-2">
                  <Checkbox
                    checked={selectedIds.has(id)}
                    onChange={() => !disabled && toggleRow(row)}
                    data-testid={`checkbox-${id}`}
                    disabled={disabled}
                  />
                </UiTableCell>
              )}
              {columns.map((column) => {
                const align = column.align ?? 'left';
                const columnWidth = getColumnWidth(column);
                const strategy = column.overflowStrategy ?? 'truncate';
                const rawValue: unknown = column.render
                  ? column.render(row)
                  : (row as Record<string, unknown>)[column.key as string];
                const value = resolveCellContent(rawValue);
                const { text: bodyAlignClass } = getAlignmentClasses(align);

                return (
                  <UiTableCell
                    key={String(column.key)}
                    className={cn(
                      'py-2',
                      bodyAlignClass,
                      strategy === 'truncate' && 'max-w-0 overflow-hidden',
                    )}
                    style={{
                      ...ROW_BORDER_STYLE,
                      width: column.width || `${columnWidth}px`,
                      minWidth: `${columnWidth}px`,
                      maxWidth: column.width || `${columnWidth}px`,
                    }}
                  >
                    <TableCell strategy={strategy} width={column.width || columnWidth} align={align}>
                      {value}
                    </TableCell>
                  </UiTableCell>
                );
              })}
            </UiTableRow>
            {showExpandable && isExpanded && (
              <UiTableRow className="hover:bg-transparent">
                <UiTableCell colSpan={colSpan} className="py-0" style={ROW_BORDER_STYLE}>
                  <div className="pl-24">
                    <ExpandedRowDetails fields={expandable.getExpandedFields(row)} />
                  </div>
                </UiTableCell>
              </UiTableRow>
            )}
          </React.Fragment>
        );
      })}
    </UiTableBody>
  );
}
