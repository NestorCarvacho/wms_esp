import React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { SearchBar } from '../MainMenu';
import { MenuSidebarItem } from '@/components/ui/menu';
import { useSideMenu, type SectionConfig } from '@/hooks/mainMenu';
import type { MenuItem } from '@/api/menuConfig';
import { cn } from '@/lib/utils';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const SideMenuSection: React.FC<{
  items: MenuItem[] | string[];
  onItemClick: (item: MenuItem | string, index: number) => void;
  getIcon?: (item: MenuItem | string, index: number) => React.ReactNode;
  showRightArrow?: boolean;
}> = ({ items, onItemClick, getIcon, showRightArrow = true }) => (
  <div className="space-y-1">
    {items.map((item, index) => (
      <MenuSidebarItem
        key={index}
        onClick={() => onItemClick(item, index)}
        icon={getIcon?.(item, index)}
        showArrow={showRightArrow}
      >
        {typeof item === 'string' ? item : (item?.title ?? 'Sección')}
      </MenuSidebarItem>
    ))}
  </div>
);

const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  searchTerm,
  onSearchChange,
}) => {
  const {
    currentLevel,
    navigationStack,
    contentConfig,
    handleBack,
    handleClose,
  } = useSideMenu();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex lg:hidden">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={() => handleClose(onClose)}
        aria-hidden
      />

      <aside
        className={cn(
          'relative flex h-full w-80 max-w-[85vw] flex-col shadow-xl',
          'bg-card text-foreground',
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <span className="text-sm font-semibold text-muted-foreground">Menú</span>
          <button
            type="button"
            onClick={() => handleClose(onClose)}
            className="rounded-[10px] p-2 hover:bg-muted transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-border p-4">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            variant="sidebar"
          />
        </div>

        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          {navigationStack.length > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-[10px] p-2 hover:bg-muted transition-colors"
              aria-label="Volver"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h2 className="flex-1 text-sm font-medium text-foreground">
            {currentLevel.type === 'main' ? 'Categorías' : currentLevel.title}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {contentConfig[currentLevel.type]?.map((section: SectionConfig, index: number) => (
            <div key={index} className={section.className || ''}>
              <SideMenuSection
                items={section.items}
                onItemClick={section.onItemClick}
                getIcon={section.getIcon}
                showRightArrow={section.showRightArrow}
              />
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default SideMenu;
