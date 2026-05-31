import * as React from 'react';
import { Text } from '@/components/ui/text/Text';
import { TABLE_PALETTE, PAGINATION_CONFIG, MIN_TABLE_WIDTH, CHECKBOX_COLUMN_WIDTH, COLUMN_PADDING, DEFAULT_COLUMN_WIDTH, ACTIONS_COLUMN_WIDTH } from './Table.constants';
import type { TableColumn, PageToken, PaginationWindowArgs, AlignmentClasses, ColumnAlign } from './Table.types';

// Re-export for convenience
export { ACTIONS_COLUMN_WIDTH };

/**
 * Compares two values for table sorting
 * Handles null/undefined, different types, and sort direction
 */
export function tableValueCompare(
  valueA: any,
  valueB: any,
  direction: 'asc' | 'desc',
): number {
  const isANull = valueA === null || valueA === undefined;
  const isBNull = valueB === null || valueB === undefined;

  if (isANull && isBNull) return 0;
  if (isANull) return 1;
  if (isBNull) return -1;

  const multiplier = direction === 'asc' ? 1 : -1;

  if (valueA === valueB) return 0;
  return (valueA < valueB ? -1 : 1) * multiplier;
}

/**
 * Resolves cell content to a React node with proper formatting
 * Handles primitives, React elements, null/undefined, objects, etc.
 */
export function resolveCellContent(rawValue: any): React.ReactNode {
  // Preserve provided React elements (from custom render functions)
  if (React.isValidElement(rawValue)) return rawValue;

  const type = typeof rawValue;

  // Nullish / empty string -> empty span maintaining line height
  if (rawValue === null || rawValue === undefined || rawValue === '') {
    return (
      <Text variant="subheader-regular" color={TABLE_PALETTE.rowText} as="span">
        {''}
      </Text>
    );
  }

  // Primitive scalars
  if (type === 'string' || type === 'number' || type === 'boolean' || type === 'bigint') {
    return (
      <Text variant="subheader-regular" color={TABLE_PALETTE.rowText} as="span">
        {String(rawValue)}
      </Text>
    );
  }

  // Date objects
  if (rawValue instanceof Date) {
    return (
      <Text variant="subheader-regular" color={TABLE_PALETTE.rowText} as="span">
        {rawValue.toString()}
      </Text>
    );
  }

  // Objects / arrays: fallback to String serialization wrapped
  if (type === 'object') {
    try {
      const serialized = String(rawValue);
      return (
        <Text variant="subheader-regular" color={TABLE_PALETTE.rowText} as="span">
          {serialized}
        </Text>
      );
    } catch {
      return (
        <Text variant="subheader-regular" color={TABLE_PALETTE.rowText} as="span">
          {''}
        </Text>
      );
    }
  }

  // Generic fallback (symbol / function etc.) – stringify
  return (
    <Text variant="subheader-regular" color={TABLE_PALETTE.rowText} as="span">
      {String(rawValue)}
    </Text>
  );
}

/**
 * Auto-detects appropriate alignment based on data type
 * Numbers → right, Booleans → center, Others → left
 */
export function detectAlignmentFromValue(value: any): ColumnAlign {
  if (value === null || value === undefined) return 'left';
  
  const type = typeof value;
  
  if (type === 'number' || type === 'bigint') return 'right';
  if (type === 'boolean') return 'center';
  if (value instanceof Date) return 'left';
  
  return 'left';
}

/**
 * Gets unified alignment classes for text and flex containers
 * Resolves the align/justify duplication issue
 */
export function getAlignmentClasses(align: ColumnAlign = 'left'): AlignmentClasses {
  const alignmentMap = {
    left: { text: 'text-left', justify: 'justify-start' },
    center: { text: 'text-center', justify: 'justify-center' },
    right: { text: 'text-right', justify: 'justify-end' },
  };

  return alignmentMap[align];
}

/**
 * Parses column width to a number in pixels
 * Handles string values like '120px', '10rem', or numbers
 * Returns DEFAULT_COLUMN_WIDTH if parsing fails
 */
export function parseColumnWidth(width: string | number | undefined): number {
  if (width === undefined) return DEFAULT_COLUMN_WIDTH;
  
  if (typeof width === 'number') return width;
  
  // Parse string values
  const parsed = parseInt(width, 10);
  return Number.isFinite(parsed) ? parsed : DEFAULT_COLUMN_WIDTH;
}

/**
 * Gets the effective width for a column (unified approach)
 * Resolves width/maxWidth duplication by using a single source of truth
 */
export function getColumnWidth<T>(column: TableColumn<T>): number {
  // Priority: column.width > column.maxWidth (deprecated) > default
  if (column.width !== undefined) {
    return parseColumnWidth(column.width);
  }
  
  // Backward compatibility: support deprecated maxWidth
  if (column.maxWidth !== undefined) {
    return column.maxWidth;
  }
  
  return DEFAULT_COLUMN_WIDTH;
}

/**
 * Computes minimum table width based on columns
 * Accounts for column widths, padding, and checkbox column
 */
export function computeTableMinWidth<T>(
  columns: TableColumn<T>[],
  selectable: boolean,
): number {
  let totalWidth = 0;

  if (selectable) {
    totalWidth += CHECKBOX_COLUMN_WIDTH;
  }

  columns.forEach((column) => {
    totalWidth += getColumnWidth(column);
  });

  // Add padding for all columns including checkbox
  const totalColumns = columns.length + (selectable ? 1 : 0);
  totalWidth += COLUMN_PADDING * totalColumns;

  return Math.max(totalWidth, MIN_TABLE_WIDTH);
}

/**
 * Gets available page size options based on total rows
 * Filters out options that don't make sense for the dataset
 */
export function getPageSizeOptions(totalRows: number): readonly number[] {
  if (totalRows < 10) return [];
  if (totalRows < 50) return [10, 25];
  if (totalRows < 100) return [10, 25, 50];
  return [10, 25, 50, 100];
}

/**
 * Builds pagination window with page numbers and ellipsis
 * Implements smart pagination UI: 1 ... 4 5 6 ... 20
 */
export function buildPaginationWindow(args: PaginationWindowArgs): PageToken[] {
  const { totalItems, pageSize, currentPage } = args;
  const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)));
  const pages: PageToken[] = [];

  // If total pages <= 6, show all pages
  if (totalPages <= PAGINATION_CONFIG.MAX_COMPACT_VISIBLE_PAGES) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  // Early range: current page <= 4 → show 1 2 3 4 5 ... N
  if (currentPage <= PAGINATION_CONFIG.EARLY_EDGE_MAX) {
    pages.push(1, 2, 3, 4, 5, 'ellipsis', totalPages);
    return pages;
  }

  // Late range: current page >= N-3 → show 1 ... N-4 N-3 N-2 N-1 N
  if (currentPage >= totalPages - PAGINATION_CONFIG.TAIL_EDGE_OFFSET) {
    pages.push(
      1,
      'ellipsis',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    );
    return pages;
  }

  // Middle range: show 1 ... current-1 current current+1 ... N
  pages.push(
    1,
    'ellipsis',
    currentPage - PAGINATION_CONFIG.MIDDLE_RADIUS,
    currentPage,
    currentPage + PAGINATION_CONFIG.MIDDLE_RADIUS,
    'ellipsis',
    totalPages,
  );
  return pages;
}
