import React, { useEffect, useRef, useState } from 'react';
import { formatDateToYYYYMMDD } from '@/utils';
import { semanticColors } from '@/assets/styles/colors';
import { DateInput, Calendar, formatDateDisplay, addMonths } from './calendar';
import { useCalendarPanel } from '@/hooks/ui/filters/calendar';


export interface DateRangeValue { from?: string; to?: string }

interface DateRangePickerProps {
  className?: string;
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onChange?: (range: DateRangeValue) => void;
  closeOnOutsideClick?: boolean;
  onOpenChange?: (open: boolean) => void;
  label?: string;
  closeOnComplete?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  maxDate?: string;
  minDate?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  className = '',
  value,
  defaultValue,
  onChange,
  closeOnOutsideClick = true,
  onOpenChange,
  label = 'Rango:',
  closeOnComplete = false,
  hasError = false,
  errorMessage,
  maxDate,
  minDate,
}) => {
  const isControlled = typeof value === 'object' && value !== null;
  const [internalRange, setInternalRange] = useState<DateRangeValue | undefined>(defaultValue);
  const rangeValue = isControlled ? value : (internalRange || {});

  const { open, toggle, close, triggerRef, panelRef } = useCalendarPanel({
    closeOnOutsideClick,
    onOpenChange,
  });

  const [baseMonth, setBaseMonth] = useState(() => new Date());
  const [draft, setDraft] = useState<DateRangeValue | undefined>(undefined);
  
  const displayRange: DateRangeValue = open && draft
    ? draft
    : ((rangeValue.from || rangeValue.to) ? rangeValue : (defaultValue ?? {}));

  useEffect(() => {
    if (!open) setDraft(undefined);
  }, [open]);

  const emittedDefaultRef = useRef(false);
  useEffect(() => {
    if (!isControlled && defaultValue && !emittedDefaultRef.current) {
      setInternalRange(prev => prev ?? defaultValue);
      if (defaultValue.from && defaultValue.to) onChange?.(defaultValue);
      emittedDefaultRef.current = true;
    }
  }, [isControlled, defaultValue, onChange]);

  useEffect(() => {
    const fromIso = (isControlled ? value?.from : internalRange?.from) ?? defaultValue?.from;
    if (fromIso) {
      const [year, month] = fromIso.split('-').map(Number);
      if (!Number.isNaN(year) && !Number.isNaN(month)) setBaseMonth(new Date(year, month - 1, 1));
    }
  }, [isControlled, value?.from, internalRange?.from, defaultValue?.from]);

  useEffect(() => {
    if (isControlled && defaultValue && !emittedDefaultRef.current) {
      const emptyControlled = !value?.from && !value?.to;
      if (emptyControlled && defaultValue.from && defaultValue.to) {
        onChange?.(defaultValue);
        emittedDefaultRef.current = true;
      }
    }
  }, [isControlled, value?.from, value?.to, defaultValue, onChange]);

  const handleDayClick = (date: Date) => {
    const clicked = formatDateToYYYYMMDD(date);
    setDraft(prev => {
      const current = prev ?? rangeValue;
      let next: DateRangeValue;
      if (!current.from || (current.from && current.to)) {
        next = { from: clicked, to: undefined };
      } else {
        if (clicked < current.from) next = { from: clicked, to: current.from };
        else if (clicked === current.from) next = { from: clicked, to: clicked };
        else next = { from: current.from, to: clicked };
      }
      if (next.from && next.to) {
        if (!isControlled) setInternalRange(next);
        onChange?.(next);
        if (closeOnComplete) {
          setTimeout(() => {
            setDraft(undefined);
            close();
          }, 0);
        }
      }
      return next;
    });
  };

  const formattedValue = `${formatDateDisplay(displayRange.from)} - ${formatDateDisplay(displayRange.to)}`;

  return (
    <div className={`relative ${className}`} ref={triggerRef}>
      <DateInput
        label={label}
        value={formattedValue}
        onClick={toggle}
        open={open}
        variant="outlined"
        hasError={hasError}
        errorMessage={errorMessage}
        showCalendarIcon="left"
        showDropdownIcon
        className="min-w-[320px]"
      />

      {open && (
        <div
          ref={panelRef}
          className="absolute left-0 mt-2 z-50 rounded shadow-md border p-3 min-w-[520px]"
          style={{
            backgroundColor: semanticColors.background.primary,
            borderColor: semanticColors.border.light,
          }}
        >
          <div className="grid grid-cols-2 gap-6">
            <Calendar
              baseMonth={baseMonth}
              onMonthChange={setBaseMonth}
              selectedDates={[displayRange.from, displayRange.to].filter(Boolean) as string[]}
              highlightRange={displayRange}
              onDayClick={handleDayClick}
              showNavigation="left"
              maxDate={maxDate}
              minDate={minDate}
            />
            <Calendar
              baseMonth={addMonths(baseMonth, 1)}
              onMonthChange={(date) => setBaseMonth(addMonths(date, -1))}
              selectedDates={[displayRange.from, displayRange.to].filter(Boolean) as string[]}
              highlightRange={displayRange}
              onDayClick={handleDayClick}
              showNavigation="right"
              maxDate={maxDate}
              minDate={minDate}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
