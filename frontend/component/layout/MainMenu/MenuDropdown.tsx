import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/cards/Card';
import { MenuIcon, sectionIconName } from '@/components/ui/menu';
import { cn } from '@/lib/utils';

interface MenuDropdownProps {
  item: { id: number; title: string; children?: unknown[] };
}

interface SubItemHeaderProps {
  subItem: {
    title: string;
    icon?: string | null;
    routeMetadata?: { iconName?: string };
  };
}

const SubItemHeader: React.FC<SubItemHeaderProps> = ({ subItem }) => {
  const iconToUse = sectionIconName(subItem.routeMetadata?.iconName || subItem.icon);

  return (
    <div className="grid grid-cols-[20px_1fr] gap-x-2 mb-3">
      <MenuIcon name={iconToUse} size={16} className="text-slate-500" />
      <h3 className="text-sm font-semibold text-foreground">{subItem.title}</h3>
    </div>
  );
};

interface MenuLinkProps {
  node: { title: string; url?: string };
}

const MenuLink: React.FC<MenuLinkProps> = ({ node }) => {
  const normalizeUrl = (input?: string): string => {
    const raw = (input || '').trim();
    if (!raw) return '/';
    const ensured = raw.startsWith('/') ? raw : `/${raw}`;
    return ensured.replace(/\/{2,}/g, '/');
  };

  return (
    <Link
      to={normalizeUrl(node.url)}
      className={cn(
        'block py-1.5 text-sm text-muted-foreground transition-colors',
        'hover:text-foreground focus-visible:outline-none focus-visible:text-emerald-600 dark:focus-visible:text-emerald-400',
      )}
      data-testid="menu-link-menudropdown"
    >
      {node.title}
    </Link>
  );
};

type NormalizedSection = {
  title: string;
  icon?: string | null;
  routeMetadata?: { iconName?: string };
  children: {
    id: string | number;
    title: string;
    url?: string;
    routeMetadata?: { iconName?: string };
  }[];
};

const normalizeSections = (item: MenuDropdownProps['item']): NormalizedSection[] => {
  const sections: {
    title?: string;
    icon?: string;
    routeMetadata?: { iconName?: string };
    children?: unknown[];
  }[] = (item?.children as typeof sections) ?? [];
  return sections.map((section, idx) => ({
    title: section?.title ?? `Sección ${idx + 1}`,
    icon: section?.icon ?? null,
    routeMetadata: section?.routeMetadata,
    children: ((section?.children ?? []) as NormalizedSection['children']).map((child) => ({
      id: child.id,
      title: child.title,
      url: child.url,
      routeMetadata: child.routeMetadata,
    })),
  }));
};

/** Panel mega-menú (contenido dentro de DropdownMenuContent). */
const MenuDropdown: React.FC<MenuDropdownProps> = ({ item }) => {
  const sections = normalizeSections(item);

  return (
    <Card
      elevation={3}
      padding="24px"
      className="border-slate-200"
      data-testid="menu-dropdown"
      data-item-id={item.id}
    >
      <div className="flex gap-8">
        {sections.map((section, idx) => (
          <div key={idx} className="min-w-[160px]">
            <SubItemHeader subItem={section} />
            {(section.children || []).map((child) => (
              <div key={child.id} className="grid grid-cols-[20px_1fr] gap-x-2 pl-0">
                <span />
                <MenuLink node={child} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MenuDropdown;
