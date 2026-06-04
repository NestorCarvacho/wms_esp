import type { IconScoutName } from '@/components/ui/images/IconScout';

/**
 * Column alignment options
 */
export type ColumnAlign = 'left' | 'center' | 'right';

/**
 * Overflow strategy for cell content
 */
export type OverflowStrategy = 'truncate' | 'wrap';

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Page token for pagination (number or ellipsis placeholder)
 */
export type PageToken = number | 'ellipsis';

/**
 * Configuration for a table column
 * @template T - The row data type
 */
export interface TableColumn<T> {
  /** Unique key for the column (maps to row property) */
  key: keyof T | string;
  /** Column header text */
  header: string;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** 
   * Column width (CSS value or number in pixels)
   * Defines both column and content width (unified approach)
   */
  width?: string | number;
  /** Custom render function for cell content */
  render?: (row: T) => React.ReactNode;
  /** Column alignment (default: 'left', or auto-detected from data type) */
  align?: ColumnAlign;
  /** Show checkbox in this column header */
  withCheckbox?: boolean;
  /** 
   * @deprecated Use width instead. MaxWidth is now derived from width
   * Override max width (px) for this column content
   */
  maxWidth?: number;
  /** Overflow strategy for content (default: 'truncate') */
  overflowStrategy?: OverflowStrategy;
}

/**
 * Configuration for a table action (action menu item)
 * @template T - The row data type
 */
export interface TableAction<T> {
  /** Unique identifier for the action */
  id: string;
  /** Action label text */
  label: string;
  /** IconScout icon name */
  icon: IconScoutName;
  /** Click handler receiving the row data */
  onClick: (row: T) => void;
  /** @deprecated Use `variant` */
  color?: string;
  /** Estilo del ítem en el menú de acciones */
  variant?: 'default' | 'destructive';
  /** Function to determine if action is disabled for specific row */
  disabled?: (row: T) => boolean;
  /** Function to determine if action is hidden for specific row */
  hidden?: (row: T) => boolean;
}

/**
 * Pagination configuration
 */
export interface TablePagination {
  /** Current page number (1-indexed) */
  page: number;
  /** Number of rows per page */
  pageSize: number;
  /** Total number of rows across all pages */
  total: number;
  /** Callback when page changes */
  onChange: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange?: (pageSize: number) => void;
}

/**
 * Internal sort state
 */
export interface SortState {
  /** Column key being sorted */
  key: string;
  /** Sort direction */
  direction: SortDirection;
}

/**
 * Props for the Table component
 * @template T - The row data type
 */
export interface TableProps<T> {
  /** Column configuration array */
  columns: TableColumn<T>[];
  /** Row data array */
  data: T[];
  /** Total number of rows (for pagination display) */
  totalRows: number;
  /** Pagination configuration (optional) */
  pagination?: TablePagination;
  /** Enable search bar */
  searchable?: boolean;
  /** Search input placeholder text */
  searchPlaceholder?: string;
  /** Search callback */
  onSearch?: (value: string) => void;
  /** Initial sort state */
  initialSort?: { key: string; direction: SortDirection };
  /** Sort change callback */
  onSortChange?: (key: string, direction: SortDirection) => void;
  /** Handle sorting on server side (disable client-side sorting) */
  serverSideSort?: boolean;
  /** Enable row selection with checkboxes */
  selectable?: boolean;
  /** Selection change callback */
  onSelectionChange?: (selected: T[]) => void;
  /** Function to extract unique ID from row (default: auto-detect 'id', 'uuid', '_id', 'key') */
  getRowId?: (row: T) => string | number;
  /** Additional CSS class for table container */
  className?: string;
  /** Inline styles for table container */
  style?: React.CSSProperties;
  /** Message to display when no data */
  emptyMessage?: string;
  /** 
   * @deprecated Use column.width instead. This default is no longer used.
   * Default column max width in pixels (when column.maxWidth not specified)
   */
  columnMaxWidth?: number;
  /** Test ID for testing */
  'data-testid'?: string;
  /** Show loading skeleton state */
  isLoading?: boolean;
  /** Action menu items configuration */
  actions?: TableAction<T>[];
  /** 
   * Header text for actions column 
   * Actions column width is fixed at 48px (ACTIONS_COLUMN_WIDTH constant)
   */
  actionsHeader?: string;
  /** Configuration for expandable rows */
  expandable?: ExpandableConfig<T>;
}

/**
 * Alignment classes for text and flex containers
 */
export interface AlignmentClasses {
  /** Text alignment class (text-left, text-center, text-right) */
  text: string;
  /** Flex justify class (justify-start, justify-center, justify-end) */
  justify: string;
}

/**
 * Pagination window generation arguments
 */
export interface PaginationWindowArgs {
  /** Total number of items */
  totalItems: number;
  /** Items per page */
  pageSize: number;
  /** Current page number (1-indexed) */
  currentPage: number;
}

/**
 * Detail field for expanded row
 */
export interface DetailField {
  /** Field label */
  label: string;
  /** Field value */
  value: string | null | undefined;
  /** Default value when value is null/undefined */
  defaultValue?: string;
}

/**
 * Configuration for expandable rows
 * @template T - The row data type
 */
export interface ExpandableConfig<T> {
  /** Function to return fields for expanded row content */
  getExpandedFields: (record: T) => DetailField[];
  /** Function to determine if a row can be expanded (optional) */
  rowExpandable?: (record: T) => boolean;
  /** Show chevron column for expanding/collapsing rows (default: true) */
  showExpandColumn?: boolean;
}
