export interface MenuLinkNode {
  id: string | number;
  title: string;
  url?: string;
  icon?: string | null;
  /** Permiso requerido para ver el enlace (ej. productos.leer). */
  permission?: string;
  routeMetadata?: {
    iconName?: string;
    breadcrumbTitle?: string;
    componentName?: string;
  };
}

export interface MenuSection {
  title: string;
  icon?: string | null;
  routeMetadata?: MenuLinkNode['routeMetadata'];
  children?: MenuLinkNode[];
}

export interface MenuItem {
  id: number;
  title: string;
  children?: MenuSection[];
}

const ROUTE_PERMISSIONS: Record<string, string> = {
  '/productos': 'productos.leer',
  '/tipos-producto': 'tipos_producto.leer',
  '/unidades-medida': 'unidades_medida.leer',
  '/bodegas': 'bodegas.leer',
  '/tipos-zona': 'tipos_zona.leer',
  '/zonas-bodega': 'zonas_bodega.leer',
  '/usuarios': 'usuarios.leer',
  '/cargos': 'cargos.leer',
  '/roles': 'roles.leer',
  '/asignar-permisos': 'roles.leer',
  '/permisos': 'permisos.leer',
  '/empresas': 'empresas.leer',
};

function withPermissions(node: MenuLinkNode): MenuLinkNode {
  if (!node.url || node.permission) return node;
  const permission = ROUTE_PERMISSIONS[node.url];
  return permission ? { ...node, permission } : node;
}

function filterByPermissions(items: MenuItem[], permisos: string[]): MenuItem[] {
  const canSee = (permission?: string) => !permission || permisos.includes(permission);

  return items
    .map((item) => ({
      ...item,
      children: item.children
        ?.map((section) => ({
          ...section,
          children: section.children
            ?.map(withPermissions)
            .filter((link) => canSee(link.permission)),
        }))
        .filter((section) => (section.children?.length ?? 0) > 0),
    }))
    .filter((item) => (item.children?.length ?? 0) > 0);
}

export function buildWmsMenu(
  isSuperAdmin: boolean,
  permisos: string[] = [],
): { mainMenu: MenuItem[]; configMenu: MenuItem | null } {
  const mainMenu: MenuItem[] = [
    {
      id: 1,
      title: 'Inventario',
      children: [
        {
          title: 'Catálogo',
          icon: 'folderOpen',
          children: [
            { id: 'productos', title: 'Productos', url: '/productos', routeMetadata: { iconName: 'table', breadcrumbTitle: 'Productos' } },
            { id: 'tipos-producto', title: 'Tipos de producto', url: '/tipos-producto', routeMetadata: { iconName: 'layers', breadcrumbTitle: 'Tipos de producto' } },
            { id: 'unidades', title: 'Unidades de medida', url: '/unidades-medida', routeMetadata: { iconName: 'layers', breadcrumbTitle: 'Unidades de medida' } },
          ],
        },
        {
          title: 'Almacén',
          icon: 'building',
          children: [
            { id: 'bodegas', title: 'Bodegas', url: '/bodegas', routeMetadata: { iconName: 'building', breadcrumbTitle: 'Bodegas' } },
            { id: 'tipos-zona', title: 'Tipos de zona', url: '/tipos-zona', routeMetadata: { iconName: 'layers', breadcrumbTitle: 'Tipos de zona' } },
            { id: 'zonas-bodega', title: 'Zonas de bodega', url: '/zonas-bodega', routeMetadata: { iconName: 'layers', breadcrumbTitle: 'Zonas de bodega' } },
          ],
        },
      ],
    },
    {
      id: 2,
      title: 'Administración',
      children: [
        {
          title: 'Accesos',
          icon: 'usersAlt',
          children: [
            { id: 'usuarios', title: 'Usuarios', url: '/usuarios', routeMetadata: { iconName: 'user', breadcrumbTitle: 'Usuarios' } },
            { id: 'cargos', title: 'Cargos', url: '/cargos', routeMetadata: { iconName: 'user', breadcrumbTitle: 'Cargos' } },
            { id: 'roles', title: 'Roles', url: '/roles', routeMetadata: { iconName: 'lock', breadcrumbTitle: 'Roles' } },
            { id: 'asignar-permisos', title: 'Asignar permisos', url: '/asignar-permisos', routeMetadata: { iconName: 'lock', breadcrumbTitle: 'Asignar permisos' } },
            { id: 'permisos', title: 'Permisos', url: '/permisos', routeMetadata: { iconName: 'lock', breadcrumbTitle: 'Permisos' } },
          ],
        },
      ],
    },
  ];

  const configChildren: MenuLinkNode[] = [
    { id: 'inicio', title: 'Panel principal', url: '/', routeMetadata: { iconName: 'home', breadcrumbTitle: 'Inicio' } },
  ];

  if (isSuperAdmin) {
    configChildren.push({
      id: 'empresas',
      title: 'Empresas',
      url: '/empresas',
      routeMetadata: { iconName: 'building', breadcrumbTitle: 'Empresas' },
    });
  }

  const configMenu: MenuItem = {
    id: 99,
    title: 'Configuración',
    children: [
      {
        title: 'Sistema',
        icon: 'setting',
        children: configChildren,
      },
    ],
  };

  if (permisos.length === 0) {
    return { mainMenu, configMenu };
  }

  return {
    mainMenu: filterByPermissions(mainMenu, permisos),
    configMenu: filterByPermissions([configMenu], permisos)[0] ?? null,
  };
}

export function flattenMenuLinks(items: MenuItem[]): { label: string; value: string; url: string }[] {
  const links: { label: string; value: string; url: string }[] = [];

  for (const item of items) {
    for (const section of item.children ?? []) {
      for (const child of section.children ?? []) {
        if (child.url) {
          links.push({
            label: child.title,
            value: child.url,
            url: child.url,
          });
        }
      }
    }
  }

  return links;
}

export { ROUTE_PERMISSIONS };
