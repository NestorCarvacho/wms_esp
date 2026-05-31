import React from 'react';
import { IconScout } from '@/components/ui/images/IconScout';
import { NavButton } from '@/components/ui/buttons';
import { MenuDropdown } from './';
import { useMenu } from '@/api';
import type { MenuItem as ApiMenuItem } from '@/api';
import { colors } from '@/assets/styles/colors';


interface NavigationBarProps {
  activeMenuItem: number | null;
  isConfigMenuOpen: boolean;
  handleMenuItemEnter: (itemId: number) => void;
  handleMenuItemLeave: () => void;
  handleConfigMenuEnter: () => void;
  handleConfigMenuLeave: () => void;
  clearMenuTimer: () => void;
  clearConfigTimer: () => void;
}

interface MenuItemProps {
  item: any;
  isActive: boolean;
  position: 'left' | 'right' | 'center';
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  clearTimer: () => void;
  icon?: React.ReactNode;
  showDropdownIcon?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  item,
  isActive,
  position,
  onMouseEnter,
  onMouseLeave,
  clearTimer,
  icon,
  showDropdownIcon = true,
}) => (
  <div
    className="relative"
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onClick={() => { clearTimer(); onMouseEnter(); }}
  >
    <NavButton icon={icon} showDropdownIcon={showDropdownIcon} isActive={isActive}>
      {!icon ? item.title : ''}
    </NavButton>

    {isActive && (
      <div onMouseEnter={clearTimer} onMouseLeave={onMouseLeave}>
        <MenuDropdown item={item} position={position} />
      </div>
    )}
  </div>
);

const NavigationBar: React.FC<NavigationBarProps> = ({
  activeMenuItem,
  isConfigMenuOpen,
  handleMenuItemEnter,
  handleMenuItemLeave,
  handleConfigMenuEnter,
  handleConfigMenuLeave,
  clearMenuTimer,
  clearConfigTimer,
}) => {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const { mainMenu, configMenu } = (useMenu() as unknown) as {
    mainMenu: ApiMenuItem[];
    configMenu: ApiMenuItem | null;
  };

  const getDropdownPosition = (index: number): 'left' | 'right' | 'center' => {
    const totalItems = mainMenu.length;
    const isEven = totalItems % 2 === 0;
    const mid = Math.ceil(totalItems / 2);
    
    const centerItems = isEven ? [mid - 1, mid] : [mid - 1];
    if (centerItems.includes(index)) return 'center';
    
    return index < mid - 1 ? 'left' : 'right';
  };

  React.useEffect(() => {
    if (!activeMenuItem && !isConfigMenuOpen) return;
    const handleDocumentClick = (e: MouseEvent) => {
      const root = rootRef.current;
      if (root && !root.contains(e.target as Node)) {
        if (activeMenuItem) handleMenuItemLeave();
        if (isConfigMenuOpen) handleConfigMenuLeave();
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, [activeMenuItem, isConfigMenuOpen, handleMenuItemLeave, handleConfigMenuLeave]);

  return (
    <div ref={rootRef} className="desktop-options-bar" style={{ backgroundColor: colors.primary.background }}>
      <div className="max-w-full px-4">
        <div className="flex items-center justify-between options-bar-height">
          <div className="flex-1 flex justify-center space-x-2">
            {mainMenu.map((item, idx: number) => (
              <MenuItem
                key={item.id}
                item={item}
                isActive={activeMenuItem === item.id}
                position={getDropdownPosition(idx)}
                onMouseEnter={() => handleMenuItemEnter(item.id)}
                onMouseLeave={handleMenuItemLeave}
                clearTimer={clearMenuTimer}
              />
            ))}
          </div>

          <div className="flex-shrink-0">
            {configMenu && (
              <MenuItem
                item={configMenu}
                isActive={isConfigMenuOpen}
                position="right"
                onMouseEnter={handleConfigMenuEnter}
                onMouseLeave={handleConfigMenuLeave}
                clearTimer={clearConfigTimer}
                icon={
                  <div className="flex items-center space-x-1">
                    <IconScout name="setting" size={18} color={colors.primary.dark} />
                    <IconScout name="angleDown" size={18} color={colors.primary.dark} />
                  </div>
                }
                showDropdownIcon={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;