import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuIcon, mainMenuIconName, sectionIconName } from '@/components/ui/menu';
import { useMenu, type MenuItem } from '@/api';

export interface SectionConfig {
  items: MenuItem[] | string[];
  onItemClick: (item: MenuItem | string, index: number) => void;
  getIcon?: (item: MenuItem | string, index: number) => ReactNode;
  showRightArrow?: boolean;
  className?: string;
}

type MenuLevel = { type: 'main' | 'submenu'; title: string; items?: MenuItem[] };

export function useSideMenu() {
  const navigate = useNavigate();
  const { mainMenu, configMenu } = useMenu();
  const [navigationStack, setNavigationStack] = useState<MenuLevel[]>([
    { type: 'main', title: 'Categorías', items: mainMenu },
  ]);

  const currentLevel = navigationStack[navigationStack.length - 1];

  const contentConfig = useMemo(() => {
    if (currentLevel.type === 'main') {
      const sections: SectionConfig[] = [
        {
          items: mainMenu,
          onItemClick: (item) => {
            if (typeof item !== 'string' && item.children?.length) {
              setNavigationStack((stack) => [
                ...stack,
                { type: 'submenu', title: item.title, items: [item] },
              ]);
            }
          },
          getIcon: (item) => (
            <MenuIcon
              name={typeof item !== 'string' ? mainMenuIconName(item) : 'layers'}
              size={18}
              className="text-slate-300"
            />
          ),
        },
      ];

      if (configMenu) {
        sections.push({
          items: [configMenu],
          onItemClick: (item) => {
            if (typeof item !== 'string') {
              setNavigationStack((stack) => [
                ...stack,
                { type: 'submenu', title: item.title, items: [item] },
              ]);
            }
          },
          getIcon: () => (
            <MenuIcon name="setting" size={18} className="text-slate-300" />
          ),
        });
      }

      return { main: sections, submenu: [] as SectionConfig[] };
    }

    const activeItem = currentLevel.items?.[0];
    const sections: SectionConfig[] = (activeItem?.children ?? []).map((section) => ({
      items: section.children?.map((child) => child.title) ?? [],
      showRightArrow: false,
      onItemClick: (_, index) => {
        const child = section.children?.[index];
        if (child?.url) {
          navigate(child.url.startsWith('/') ? child.url : `/${child.url}`);
        }
      },
      getIcon: () => (
        <MenuIcon
          name={sectionIconName(section.icon)}
          size={18}
          className="text-slate-300"
        />
      ),
    }));

    return { main: [] as SectionConfig[], submenu: sections };
  }, [configMenu, currentLevel, mainMenu, navigate]);

  const handleBack = () => {
    setNavigationStack((stack) => (stack.length > 1 ? stack.slice(0, -1) : stack));
  };

  const handleClose = (onClose: () => void) => {
    setNavigationStack([{ type: 'main', title: 'Categorías', items: mainMenu }]);
    onClose();
  };

  return {
    currentLevel,
    navigationStack,
    contentConfig: {
      main: contentConfig.main,
      submenu: contentConfig.submenu,
    },
    handleBack,
    handleClose,
  };
}
