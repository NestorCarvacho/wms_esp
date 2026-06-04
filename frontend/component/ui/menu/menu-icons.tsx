import { IconScout, type IconScoutName } from '@/components/ui/images/IconScout';
import type { MenuItem } from '@/api/menuConfig';

export function mainMenuIconName(item: MenuItem): IconScoutName {
  if (item.title === 'Inventario') return 'folderOpen';
  if (item.title === 'Administración') return 'usersAlt';
  if (item.title === 'Configuración') return 'setting';
  return 'layers';
}

export function sectionIconName(icon?: string | null): IconScoutName {
  const allowed: IconScoutName[] = [
    'folderOpen',
    'usersAlt',
    'setting',
    'building',
    'layers',
    'table',
    'user',
    'lock',
    'home',
  ];
  if (icon && allowed.includes(icon as IconScoutName)) {
    return icon as IconScoutName;
  }
  return 'layers';
}

export function MenuIcon({
  name,
  size = 16,
  className,
}: {
  name: IconScoutName;
  size?: number | 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return <IconScout name={name} size={size} color="currentColor" className={className} />;
}
