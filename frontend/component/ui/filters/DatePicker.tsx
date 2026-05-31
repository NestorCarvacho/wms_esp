import React, { useEffect, useRef, useState } from 'react';
import { formatDateToYYYYMMDD } from '@/utils';
import { semanticColors } from '@/assets/styles/colors';
import { DateInput, Calendar, formatDateDisplay, parseDateToMonthYear } from './calendar';
import { useCalendarPanel } from '@/hooks/ui/filters/calendar';


interface DatePickerProps {
  className?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (date: string) => void;
  closeOnOutsideClick?: boolean;
  onOpenChange?: (open: boolean) => void;
  label?: string;
  placeholder?: string;
  closeOnSelect?: boolean;
  variant?: 'outlined' | 'standard';
  hasError?: boolean;
  errorMessage?: string;
  maxDate?: string;
  minDate?: string;
  'data-testid'?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  className = '',
  value,
  defaultValue,
  onChange,
  closeOnOutsideClick = true,
  onOpenChange,
  label,
  placeholder = 'dd/mm/aaaa',
  closeOnSelect = true,
  variant = 'standard',
  hasError = false,
  errorMessage,
  maxDate,
  minDate,
  'data-testid': dataTestId,
}) => {
  const isControlled = typeof value === 'string';
  const [internalDate, setInternalDate] = useState<string | undefined>(defaultValue);
  const dateValue = isControlled ? value : internalDate;

  const { open, toggle, close, triggerRef, panelRef } = useCalendarPanel({
    closeOnOutsideClick,
    onOpenChange,
  });

  const [baseMonth, setBaseMonth] = useState(() => parseDateToMonthYear(dateValue));

  const emittedDefaultRef = useRef(false);
  useEffect(() => {
    if (!isControlled && defaultValue && !emittedDefaultRef.current) {
      setInternalDate(prev => prev ?? defaultValue);
      onChange?.(defaultValue);
      emittedDefaultRef.current = true;
    }
  }, [isControlled, defaultValue, onChange]);

  useEffect(() => {
    const currentValue = isControlled ? value : internalDate;
    if (currentValue) {
      setBaseMonth(parseDateToMonthYear(currentValue));
    }
  }, [isControlled, value, internalDate]);

  const handleDayClick = (date: Date) => {
    const clicked = formatDateToYYYYMMDD(date);
    if (!isControlled) setInternalDate(clicked);
    onChange?.(clicked);
    if (closeOnSelect) {
      setTimeout(() => close(), 0);
    }
  };

  return (
    <div className={`relative ${className}`} ref={triggerRef} data-testid={dataTestId}>
      <DateInput
        label={label}
        value={formatDateDisplay(dateValue, placeholder)}
        onClick={toggle}
        open={open}
        variant={variant}
        placeholder={placeholder}
        hasError={hasError}
        errorMessage={errorMessage}
        showCalendarIcon="right"
      />

      {open && (
        <div
          ref={panelRef}
          className="absolute left-0 mt-2 z-50 rounded shadow-md border p-3 min-w-[280px]"
          style={{
            backgroundColor: semanticColors.background.primary,
            borderColor: semanticColors.border.light,
          }}
        >
          <Calendar
            baseMonth={baseMonth}
            onMonthChange={setBaseMonth}
            selectedDates={dateValue ? [dateValue] : []}
            onDayClick={handleDayClick}
            showNavigation="both"
            maxDate={maxDate}
            minDate={minDate}
          />
        </div>
      )}
    </div>
  );
};

export default DatePicker;
