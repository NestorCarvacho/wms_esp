/**
 * Paleta tablas WMS (shadcn Table + tokens Tailwind).
 */
export const TABLE_PALETTE = {
  border: '#e2e8f0',
  headerText: '#0f172a',
  arrow: '#64748b',
  rowText: '#334155',
  rowHover: '#f1f5f9',
} as const;

/**
 * Default row border style
 */
export const ROW_BORDER_STYLE: React.CSSProperties = {
  borderBottom: `1px solid ${TABLE_PALETTE.border}`,
};

/**
 * Available page size options for pagination
 */
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

/**
 * Pagination window configuration constants
 */
export const PAGINATION_CONFIG = {
  /** Maximum pages to show without ellipsis */
  MAX_COMPACT_VISIBLE_PAGES: 6,
  /** Show first 5 pages when current page <= this value */
  EARLY_EDGE_MAX: 4,
  /** Show last 5 pages when within this offset from end */
  TAIL_EDGE_OFFSET: 3,
  /** Show current page ± this radius in middle window */
  MIDDLE_RADIUS: 1,
} as const;

/**
 * Default column width in pixels when not specified
 */
export const DEFAULT_COLUMN_WIDTH = 96;

/**
 * Minimum checkbox column width in pixels
 */
export const CHECKBOX_COLUMN_WIDTH = 40;

/**
 * Default actions column width in pixels
 */
export const ACTIONS_COLUMN_WIDTH = 48;

/**
 * Padding per column (left + right) in pixels
 */
export const COLUMN_PADDING = 32;

/**
 * Minimum table width in pixels
 */
export const MIN_TABLE_WIDTH = 600;

/**
 * Number of skeleton rows to display during loading
 */
export const SKELETON_ROWS_COUNT = 10;

/**
 * Skeleton loading animation colors
 */
export const SKELETON_COLORS = {
  box: '#e2e8f0',
  bar: '#e2e8f0',
} as const;
