import React from 'react';
import { colors } from '@/assets/styles/colors';
import { IconScout } from '@/components/ui/images/IconScout';
import { SearchBar } from '../MainMenu';
import { PrimaryButton, NavIcon } from '@/components/ui/buttons';
import { Text } from '@/components/ui/text';
import { useSideMenu, type SectionConfig } from '@/hooks/mainMenu';


interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const SideMenuSection: React.FC<{
  items: any[];
  onItemClick: (item: any, index: number) => void;
  getIcon?: (item: any, index: number) => React.ReactNode;
  showRightArrow?: boolean;
}> = ({ items, onItemClick, getIcon, showRightArrow = true }) => (
  <div className="space-y-2">
    {items.map((item, index) => (
      <PrimaryButton
        key={index}
        onClick={() => onItemClick(item, index)}
        className="rounded-md"
        variant="ghost"
        textAlign="left"
        customVariant={{
          hover: {
            backgroundColor: colors.primary.dark,
            textColor: colors.grays.neutralFF,
            iconColor: colors.grays.neutralFF,
          },
          default: {
            textColor: colors.grays.neutralFF,
          },
        }}
        iconLeft={getIcon?.(item, index)}
        iconRight={showRightArrow ? 
          <IconScout name="angleRight" size={16} color={colors.grays.neutralFF} /> : 
          undefined}
        fullWidth
      >
        {typeof item === 'string' ? item : (item?.title ?? 'Sección')}
      </PrimaryButton>
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
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => handleClose(onClose)}/>
      
      <div className="relative w-80 h-full shadow-lg overflow-hidden" style={{ maxWidth: '320px', backgroundColor: colors.primary.main }}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b" style={{ borderColor: colors.primary.dark, backgroundColor: colors.primary.dark }}>
            <SearchBar 
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
              variant="sidebar"
            />
          </div>

          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: colors.primary.dark }}>
            {navigationStack.length > 1 && (
              <NavIcon
                onClick={handleBack}
                icon={<IconScout name="angleLeft" size="md" color={colors.grays.neutralFF} />}
              />
            )}
            <Text 
              variant="subheader-medium"
              className="flex-1"
              color={colors.primary.auxiliar}
              style={{ 
                textAlign: 'left',
                marginLeft: navigationStack.length > 1 ? '12px' : '0',
              }}
            >
              {currentLevel.type === 'main' ? 'Categorías' : currentLevel.title}
            </Text>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;
