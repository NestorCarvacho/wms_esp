import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconScout } from '@/components/ui/images/IconScout';
import { colors } from '@/assets/styles/colors';
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
  const [navigationStack, setNavigationStack] = useState<MenuLevel[]>([{ type: 'main', title: 'Categorías', items: mainMenu }]);

  const currentLevel = navigationStack[navigationStack.length - 1];

  const contentConfig = useMemo(() => {
    if (currentLevel.type === 'main') {
      const sections: SectionConfig[] = [
        {
          items: mainMenu,
          onItemClick: (item) => {
            if (typeof item !== 'string' && item.children?.length) {
              setNavigationStack((stack) => [...stack, { type: 'submenu', title: item.title, items: [item] }]);
            }
          },
          getIcon: (_, index) => (
            <IconScout name={index === 0 ? 'folderOpen' : 'usersAlt'} size={16} color={colors.grays.neutralFF} />
          ),
        },
      ];

      if (configMenu) {
        sections.push({
          items: [configMenu],
          onItemClick: (item) => {
            if (typeof item !== 'string') {
              setNavigationStack((stack) => [...stack, { type: 'submenu', title: item.title, items: [item] }]);
            }
          },
          getIcon: () => <IconScout name="setting" size={16} color={colors.grays.neutralFF} />,
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
