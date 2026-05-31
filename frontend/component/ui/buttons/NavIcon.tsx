import React from 'react';
import { PrimaryButton } from './PrimaryButton';
import { colors } from '@/assets/styles/colors';
import { Text } from '@/components/ui/text';


interface NavIconProps {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  showNotification?: boolean;
  notificationCount?: number;
  disabled?: boolean;
}

const NavIcon: React.FC<NavIconProps> = ({
  icon,
  onClick,
  className = '',
  showNotification = false,
  notificationCount,
  disabled = false,
}) => (
  <div className="relative">
    <PrimaryButton
      onClick={onClick}
      variant="ghost"
      size="sm"
      className={`relative !p-2 rounded-md !min-w-0 !w-auto ${className}`}
      customVariant={{
        hover: {
          backgroundColor: colors.primary.dark,
        },
      }}
      disabled={disabled}
    >
      {icon}
    </PrimaryButton>
      
    {showNotification && (
      <div 
        className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center box-border border-2"
        style={{
          backgroundColor: colors.feedback.alert300,
          borderColor: colors.primary.main,
        }}
      >
        {notificationCount && (
          <Text 
            variant="small-medium"
            color={colors.primary.main}
            style={{ fontSize: 9 }}
          >
            {notificationCount > 99 ? '99+' : notificationCount.toString()}
          </Text>
        )}
      </div>
    )}
  </div>
);

export default NavIcon;
