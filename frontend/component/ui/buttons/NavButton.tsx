import React from 'react';
import { IconScout } from '@/components/ui/images/IconScout';
import { colors } from '@/assets/styles/colors';
import { Text } from '@/components/ui/text/Text';


interface NavButtonProps {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  showDropdownIcon?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ 
  children, 
  icon, 
  onClick,
  isActive = false, 
  showDropdownIcon = true,
}) => (
  <button
    onClick={onClick}
    className="flex items-center space-x-2 px-3 py-2 transition-colors bg-transparent rounded-[4px] border-0 outline-0"
    style={{ backgroundColor: isActive ? colors.primary.background200 : 'transparent' }}
    data-active={isActive}
  >
    {icon && <span>{icon}</span>}
    <Text 
      variant="subheader-medium" 
      fontFamily="montserrat" 
      color={colors.primary.dark}
      as="span"
    >
      {children}
    </Text>
    {showDropdownIcon && <IconScout name="angleDown" size="sm" color={colors.primary.dash} />}
  </button>
);

export default NavButton;
