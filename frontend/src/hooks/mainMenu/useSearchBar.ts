import { useMemo } from 'react';
import { buildWmsMenu, flattenMenuLinks } from '@/api/menuConfig';
import { useAuthContext } from '@/context/AuthContext';

export function useSearchBar() {
  const { isSuperAdmin } = useAuthContext();
  const options = useMemo(() => {
    const { mainMenu, configMenu } = buildWmsMenu(isSuperAdmin);
    const allItems = configMenu ? [...mainMenu, configMenu] : mainMenu;
    return flattenMenuLinks(allItems).map((link) => ({
      label: link.label,
      value: link.value,
    }));
  }, [isSuperAdmin]);

  const getTargetForValue = (value: string | string[]) => {
    const selected = Array.isArray(value) ? value[0] : value;
    return selected || '';
  };

  return { options, getTargetForValue };
}
