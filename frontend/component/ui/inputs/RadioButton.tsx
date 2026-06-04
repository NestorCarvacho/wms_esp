import React from 'react';
import { colorClass, palette } from '@/assets/styles/colors';
import { cn } from '@/lib/utils';


export interface RadioButtonProps {
  /**
   * Unique identifier for the radio button
   */
  id?: string;
  /**
   * Name attribute for grouping radio buttons
   */
  name: string;
  /**
   * Value of the radio button
   */
  value: string;
  /**
   * Label text to display next to the radio button
   */
  label: string;
  /**
   * Whether the radio button is checked
   */
  checked: boolean;
  /**
   * Callback when the radio button is selected
   */
  onChange: (value: string) => void;
  /**
   * Whether the radio button is disabled
   */
  disabled?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * RadioButton component with circular selection indicator
 * Based on design system standards
 */
export const RadioButton: React.FC<RadioButtonProps> = ({
  id,
  name,
  value,
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
}) => {
  const handleClick = () => {
    if (!disabled) {
      onChange(value);
    }
  };

  return (
    <button
      type="button"
      id={id}
      role="radio"
      aria-checked={checked}
      aria-disabled={disabled}
      onClick={handleClick}
      disabled={disabled}
      className={`flex items-center gap-2 text-sm font-medium transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
      data-testid={`radio-button-${value}`}
    >
      {/* Radio Circle */}
      <div
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          borderColor: checked ? palette.brand : palette.disabled,
          backgroundColor: palette.white,
        }}
      >
        {/* Inner filled circle when selected */}
        {checked && (
          <div 
            className="w-3 h-3 rounded-full transition-all"
            style={{ backgroundColor: palette.brand }}
          />
        )}
      </div>

      {/* Label */}
      <span className={cn(checked ? colorClass.brand : colorClass.muted)}>
        {label}
      </span>

      {/* Hidden native radio input for accessibility */}
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="sr-only"
        disabled={disabled}
        aria-label={label}
      />
    </button>
  );
};

export default RadioButton;
