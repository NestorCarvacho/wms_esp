/**
 * Calendar constants for date picker components
 */

export const WEEK_DAYS_SHORT = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'] as const;

export const CALENDAR_YEARS = {
  start: 1925,
  end: 2125,
} as const;

/**
 * Generates array of months in Spanish
 */
export const MONTHS_ES = Array.from(
  { length: 12 },
  (_, index) => new Date(2000, index, 1).toLocaleDateString('es-ES', { month: 'long' }),
);

/**
 * Generates array of years from CALENDAR_YEARS range
 */
export const generateYearsArray = (): number[] =>
  Array.from(
    { length: CALENDAR_YEARS.end - CALENDAR_YEARS.start + 1 },
    (_, index) => CALENDAR_YEARS.start + index,
  );
