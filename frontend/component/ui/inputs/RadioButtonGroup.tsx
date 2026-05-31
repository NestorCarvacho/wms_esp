import React from 'react';
import { RadioButton } from './RadioButton';


export interface RadioButtonOption {
  value: string;
  label: string;
}

export interface RadioButtonGroupProps {
  /**
   * Name attribute for the radio button group
   */
  name: string;
  /**
   * Array of radio button options
   */
  options: RadioButtonOption[];
  /**
   * Currently selected value
   */
  value: string;
  /**
   * Callback when selection changes
   */
  onChange: (value: string) => void;
  /**
   * Whether the radio buttons are disabled
   */
  disabled?: boolean;
  /**
   * Layout direction
   */
  direction?: 'horizontal' | 'vertical';
  /**
   * Optional label for the group
   */
  label?: string;
  /**
   * Additional CSS classes for the container
   */
  className?: string;
}

/**
 * RadioButtonGroup component for managing multiple radio buttons
 */
export const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({
  name,
  options,
  value,
  onChange,
  disabled = false,
  direction = 'horizontal',
  label,
  className = '',
}) => (
  <div className={className} data-testid={`radio-group-${name}`}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {label}
      </label>
    )}
    <div
      role="radiogroup"
      className={`flex ${
        direction === 'horizontal' ? 'flex-row gap-6' : 'flex-col gap-3'
      }`}
    >
      {options.map((option) => (
        <RadioButton
          key={option.value}
          id={`${name}-${option.value}`}
          name={name}
          value={option.value}
          label={option.label}
          checked={value === option.value}
          onChange={onChange}
          disabled={disabled}
        />
      ))}
    </div>
  </div>
);

export default RadioButtonGroup;
