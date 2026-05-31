import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getRouteByPath, getRouteByCode } from '@/routes';
import type { IconScoutName } from '@/components/ui/images/IconScout';


interface BreadcrumbItem {
  text: string;
  href?: string;
}

export interface BreadcrumbData {
  icon?: IconScoutName;
  items: BreadcrumbItem[];
  title: string;
  backTo?: string;
}

/**
 * Hook to automatically fetch breadcrumb data based on current route
 * Retrieves icon, items, title, and backTo path from route definitions
 * If the current route has no icon, it searches the root route (first digit of code)
 */
export const useBreadcrumb = (): BreadcrumbData | null => {
  const location = useLocation();

  return useMemo(() => {
    const route = getRouteByPath(location.pathname);
    
    if (!route) {
      return null;
    }

    // If route has no icon, try to get it from the root route (first digit of code)
    let icon = route.icon;
    if (!icon && route.code) {
      const rootCode = route.code.split('.')[0];
      const rootRoute = getRouteByCode(rootCode);
      icon = rootRoute?.icon;
    }

    return {
      icon,
      items: route.breadcrumb.items,
      title: route.breadcrumb.title,
      backTo: route.breadcrumb.parentPath,
    };
  }, [location.pathname]);
};
