import React from 'react';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { IconScout, type IconScoutName } from '@/components/ui/images/IconScout';


interface LinkButtonProps {
  children?: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
  iconLeft?: IconScoutName;
  isLoading?: boolean;
}

export const LinkButton: React.FC<LinkButtonProps> = ({
  children,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  iconLeft,
  isLoading = false,
}) => (
  <PrimaryButton
    type={type}
    onClick={onClick}
    disabled={disabled}
    isLoading={isLoading}
    variant="ghost"
    colorVariant="important"
    textAlign="center"
    fullWidth={false}
    className={className}
    textVariant="subheader-medium"
    iconLeft={iconLeft ? <IconScout name={iconLeft} size={16} /> : undefined}
    iconSize={16}
    data-testid="link-button"
  >
    {children}
  </PrimaryButton>
);

export default LinkButton;
