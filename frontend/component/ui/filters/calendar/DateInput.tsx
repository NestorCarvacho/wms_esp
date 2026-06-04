import React from 'react';
import { LabelInput } from '@/components/ui/inputs/LabelInput';
import { IconScout } from '@/components/ui/images/IconScout';
import { colorClass, palette } from '@/assets/styles/colors';


interface DateInputProps {
  label?: string;
  value: string;
  onClick?: () => void;
  open?: boolean;
  variant?: 'outlined' | 'standard';
  placeholder?: string;
  hasError?: boolean;
  errorMessage?: string;
  showCalendarIcon?: 'left' | 'right';
  showDropdownIcon?: boolean;
  className?: string;
  disabled?: boolean;
}

/**
 * Unified date input trigger component for DatePicker and DateRangePicker
 */
export const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onClick,
  open = false,
  variant = 'outlined',
  placeholder = 'dd/mm/aaaa',
  hasError = false,
  errorMessage,
  showCalendarIcon = 'right',
  showDropdownIcon = false,
  className = '',
  disabled = false,
}) => {
  const calendarIcon = (
    <IconScout name="calendarAlt" color="currentColor" className={colorClass.brandLight} size={20} />
  );
  
  const dropdownIcon = showDropdownIcon ? (
    <IconScout
      name="angleDown"
      color="currentColor"
      className={colorClass.accent}
      size={20}
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    />
  ) : undefined;

  const rightIcon = showCalendarIcon === 'right'
    ? (dropdownIcon || calendarIcon)
    : dropdownIcon;

  return (
    <div className={className} onClick={disabled ? undefined : onClick}>
      <LabelInput
        variant={variant}
        size="sm"
        colorVariant="important"
        label={label}
        value={value}
        readOnly
        disabled={disabled}
        onChange={() => {}}
        iconLeft={showCalendarIcon === 'left' ? calendarIcon : undefined}
        iconRight={rightIcon}
        customFocusColor={palette.accent}
        customBorderColor={palette.border}
        customTextColor={palette.body}
        customLabelColor={palette.muted}
        fullWidth
        placeholder={placeholder}
        hasError={hasError}
        errorMessage={errorMessage}
      />
    </div>
  );
};
