import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import { cn } from '@/lib/utils';

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
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
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
  fullWidth = true,
  iconLeft,
  iconRight,
  className = '',
  inputClassName = '',
  labelClassName = '',
  maxLength,
  minLength,
  pattern,
  'data-testid': dataTestId,
}) => {
  const showError = hasError && errorMessage?.trim();
  const fieldId = id ?? registration?.name;

  const inputClasses = cn(
    iconLeft && 'pl-10',
    iconRight && 'pr-10',
    showError && 'border-destructive focus-visible:ring-destructive',
    inputClassName,
  );

  const field = registration ? (
    <Input
      id={fieldId}
      type={type}
      {...registration}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      maxLength={maxLength}
      minLength={minLength}
      pattern={pattern}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      data-testid={dataTestId}
      className={inputClasses}
    />
  ) : (
    <Input
      id={fieldId}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      maxLength={maxLength}
      minLength={minLength}
      pattern={pattern}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      data-testid={dataTestId}
      className={inputClasses}
    />
  );

  return (
    <div className={cn(fullWidth && 'w-full', className)}>
      {label && (
        <Label htmlFor={fieldId} className={cn('mb-1.5', labelClassName)}>
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}
      <div className="relative">
        {iconLeft && (
          <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2">{iconLeft}</span>
        )}
        {field}
        {iconRight && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">{iconRight}</span>
        )}
      </div>
      {showError && <p className="text-xs text-destructive mt-1">{errorMessage}</p>}
      {helperText && !showError && <p className="text-xs text-muted-foreground mt-1">{helperText}</p>}
    </div>
  );
};

export default LabelInput;
