import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/shadcn/button';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';
type TextAlign = 'left' | 'center' | 'right';
type ButtonColor = 'primary' | 'alert' | 'error' | 'important' | 'success';

interface PrimaryButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  colorVariant?: ButtonColor;
  textAlign?: TextAlign;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  /** @deprecated Sin efecto; compatibilidad legacy */
  textVariant?: unknown;
  customVariant?: unknown;
  iconSize?: number;
  'data-testid'?: string;
}

function mapVariant(variant: ButtonVariant, color: ButtonColor): ButtonProps['variant'] {
  if (color === 'error') return 'destructive';
  if (color === 'success') return 'success';
  if (variant === 'outline') return 'outline';
  if (variant === 'ghost') return 'ghost';
  if (color === 'alert') return 'secondary';
  return 'default';
}

function mapSize(size: ButtonSize): ButtonProps['size'] {
  if (size === 'sm') return 'sm';
  if (size === 'lg') return 'lg';
  return 'default';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  isLoading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  fullWidth = false,
  variant = 'primary',
  size = 'md',
  colorVariant = 'primary',
  textAlign = 'center',
  iconLeft,
  iconRight,
  'data-testid': dataTestId,
}) => {
  const alignClass =
    textAlign === 'left' ? 'justify-start' : textAlign === 'right' ? 'justify-end' : 'justify-center';

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      variant={mapVariant(variant, colorVariant)}
      size={mapSize(size)}
      data-testid={dataTestId}
      className={cn('rounded-full font-medium', fullWidth && 'w-full', alignClass, className)}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : iconLeft}
      {children}
      {!isLoading && iconRight}
    </Button>
  );
};

export default PrimaryButton;
