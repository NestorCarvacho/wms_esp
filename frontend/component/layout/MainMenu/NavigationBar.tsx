import React from 'react';
import { Settings, ChevronDown } from 'lucide-react';
import { NavButton } from '@/components/ui/buttons';
import { MenuDropdown } from './';
import { useMenu } from '@/api';
import type { MenuItem as ApiMenuItem } from '@/api';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/shadcn/dropdown-menu';

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

type DropdownAlign = 'start' | 'center' | 'end';

interface MenuItemProps {
  item: ApiMenuItem;
  isOpen: boolean;
  align: DropdownAlign;
  onOpen: () => void;
  onClose: () => void;
  clearTimer: () => void;
  icon?: React.ReactNode;
  showDropdownIcon?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  item,
  isOpen,
  align,
  onOpen,
  onClose,
  clearTimer,
  icon,
  showDropdownIcon = true,
}) => (
  <DropdownMenu open={isOpen} modal={false}>
    <div
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-lg"
          onClick={() => {
            clearTimer();
            onOpen();
          }}
          data-testid={`nav-menu-trigger-${item.id}`}
        >
          <NavButton icon={icon} showDropdownIcon={showDropdownIcon} isActive={isOpen}>
            {!icon ? item.title : ''}
          </NavButton>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={8}
        className="w-auto min-w-[420px] max-w-[90vw] p-0 border-border shadow-lg"
        onMouseEnter={clearTimer}
        onMouseLeave={onClose}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <MenuDropdown item={item} />
      </DropdownMenuContent>
    </div>
  </DropdownMenu>
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
  const { mainMenu, configMenu } = useMenu();

  const getDropdownAlign = (index: number): DropdownAlign => {
    const totalItems = mainMenu.length;
    const isEven = totalItems % 2 === 0;
    const mid = Math.ceil(totalItems / 2);
    const centerItems = isEven ? [mid - 1, mid] : [mid - 1];
    if (centerItems.includes(index)) return 'center';
    return index < mid - 1 ? 'start' : 'end';
  };

  return (
    <div
      className={cn(
        'desktop-options-bar border-t border-slate-200 bg-slate-50',
        'dark:border-slate-800 dark:bg-slate-800/50',
      )}
    >
      <div className="max-w-full px-4">
        <div className="flex items-center justify-between options-bar-height">
          <div className="flex-1 flex justify-center gap-1">
            {mainMenu.map((item, idx) => (
              <MenuItem
                key={item.id}
                item={item}
                isOpen={activeMenuItem === item.id}
                align={getDropdownAlign(idx)}
                onOpen={() => handleMenuItemEnter(item.id)}
                onClose={handleMenuItemLeave}
                clearTimer={clearMenuTimer}
              />
            ))}
          </div>

          <div className="shrink-0">
            {configMenu && (
              <MenuItem
                item={configMenu}
                isOpen={isConfigMenuOpen}
                align="end"
                onOpen={handleConfigMenuEnter}
                onClose={handleConfigMenuLeave}
                clearTimer={clearConfigTimer}
                icon={
                  <span className="inline-flex items-center gap-0.5 text-slate-700 dark:text-slate-200">
                    <Settings className="h-4 w-4" />
                    <ChevronDown className="h-4 w-4" />
                  </span>
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
