/**
 * Utility functions for calendar components
 */

/**
 * Generates a 6x7 matrix (42 cells) representing a month calendar
 * Starts on Monday (Monday = index 0)
 */
export const getMonthMatrix = (date: Date): (Date | null)[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Monday start: (0=Monday, 6=Sunday)
  const startOffset = (firstDay.getDay() + 6) % 7;
  
  const cells: (Date | null)[] = [];
  
  // Empty cells before first day
  for (let i = 0; i < startOffset; i++) {
    cells.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }
  
  // Fill remaining cells to complete 42 (6 rows x 7 days)
  while (cells.length < 42) {
    cells.push(null);
  }
  
  return cells;
};

/**
 * Adds or subtracts months from a date
 */
export const addMonths = (date: Date, months: number): Date => {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
};

/**
 * Formats ISO date string (yyyy-mm-dd) to display format (dd/mm/yyyy)
 */
export const formatDateDisplay = (date?: string, placeholder = 'dd/mm/aaaa'): string => {
  if (!date) return placeholder;
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

/**
 * Checks if a date is within a range (inclusive)
 */
export const isWithinRange = (
  dateIso: string,
  from?: string,
  to?: string,
): boolean => {
  if (!from || !to) return false;
  return dateIso >= from && dateIso <= to;
};

/**
 * Parses ISO date string to Date object for month/year navigation
 */
export const parseDateToMonthYear = (dateIso?: string): Date => {
  if (!dateIso) return new Date();
  
  const [year, month] = dateIso.split('-').map(Number);
  
  if (!Number.isNaN(year) && !Number.isNaN(month)) {
    return new Date(year, month - 1, 1);
  }
  
  return new Date();
};
