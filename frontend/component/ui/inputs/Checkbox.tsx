import React, { useState, useId, useRef, useEffect } from 'react';
import { colors } from '@/assets/styles/colors';
import { Text } from '@/components/ui/text/Text';


export interface CheckboxProps {
	id?: string;
	checked?: boolean;
	defaultChecked?: boolean;
	defaultIndeterminate?: boolean;
	disabled?: boolean;
	label?: React.ReactNode;
	name?: string;
	value?: string;
	required?: boolean;
	indeterminate?: boolean;
	onChange?: (checked: boolean) => void;
	className?: string;
	boxClassName?: string;
	labelClassName?: string;
  'data-testid'?: string;
}

const SIZE = 20;

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  defaultChecked,
  defaultIndeterminate = false,
  disabled = false,
  label,
  name,
  value,
  required = false,
  indeterminate = false,
  onChange,
  className = '',
  boxClassName = '',
  labelClassName = '',
  'data-testid': dataTestId,
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const isControlled = typeof checked === 'boolean';
  const [internal, setInternal] = useState<boolean>(defaultChecked || false);
  const [internalIndeterminate, setInternalIndeterminate] = useState<boolean>(defaultIndeterminate);
  const currentChecked = isControlled ? checked : internal;
  const [isHover, setIsHover] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const baseColor = colors.primary.main; 
  const hoverColor = colors.primary.dark;
  const disabledColor = colors.grays.neutralCC;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (!isControlled) {
      setInternal(e.target.checked);
      if (internalIndeterminate) setInternalIndeterminate(false);
    }
    onChange?.(e.target.checked);
  };

  const effectiveIndeterminate = indeterminate || internalIndeterminate;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = effectiveIndeterminate && !currentChecked;
    }
  }, [effectiveIndeterminate, currentChecked]);

  const currentBg = disabled
    ? colors.grays.neutralFF
    : effectiveIndeterminate
      ? (isHover ? hoverColor : baseColor)
      : currentChecked
        ? (isHover ? hoverColor : baseColor)
        : 'transparent';

  const currentBorder = disabled
    ? disabledColor
    : (isHover ? hoverColor : baseColor);

  const checkmarkColor = disabled
    ? disabledColor
    : effectiveIndeterminate
      ? colors.grays.neutralFF
      : currentChecked
        ? colors.grays.neutralFF
        : 'transparent';

  return (
    <label
      htmlFor={inputId}
      className={`inline-flex items-center gap-2 cursor-pointer select-none ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <span
        className={`relative inline-flex items-center justify-center ${boxClassName}`}
        style={{
				  width: SIZE,
				  height: SIZE,
				  borderRadius: 0,
				  backgroundColor: currentBg,
				  border: `2px solid ${currentBorder}`,
				  transition: 'background-color 120ms ease, border-color 120ms ease',
        }}
      >
        {(currentChecked || effectiveIndeterminate) && (
          <svg
            width={SIZE - 6}
            height={SIZE - 6}
            viewBox="0 0 14 14"
            aria-hidden="true"
            focusable="false"
            style={{ pointerEvents: 'none' }}
          >
            {effectiveIndeterminate ? (
              <rect x="2" y="6" width="10" height="2" rx="1" fill={checkmarkColor} />
            ) : (
              <path
                d="M5.5 10.2 2.8 7.5l1-1 1.7 1.7L10.2 3.5l1 1-5.7 5.7Z"
                fill={checkmarkColor}
              />
            )}
          </svg>
        )}
        <input
          id={inputId}
          name={name}
          type="checkbox"
          className="absolute inset-0 opacity-0 cursor-inherit"
          ref={inputRef}
          {...(isControlled ? { checked: currentChecked } : { defaultChecked })}
          disabled={disabled}
          required={required}
          value={value}
          aria-checked={effectiveIndeterminate ? 'mixed' : currentChecked}
          onChange={handleChange}
          data-testid={dataTestId}
        />
      </span>
      {label && (
        <Text
          variant="subheader-regular"
          className={labelClassName}
          color={disabled ? colors.grays.neutral99 : colors.grays.neutral00}
        >
          {label}
        </Text>
      )}
    </label>
  );
};

export default Checkbox;
