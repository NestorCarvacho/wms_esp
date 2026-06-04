import React from 'react';
import { ToolsBar, NavigationBar, SideMenu } from './';
import { useMenuNavigation } from '@/hooks/mainMenu';
import { useAuth } from '@/api';
import { cn } from '@/lib/utils';

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
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'bg-white text-slate-900 shadow-md border-b border-slate-200',
        'dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800',
      )}
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
          className="fixed inset-x-0 bottom-0 bg-slate-900/10 dark:bg-slate-900/20 backdrop-blur-[1px] z-[35]"
          style={{ top: 'var(--total-nav-height)' }}
          data-testid="mega-menu-content-overlay"
          aria-hidden
        />
      )}

    </header>
  );
};

export default TopNavigation;
