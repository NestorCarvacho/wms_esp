import React, { useState } from 'react';
import { Selector } from '@/components/ui/inputs/Selector';
import { IconScout } from '@/components/ui/images/IconScout';
import { useSearchBar } from '@/hooks/mainMenu/useSearchBar';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/assets/styles/colors';


interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  variant?: 'desktop' | 'sidebar';
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchTerm, 
  onSearchChange, 
  variant = 'desktop',
  placeholder = 'Buscar',
}) => {
  const navigate = useNavigate();
  const { options, getTargetForValue } = useSearchBar();
  const isDesktop = variant === 'desktop';
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleChange = (val: string | string[]) => {
    const rawTarget = getTargetForValue(val) || '';
    if (rawTarget) {
      const target = rawTarget.startsWith('/') ? rawTarget : `/${rawTarget}`;
      try {
        void navigate(target);
      } finally {
        onSearchChange('');
      }
    } else {
      onSearchChange('');
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  // Desktop: fondo transparente con hover/click a primary.dark
  // Sidebar: mantiene apariencia original con fondo semi-transparente
  const backgroundColor = isDesktop 
    ? (isOpen || isHovered ? colors.primary.dark : 'transparent')
    : 'rgba(178, 229, 255, 0.10)';

  const desktopSelector = (
    <div 
      className="relative w-full transition-colors duration-200 rounded-lg"
      style={{ backgroundColor }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ícono de lupa */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <IconScout 
          name="search" 
          size="md" 
          color={colors.grays.neutralFF}
        />
      </div>
      
      <Selector
        id="desktop-search"
        label=""
        placeholder={placeholder}
        searchPlaceholder={placeholder}
        options={options}
        value={searchTerm || ''}
        onChange={handleChange}
        onOpenChange={handleOpenChange}
        selectClassName="!w-full !rounded-lg !border-0 !bg-transparent !pl-10 !pr-4 !py-2 focus:!ring-0 focus:!outline-none !text-white placeholder:!text-white"
        menuClassName="mt-2"
        hideChevron
        searchable={true}
        data-testid="desktop-selector"
      />
    </div>
  );

  const sidebarSelector = (
    <div className="relative w-full">
      <Selector
        id="sidebar-search"
        label=""
        placeholder={placeholder}
        searchPlaceholder={placeholder}
        options={options}
        value={searchTerm || ''}
        onChange={handleChange}
        selectClassName="!w-full !rounded-lg !border-0 !bg-[rgba(178,229,255,0.10)] backdrop-blur !pl-10 !pr-4 !py-1 focus:!ring-2"
        menuClassName="mt-0"
        hideChevron
        searchable={true}
        data-testid="sidebar-selector"
      />
    </div>
  );

  if (isDesktop) {
    return (
      <div className="desktop-search-bar flex-1 max-w-[360px] mx-8">
        {desktopSelector}
      </div>
    );
  }

  return sidebarSelector;
};

export default SearchBar;
