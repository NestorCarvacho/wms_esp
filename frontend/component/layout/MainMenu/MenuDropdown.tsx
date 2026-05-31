import React from 'react';
import { Link } from 'react-router-dom';
import { Text } from '@/components/ui/text/Text';
import { Card } from '@/components/ui/cards/Card';
import { colors } from '@/assets/styles/colors';
import { IconScout, type IconScoutName } from '@/components/ui/images/IconScout';


interface MenuDropdownProps {
  item: any;
  position?: 'left' | 'right' | 'center';
}

const getPositionClasses = (position: 'left' | 'right' | 'center'): string => {
  const positionMap = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 transform -translate-x-1/2',
  };
  return positionMap[position] || 'left-0';
};


interface SubItemHeaderProps { 
  subItem: { 
    title: string; 
    icon?: string | null;
    routeMetadata?: {
      iconName?: string;
      breadcrumbTitle?: string;
      componentName?: string;
    };
  } 
}

const SubItemHeader: React.FC<SubItemHeaderProps> = ({ subItem }) => {
  // Prioridad: routeMetadata.iconName > backend icon
  const iconToUse = subItem.routeMetadata?.iconName || subItem.icon;
  
  return (
    <div className="grid grid-cols-[16px_1fr] gap-x-2 mb-4">
      <div className="w-4 h-4 flex items-center justify-start">
        {iconToUse ? (
          <IconScout name={iconToUse as IconScoutName} size={16} color={colors.primary.auxiliar} />
        ) : null}
      </div>
      <div className="flex items-center">
        <Text
          variant="body-medium"
          fontFamily="montserrat"
          color={colors.primary.main}
        >
          {subItem.title}
        </Text>
      </div>
    </div>
  );
};

interface MenuLinkProps { 
  node: { 
    title: string; 
    url?: string;
    routeMetadata?: {
      iconName?: string;
      breadcrumbTitle?: string;
      componentName?: string;
    };
  } 
}

const MenuLink: React.FC<MenuLinkProps> = ({ node }) => {
  type LinkState = 'default' | 'hover' | 'pressed';
  const [state, setState] = React.useState<LinkState>('default');

  const stateColors = {
    default: colors.grays.neutral33,
    hover: colors.primary.main,
    pressed: colors.important.main,
  };

  const collapseDoubleSlashes = (s: string): string => s.replace(/\/{2,}/g, '/');

  const normalizeUrl = (input?: string): string => {
    const raw = (input || '').trim();
    if (!raw) return '/';
    const protocolMatch = raw.match(/^([a-z][a-z0-9+.-]*:\/\/[^/?#]+)([/?#].*)?$/i);
    if (protocolMatch) {
      const [, protoHost, rest] = protocolMatch;
      if (!rest) return protoHost;
      return protoHost + collapseDoubleSlashes(rest);
    }
    // For non-absolute URLs, ensure a single leading slash and collapse duplicates
    const ensured = raw.startsWith('/') ? raw : `/${raw}`;
    return collapseDoubleSlashes(ensured);
  };

  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (state === 'pressed') {
        setState('default');
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [state]);

  // ⭐ URL viene enriquecida desde routes.tsx via menu.mapper
  const to = normalizeUrl(node.url);

  return (
    <Link
      to={to}
      className="pb-2 transition-colors duration-150 outline-none block"
      style={{ color: stateColors[state] }}
      onMouseEnter={() => setState('hover')}
      onMouseLeave={() => setState('default')}
      onMouseDown={() => setState('pressed')}
      onMouseUp={() => setState('hover')}
      data-testid="menu-link-menudropdown"
    >
      <Text
        variant="subheader-regular"
        fontFamily="montserrat"
        color="inherit"
        as="span"
        data-testid="text-subheader-menudropdown"
      >
        {node.title}
      </Text>
    </Link>
  );
};

interface MenuColumnProps {
  section: {
    title: string;
    icon?: string | null;
    routeMetadata?: {
      iconName?: string;
      breadcrumbTitle?: string;
      componentName?: string;
    };
    children?: {
      id: string | number;
      title: string;
      url?: string;
      routeMetadata?: {
        iconName?: string;
        breadcrumbTitle?: string;
        componentName?: string;
      };
    }[];
  };
}

const MenuColumn: React.FC<MenuColumnProps> = ({ section }) => (
  <div className="mb-2">
    <SubItemHeader subItem={{ 
      title: section.title, 
      icon: section.icon,
      routeMetadata: section.routeMetadata, 
    }}
    />
    {(section.children || []).map((child) => (
      <div key={child.id} className="grid grid-cols-[16px_1fr] gap-x-2">
        <div className="w-4 h-4" />
        <MenuLink node={child} />
      </div>
    ))}
  </div>
);


type NormalizedSection = {
  title: string;
  icon?: string | null;
  routeMetadata?: {
    iconName?: string;
    breadcrumbTitle?: string;
    componentName?: string;
  };
  children: {
    id: string | number;
    title: string;
    url?: string;
    routeMetadata?: {
      iconName?: string;
      breadcrumbTitle?: string;
      componentName?: string;
    };
  }[];
};

const normalizeSections = (item: any): NormalizedSection[] => {
  const sections: any[] = item?.children ?? [];
  return (sections || []).map((section: any, idx: number) => ({
    title: section?.title ?? `Section ${idx + 1}`,
    icon: (section?.icon ?? null) as string | null,
    routeMetadata: section?.routeMetadata,
    children: (section?.children ?? []).map((child: any) => ({
      id: child.id,
      title: child?.title,
      url: child?.url,
      routeMetadata: child?.routeMetadata,
    })),
  }));
};

const MenuDropdown: React.FC<MenuDropdownProps> = ({ item, position = 'left' }) => {
  const positionClasses = getPositionClasses(position);
  const sections = normalizeSections(item);

  return (
    <div
      className={`absolute top-full ${positionClasses} mt-1 w-max min-w-[450px] max-w-screen z-40`}
      data-testid="menu-dropdown"
      data-item-id={item.id}
    >
      <Card padding="32px" elevation={3}>
        <div className="flex gap-x-8">
          {sections.map((section, idx) => (
            <MenuColumn key={idx} section={section} />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default MenuDropdown;
