import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { IconScoutName } from '@/components/ui/images/IconScout';
import { buildWmsMenu } from '@/api/menuConfig';
import { useAuthContext } from '@/context/AuthContext';

export function useBreadcrumb() {
  const location = useLocation();
  const { isSuperAdmin, permisos } = useAuthContext();

  return useMemo(() => {
    const { mainMenu, configMenu } = buildWmsMenu(isSuperAdmin, permisos);
    const allMenus = configMenu ? [...mainMenu, configMenu] : mainMenu;

    for (const menu of allMenus) {
      for (const section of menu.children ?? []) {
        for (const child of section.children ?? []) {
          const url = child.url?.startsWith('/') ? child.url : `/${child.url ?? ''}`;
          if (url === location.pathname || (url === '/' && location.pathname === '/')) {
            return {
              icon: (child.routeMetadata?.iconName ?? 'home') as IconScoutName,
              title: child.routeMetadata?.breadcrumbTitle ?? child.title,
              items: [
                { text: menu.title },
                { text: section.title },
                { text: child.title },
              ],
              backTo: url === '/' ? undefined : '/',
            };
          }
        }
      }
    }

    if (location.pathname === '/perfil') {
      return {
        icon: 'user' as IconScoutName,
        title: 'Mi perfil',
        items: [{ text: 'Inicio' }, { text: 'Mi perfil' }],
        backTo: '/',
      };
    }

    if (location.pathname === '/') {
      return {
        icon: 'home' as IconScoutName,
        title: 'Panel principal',
        items: [{ text: 'Inicio' }],
      };
    }

    return null;
  }, [isSuperAdmin, permisos, location.pathname]);
}
