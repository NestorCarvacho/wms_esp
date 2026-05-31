import React from 'react';
import { ToolsBar, NavigationBar, SideMenu } from './';
import { useMenuNavigation } from '@/hooks/mainMenu';
import { colors } from '@/assets/styles/colors';
import { useAuth } from '@/api';


const TopNavigation: React.FC = () => {
  const {
    activeMenuItem,
    isConfigMenuOpen,
    isMobileMenuOpen,
    isUserMenuOpen,
    searchTerm,
    setIsMobileMenuOpen,
    setIsUserMenuOpen,
    handleMenuItemEnter,
    handleMenuItemLeave,
    handleConfigMenuEnter,
    handleConfigMenuLeave,
    clearMenuTimer,
    clearConfigTimer,
    handleLogout,
    handleUserMenuClose,
    handleMobileMenuToggle,
    handleSearchChange,
    navigate,
  } = useMenuNavigation();
  const { user } = useAuth();
  const displayName = user ? `${user.nombres} ${user.apellidoPaterno}`.trim() : undefined;

  return (
    <>
      <div 
        className="fixed top-0 left-0 right-0 z-50"
        style={{ 
          backgroundColor: colors.primary.main,
          zIndex: 999, 
          boxShadow: '0px 1px 4px 0px #00000026',
        }}
        data-testid="top-navigation"
      >
        <ToolsBar
          isUserMenuOpen={isUserMenuOpen}
          searchTerm={searchTerm}
          setIsUserMenuOpen={setIsUserMenuOpen}
          handleMobileMenuToggle={handleMobileMenuToggle}
          handleSearchChange={handleSearchChange}
          handleUserMenuClose={handleUserMenuClose}
          handleLogout={handleLogout}
          navigate={navigate}
          userName={displayName}
        />

        <NavigationBar
          activeMenuItem={activeMenuItem}
          isConfigMenuOpen={isConfigMenuOpen}
          handleMenuItemEnter={handleMenuItemEnter}
          handleMenuItemLeave={handleMenuItemLeave}
          handleConfigMenuEnter={handleConfigMenuEnter}
          handleConfigMenuLeave={handleConfigMenuLeave}
          clearMenuTimer={clearMenuTimer}
          clearConfigTimer={clearConfigTimer}
        />

        <SideMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />

        {!isMobileMenuOpen && (activeMenuItem || isConfigMenuOpen) && (
          <div 
            style={{
              position: 'fixed',
              top: 'var(--total-nav-height)',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(235, 235, 241, 0.32)',
              zIndex: 35,
            }}
            data-testid="mega-menu-content-overlay" 
          />
        )}

        {isUserMenuOpen && (
          <div 
            className="fixed inset-0 z-30" 
            onClick={handleUserMenuClose}
          />
        )}
      </div>
    </>
  );
};

export default TopNavigation;
