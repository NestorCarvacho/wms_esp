import { Link, useLocation } from 'react-router-dom';
import {
  INVENTARIO_NAV_ITEMS,
  type InventarioVista,
} from '@/pages/inventario/inventarioViews';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';

interface InventarioOperativoNavProps {
  active: InventarioVista;
}

export function InventarioOperativoNav({ active }: InventarioOperativoNavProps) {
  const { tienePermiso } = usePermissions();
  const location = useLocation();

  const tabs = INVENTARIO_NAV_ITEMS.filter((item) => tienePermiso(item.permission));

  if (tabs.length <= 1) {
    return null;
  }

  return (
    <nav
      className="mb-4 flex gap-1 overflow-x-auto border-b border-border pb-0"
      aria-label="Inventario operativo"
    >
      {tabs.map((tab) => {
        const isActive = tab.vista === active || location.pathname === tab.path;
        return (
          <Link
            key={tab.vista}
            to={tab.path}
            className={cn(
              'shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
