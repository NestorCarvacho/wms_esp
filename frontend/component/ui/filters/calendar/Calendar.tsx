import React, { useMemo } from 'react';
import { formatDateToYYYYMMDD } from '@/utils';
import { IconScout } from '@/components/ui/images/IconScout';
import { colors, semanticColors } from '@/assets/styles/colors';
import { Selector } from '@/components/ui/inputs/Selector';
import { WEEK_DAYS_SHORT, MONTHS_ES, generateYearsArray } from './calendarConstants';
import { getMonthMatrix, addMonths, isWithinRange } from './calendarUtils';


interface MonthYearSelectorProps {
  month: number;
  year: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  className?: string;
}

/**
 * Month and Year selector component for calendar navigation
 * Exportable for independent use
 */
export const MonthYearSelector: React.FC<MonthYearSelectorProps> = ({
  month,
  year,
  onMonthChange,
  onYearChange,
  className = '',
}) => {
  const monthOptions = useMemo(
    () =>
      MONTHS_ES.map((monthLabel, monthIndex) => ({
        value: String(monthIndex),
        label: monthLabel,
      })),
    [],
  );

  const yearOptions = useMemo(
    () =>
      generateYearsArray().map((yearValue) => ({
        value: String(yearValue),
        label: String(yearValue),
      })),
    [],
  );

  return (
    <div className={`flex items-center gap-2 flex-nowrap ${className}`}>
      <div className="w-[112px] shrink-0">
        <Selector
          label=""
          options={monthOptions}
          value={String(month)}
          onChange={(value) => onMonthChange(Number(value as string))}
          searchable={false}
          className="!mb-0"
          selectClassName="!py-1 !pr-6 !pl-2 !text-sm"
          TextVariant="subheader-regular"
        />
      </div>
      <div className="w-[84px] shrink-0">
        <Selector
          label=""
          options={yearOptions}
          value={String(year)}
          onChange={(value) => onYearChange(Number(value as string))}
          searchable={false}
          className="!mb-0"
          selectClassName="!py-1 !pr-6 !pl-2 !text-sm"
          TextVariant="subheader-regular"
        />
      </div>
    </div>
  );
};

interface CalendarProps {
  baseMonth: Date;
  onMonthChange: (date: Date) => void;
  selectedDates?: string[];
  highlightRange?: { from?: string; to?: string };
  onDayClick: (date: Date) => void;
  showNavigation?: 'left' | 'right' | 'both' | 'none';
  className?: string;
  maxDate?: string;
  minDate?: string;
}

/**
 * Main calendar component - renders month grid with navigation
 * Can be used standalone or within date picker components
 */
export const Calendar: React.FC<CalendarProps> = ({
  baseMonth,
  onMonthChange,
  selectedDates = [],
  highlightRange,
  onDayClick,
  showNavigation = 'both',
  className = '',
  maxDate,
  minDate,
}) => {
  const matrix = useMemo(() => getMonthMatrix(baseMonth), [baseMonth]);
  const selectedMonth = baseMonth.getMonth();
  const selectedYear = baseMonth.getFullYear();

  const handleMonthChange = (newMonth: number) => {
    onMonthChange(new Date(selectedYear, newMonth, 1));
  };

  const handleYearChange = (newYear: number) => {
    onMonthChange(new Date(newYear, selectedMonth, 1));
  };

  const showLeftNav = showNavigation === 'left' || showNavigation === 'both';
  const showRightNav = showNavigation === 'right' || showNavigation === 'both';

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Navigation header with month/year selectors */}
      <div className="flex items-center justify-between gap-2">
        {showLeftNav ? (
          <button
            type="button"
            className="px-2 py-1 text-sm"
            style={{ color: colors.primary.main }}
            onClick={() => onMonthChange(addMonths(baseMonth, -1))}
            aria-label="Previous month"
          >
            <IconScout name="angleLeft" size={18} />
          </button>
        ) : (
          <div className="w-6" />
        )}

        <MonthYearSelector
          month={selectedMonth}
          year={selectedYear}
          onMonthChange={handleMonthChange}
          onYearChange={handleYearChange}
        />

        {showRightNav ? (
          <button
            type="button"
            className="px-2 py-1 text-sm"
            style={{ color: colors.primary.main }}
            onClick={() => onMonthChange(addMonths(baseMonth, 1))}
            aria-label="Next month"
          >
            <IconScout name="angleRight" size={18} />
          </button>
        ) : (
          <div className="w-6" />
        )}
      </div>

      {/* Week days header */}
      <div
        className="grid grid-cols-7 gap-1 text-center text-xs"
        style={{ color: semanticColors.text.light }}
      >
        {WEEK_DAYS_SHORT.map((weekDay) => (
          <div key={weekDay}>{weekDay}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {matrix.map((dateCell, index) => {
          if (!dateCell) return <div key={index} className="h-8" />;

          const isoString = formatDateToYYYYMMDD(dateCell);
          const isSelected = selectedDates.includes(isoString);
          const isInRange = highlightRange
            ? isWithinRange(isoString, highlightRange.from, highlightRange.to)
            : false;

          const isDisabled = Boolean(
            (maxDate && isoString > maxDate) || 
            (minDate && isoString < minDate),
          );

          const baseClasses =
            'h-8 w-8 rounded flex items-center justify-center text-sm transition-opacity';
          const hoverClasses = !isDisabled 
            ? 'cursor-pointer hover:opacity-90 focus:outline-none focus:ring-2' 
            : 'cursor-not-allowed opacity-40';

          const style: React.CSSProperties = {};
          if (isDisabled) {
            style.backgroundColor = colors.grays.neutralE5;
            style.color = colors.grays.neutral99;
          } else if (isSelected) {
            style.backgroundColor = colors.important.main;
            style.color = colors.grays.neutralFF;
          } else if (isInRange) {
            style.backgroundColor = colors.primary.background;
            style.color = colors.primary.main;
          }

          return (
            <button
              key={index}
              type="button"
              className={`${baseClasses} ${hoverClasses}`}
              style={style}
              onClick={() => !isDisabled && onDayClick(dateCell)}
              disabled={isDisabled}
              aria-pressed={isSelected}
              aria-disabled={isDisabled}
              aria-label={`Select ${dateCell.toLocaleDateString('es-ES')}`}
            >
              {dateCell.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};
