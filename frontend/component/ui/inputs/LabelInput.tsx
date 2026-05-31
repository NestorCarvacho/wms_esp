import React, { useState } from 'react';
import { IconScout } from '@/components/ui/images/IconScout';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { colors } from '@/assets/styles/colors';
import { Text } from '@/components/ui/text/Text';

// Tipos para mayor flexibilidad
type InputVariant = 'floating' | 'standard' | 'filled' | 'outlined';
type InputSize = 'sm' | 'md' | 'lg';
type InputColorVariant = 'success' | 'important' | 'alert' | 'error' | 'primary' | 'primaryDark';
type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 'date';

interface LabelInputProps {
  id?: string;
  type?: InputType;
  value?: string;
  label?: string;
  placeholder?: string;
  hasError?: boolean;
  errorMessage?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  registration?: UseFormRegisterReturn;
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  
  variant?: InputVariant;
  size?: InputSize;
  colorVariant?: InputColorVariant;
  fullWidth?: boolean;
  
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  
  customFocusColor?: string;
  customBorderColor?: string;
  customTextColor?: string;
  customLabelColor?: string;
  customErrorColor?: string;
  
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  
  'data-testid'?: string;
}

export const LabelInput: React.FC<LabelInputProps> = ({
  id,
  type = 'text',
  value = '',
  label,
  placeholder,
  hasError = false, 
  errorMessage = '',
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  autoComplete,
  autoFocus = false,
  
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  
  registration,
  
  variant = 'floating',
  size = 'md',
  colorVariant = 'important',
  fullWidth = true,
  
  iconLeft,
  iconRight,
  
  customFocusColor,
  customBorderColor,
  customTextColor,
  customLabelColor,
  customErrorColor,
  
  className = '',
  inputClassName = '',
  labelClassName = '',
  
  maxLength,
  minLength,
  pattern,
  
  'data-testid': dataTestId,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [internalValue, setInternalValue] = useState('');
  
  const inputValue = registration ? internalValue : value;
  const hasValue = inputValue?.length > 0;
  const isActive = isFocused || hasValue || !!placeholder;
  
  const showError = hasError && errorMessage && errorMessage.trim().length > 0;
  
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  // Tokens base comunes (antes repetidos en el mapa)
  const baseColorTokens = {
    border: colors.grays.neutralE5,
    text: colors.grays.neutral33,
    label: colors.grays.neutral66,
    error: colors.feedback.error300,
  } as const;

  const focusColorMap: Record<InputColorVariant, string> = {
    success: colors.feedback.success300,
    important: colors.important.main,
    alert: colors.feedback.alert300,
    error: colors.feedback.error300,
    primary: colors.primary.main,
    primaryDark: colors.primary.dark,
  };

  const effectiveVariant: InputColorVariant = colorVariant;
  
  const sizeMap = {
    sm: {
      input: 'px-0 pt-[6px] pb-[7px] text-base',
      icon: 'h-6 w-6',
    },
    md: {
      input: 'px-0 pt-[6px] pb-[7px] text-base',
      icon: 'h-6 w-6',
    },
    lg: {
      input: 'px-0 pt-[6px] pb-[7px] text-base',
      icon: 'h-6 w-6',
    },
  } as const;

  const getLabelPosition = (variantType: string, hasIconLeft: boolean, _hasIconRight: boolean) => {
    const basePositions = {
      floating: hasIconLeft ? 'left-12' : 'left-0',
      standard: 'left-0',
      filled: hasIconLeft ? 'left-12' : 'left-3',
      outlined: hasIconLeft ? 'left-12' : 'left-3',
    } as const;
    return basePositions[variantType as keyof typeof basePositions];
  };

  const variantMap = {
    floating: {
      container: 'relative pt-[12px]',
      input: 'bg-transparent border-0 border-b focus:ring-0 outline-none',
      label: `absolute ${getLabelPosition('floating', !!iconLeft, !!iconRight)} pointer-events-none transition-all duration-200 will-change-transform`,
      labelPosition: (active: boolean) => active
        ? '-top-5'
        : 'top-1/2',
    },
    standard: {
      container: 'relative',
      input: 'bg-transparent border-0 border-b focus:ring-0 outline-none',
      label: 'block',
      labelPosition: () => '',
    },
    filled: {
      container: 'relative pt-[13px]',
      input: 'bg-gray-50 border-0 rounded-t-lg focus:ring-0 outline-none focus:bg-gray-100',
      label: `absolute ${getLabelPosition('filled', !!iconLeft, !!iconRight)} pointer-events-none transition-all duration-200 will-change-transform`,
      labelPosition: (active: boolean) => active
        ? '-top-6'
        : 'top-1/2',
    },
    outlined: {
      container: 'relative pt-[11px]',
      input: 'bg-transparent border rounded-lg focus:ring-0 outline-none',
      label: `absolute ${getLabelPosition('outlined', !!iconLeft, !!iconRight)} px-1 bg-white pointer-events-none transition-all duration-200 will-change-transform`,
      labelPosition: (active: boolean) => active
        ? '-top-4'
        : 'top-1/2',
    },
  } as const;
  
  const currentSize = sizeMap[size];
  const currentVariant = variantMap[variant];
  const focusColor = customFocusColor || focusColorMap[effectiveVariant];
  const borderColor = customBorderColor || baseColorTokens.border;
  const textColor = customTextColor || baseColorTokens.text;
  const labelColor = customLabelColor || baseColorTokens.label;
  const errorColor = customErrorColor || baseColorTokens.error;
  
  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const finalInputType = type === 'password' && showPassword ? 'text' : type;
  
  const renderPasswordToggle = () => {
    if (type !== 'password') return null;
    
    return (
      <div
        onClick={togglePasswordVisibility}
        className="cursor-pointer transition-colors duration-200"
        style={{ color: hasError ? errorColor : labelColor }}
      >
        {showPassword ? (
          <IconScout name="eyeSlash" size={currentSize.icon.includes('h-4') ? 'sm' : currentSize.icon.includes('h-5') ? 'md' : 'lg'} />
        ) : (
          <IconScout name="eye" size={currentSize.icon.includes('h-4') ? 'sm' : currentSize.icon.includes('h-5') ? 'md' : 'lg'} />
        )}
      </div>
    );
  };
  
  return (
    <div className={`${currentVariant.container} ${fullWidth ? 'w-full' : ''} ${className}`}>
      {variant === 'standard' && (
        <div className="flex items-center justify-between">
          <Text variant="small-regular" color={hasError ? errorColor : labelColor}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Text>
        </div>
      )}
      
      <div className="relative">
        {iconLeft && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <div className={`${currentSize.icon} flex items-center justify-center`} style={{ color: hasError ? errorColor : labelColor }}>
              {iconLeft}
            </div>
          </div>
        )}
        
        <input
          id={inputId}
          type={finalInputType}
          {...(registration || {})}
          value={registration ? undefined : value}
          placeholder={variant === 'standard' ? placeholder : ''}
          data-testid={dataTestId}
          onChange={registration ? (e) => {
            void registration.onChange(e);
            setInternalValue(e.target.value);
          } : (e) => onChange?.(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          className={`
            ${currentVariant.input}
            ${currentSize.input}
            ${fullWidth ? 'w-full' : ''}
            ${iconLeft ? 'pl-12' : ''}
            ${iconRight || type === 'password' ? 'pr-12' : ''}
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
            ${readOnly ? 'cursor-default' : ''}
            transition-all duration-200
            ${inputClassName}
          `}
          style={{
            color: textColor,
            borderColor: hasError ? errorColor : 
              isFocused ? focusColor : borderColor,
            backgroundColor: variant === 'filled' ? 
              colors.grays.neutralFA : undefined,
          }}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
        />
        
        {variant !== 'standard' && (
          <label
            htmlFor={inputId}
            className={`
              ${currentVariant.label}
              ${currentVariant.labelPosition(isActive)}
              ${labelClassName}
            `}
            style={{
              color: hasError ? errorColor : isActive ? focusColor : labelColor,
              transform: isActive
                ? 'translateY(0) scale(1)'
                : 'translateY(-50%) scale(1.3333)',
              transformOrigin: 'left center',
            }}
          >
            <Text variant="small-regular" color={hasError ? errorColor : isActive ? focusColor : labelColor}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Text>
          </label>
        )}
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {iconRight && (
            <div className="h-6 w-6 flex items-center justify-center" style={{ color: hasError ? errorColor : labelColor }}>
              {iconRight}
            </div>
          )}
          {renderPasswordToggle()}
        </div>
      </div>
      
      {showError && (
        <Text
          variant="small-regular"
          data-testid="error-message"
          className="mt-1 transition-all duration-200"
          color={errorColor}
        >
          {errorMessage}
        </Text>
      )}

      {helperText && !hasError && (
        <Text
          variant="small-regular"
          className="mt-1 transition-all duration-200"
          color={labelColor}
        >
          {helperText}
        </Text>
      )}
    </div>
  );
};

export default LabelInput;
