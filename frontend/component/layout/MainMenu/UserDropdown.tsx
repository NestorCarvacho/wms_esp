import React from 'react';
import { colors } from '@/assets/styles/colors';
import { Card } from '@/components/ui/cards/Card';
import { Text } from '@/components/ui/text/Text';
import { IconScout } from '@/components/ui/images/IconScout';
import { PrimaryButton } from '@/components/ui/buttons';
import { Divider } from '@/components/ui/separators';


interface UserDropdownProps {
  onEditProfile: () => void;
  onLogout: () => void;
  onHelpCenter: () => void;
  userName: string;
}

interface UserDropdownButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const UserDropdownButton: React.FC<UserDropdownButtonProps> = ({ 
  onClick, 
  icon, 
  children,
}) => (
  <PrimaryButton
    onClick={onClick}
    variant="ghost"
    textAlign="left"
    className="py-3 rounded-md"
    iconLeft={icon}
    iconSize={24}
    customVariant={{
      default: {
        textColor: colors.grays.neutral00,
      },
      pressed: {
        textColor: colors.grays.neutral00,
      },
      focus: {
        textColor: colors.grays.neutral00,
      },
    }}
    textVariant="body-regular"
    fullWidth
  >
    {children}
  </PrimaryButton>
);

const UserDropdown: React.FC<UserDropdownProps> = ({ 
  onEditProfile, 
  onLogout, 
  onHelpCenter,
  userName,
}) => (
  <Card
    padding="24px"
    className="tooltip-system-options absolute right-0 mt-2 w-72 z-50"
    style={{ visibility: 'visible' }}
  >
    <div className="title mb-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10">
          <IconScout name="user" size="xl" color={colors.grays.neutral66} />
        </div>
        <div className="flex flex-col gap-1">
          <Text variant="subheader-medium" color={colors.grays.neutral33}>
            {userName}
          </Text>
        </div>
      </div>
    </div>
    
    <Divider color={colors.grays.neutralE5} />

    <div className="item-option mb-2">
      <UserDropdownButton
        onClick={onEditProfile}
        icon={<IconScout name="setting" size="lg" color={colors.important.main} />}
      >
        Editar perfil
      </UserDropdownButton>
    </div>
    
    <div className="item-option out-action mb-2">
      <UserDropdownButton
        onClick={onLogout}
        icon={<IconScout name="signout" size="lg" color={colors.feedback.error300} />}
      >
        Cerrar sesión
      </UserDropdownButton>
    </div>

    <Divider color={colors.grays.neutralE5} />

    <div className="item-option help-megamenu-profile">
      <UserDropdownButton
        onClick={onHelpCenter}
        icon={<IconScout name="bell" size="lg" color={colors.important.main} />}
      >
        Centro de ayuda
      </UserDropdownButton>
    </div>
  </Card>
);

export default UserDropdown;
