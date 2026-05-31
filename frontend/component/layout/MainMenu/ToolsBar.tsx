import React from 'react';
import { IconScout } from '@/components/ui/images/IconScout';
import { NavIcon } from '@/components/ui/buttons';
import { SearchBar, UserDropdown } from './';
import { colors } from '@/assets/styles/colors';
import { Link } from 'react-router-dom';
import { Text } from '@/components/ui/text';
import { LogoWms } from '@/components/ui/images';
import { Divider } from '@/components/ui/separators';


interface ToolsBarProps {
  isUserMenuOpen: boolean;
  searchTerm: string;
  setIsUserMenuOpen: (open: boolean) => void;
  handleMobileMenuToggle: () => void;
  handleSearchChange: (term: string) => void;
  handleUserMenuClose: () => void;
  handleLogout: () => void;
  navigate: (path: string) => void;
  userName?: string;
}

const ToolsBar: React.FC<ToolsBarProps> = ({
  isUserMenuOpen,
  searchTerm,
  setIsUserMenuOpen,
  handleMobileMenuToggle,
  handleSearchChange,
  handleUserMenuClose,
  handleLogout,
  navigate,
  userName = 'Nombre Apellido',
}) => (
  <div className="max-w-full px-4">
    <div className="flex items-center justify-between top-nav-height">
      <div className="flex items-center space-x-3">
        <NavIcon
          icon={<IconScout name="bars" size="md" color={colors.primary.general} />}
          onClick={handleMobileMenuToggle}
          className="mobile-menu-button lg:hidden"
        />

        <Divider orientation="v" />

        <Link to="/" className="flex items-center gap-x-2">
          <LogoWms variant="solo" className="h-7 w-auto" alt="WMS" />
          <Text variant="subheader-regular" color={colors.grays.neutralFF} className="hidden sm:block">
            WMS
          </Text>
        </Link>
      </div>

      <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />

      <div className="flex items-center space-x-2">
        <NavIcon icon={<IconScout name="fileInfo" size="lg" color={colors.primary.general} />}/>

        <NavIcon
          icon={<IconScout name="bell" size="lg" color={colors.primary.general} />}
          showNotification={true}
          notificationCount={100}
        />

        <div className="relative">
          <NavIcon
            icon={
              <div className="flex items-center space-x-1">
                <IconScout name="user" size="lg" color={colors.primary.general} />
                <IconScout name="angleDown" size="lg" color={colors.primary.general} />
              </div>
            }
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          />

          {isUserMenuOpen && (
            <UserDropdown
              userName={userName}
              onEditProfile={() => {
                handleUserMenuClose();
                void navigate('/perfil');
              }}
              onLogout={() => {
                handleUserMenuClose();
                handleLogout();
              }}
              onHelpCenter={() => {
                handleUserMenuClose();
                window.open('#', '_blank');
              }}
            />
          )}
        </div>
      </div>
    </div>
  </div>
);

export default ToolsBar;
