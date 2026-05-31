import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/assets/styles/colors';
import { IconScout } from '@/components/ui/images/IconScout';
import { useMenu } from '@/api';


interface NavigationLevel {
  title: string;
  type: 'main' | 'category' | 'subcategory' | 'config';
  items?: any[];
  parentData?: any;
}

interface SectionConfig {
  items: any[];
  onItemClick: (item: any, index?: number) => void;
  getIcon?: (item: any, index?: number) => React.ReactNode;
  showRightArrow?: boolean;
  className?: string;
}

export const useSideMenu = () => {
  const navigate = useNavigate();
  const [navigationStack, setNavigationStack] = useState<NavigationLevel[]>([
    { title: 'Menú', type: 'main' },
  ]);

  const currentLevel = navigationStack[navigationStack.length - 1];
  const { mainMenu, configMenu } = (useMenu() as unknown) as {
    mainMenu: { id: number; title?: string; children?: any[] }[];
    configMenu: { id: number; title?: string; children?: any[] } | null;
  };

  const flattenMenuItems = (items: any[]) => {
    if (!Array.isArray(items)) return [];
    if (items.some((menuItem) => Array.isArray(menuItem?.subItems))) {
      return items.flatMap((column) =>
        (column?.subItems || []).map((subItemSection: any) => ({
          title: subItemSection?.title,
          items: (subItemSection?.items || []).map(
            (leafItem: any) => ({
              title: leafItem?.title,
              url: leafItem?.url,
            }),
          ),
        })),
      );
    }
    return items.map((section: any) => ({
      title: section?.title,
      items: (section?.children || []).map(
        (childItem: any) => ({
          title: childItem?.title,
          url: childItem?.url,
        }),
      ),
    }));
  };

  const handleSubItemNavigation = (item: { title: string; url?: string }) => {
    const rawUrl = (item?.url || '').trim();
    if (!rawUrl) return;
    const targetUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : (rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`);
    void navigate(targetUrl);
  };

  const getMenuIcon = ( item: { title: string; icon: string }) => {
    const providedIcon = (item.icon || '').trim();
    if (providedIcon) {
      return <IconScout name={providedIcon as any} />;
    } else {
      const iconMap: { [key: string]: React.ReactElement } = {
        'Mi asistencia': <IconScout name="clockThree" />,
        'Administración': <IconScout name="cog" />,
        'Gestión': <IconScout name="building" />,
        'Informes': <IconScout name="chart" />,
        'Masivo': <IconScout name="usersAlt" />,
        'Ejemplo': <IconScout name="layers" />,
      };
      return iconMap[item.title] || <IconScout name="clockThree" />;
    }
  };

  const handleNavigateToCategory = (item: any) => {
    setNavigationStack((previousNavigation) => [...previousNavigation, {
      title: item.title,
      type: 'category',
      items: item.children ?? item.columns,
      parentData: item,
    }]);
  };

  const handleNavigateToSubCategory = (subItem: any) => {
    setNavigationStack((previousNavigation) => [...previousNavigation, {
      title: subItem.title,
      type: 'subcategory',
      items: subItem.items,
      parentData: subItem,
    }]);
  };

  const handleNavigateToConfig = () => {
    setNavigationStack((previousNavigation) => [...previousNavigation, {
      title: 'Configuración',
      type: 'config',
      items: (configMenu?.children ?? []),
    }]);
  };

  const handleNavigateToConfigSubSection = (subItem: any) => {
    setNavigationStack((previousNavigation) => [...previousNavigation, {
      title: subItem.title,
      type: 'subcategory',
      items: subItem.items,
      parentData: subItem,
    }]);
  };

  const handleBack = () => {
    if (navigationStack.length > 1) {
      setNavigationStack((previousNavigation) => previousNavigation.slice(0, -1));
    }
  };

  const handleClose = (onClose: () => void) => {
    setNavigationStack([{ title: 'Menú', type: 'main' }]);
    onClose();
  };

  const contentConfig: Record<string, SectionConfig[]> = {
    main: [
      {
        items: mainMenu,
        onItemClick: handleNavigateToCategory,
        getIcon: (item: any) => getMenuIcon(item),
        className: 'mb-4',
      },
      {
        items: [{ title: 'Configuración' }],
        onItemClick: handleNavigateToConfig,
        getIcon: () => <IconScout name="setting" size="md" color={colors.grays.neutralFF} />,
        className: 'pt-2',
      },
    ],
    category: [
      {
        items: flattenMenuItems(currentLevel.items || []),
        onItemClick: handleNavigateToSubCategory,
      },
    ],
    config: [
      {
        items: flattenMenuItems(currentLevel.items || []),
        onItemClick: handleNavigateToConfigSubSection,
      },
    ],
    subcategory: [
      {
        items: currentLevel.items || [],
        onItemClick: (item: { title: string; url?: string }) => handleSubItemNavigation(item),
        showRightArrow: false,
      },
    ],
  };

  return {
    currentLevel,
    navigationStack,
    contentConfig,
    handleBack,
    handleClose,
  };
};

export type { NavigationLevel, SectionConfig };
