import { appPath } from '@/routes/paths';

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
  [appPath('/productos')]: 'productos.leer',
  [appPath('/productos/consulta')]: 'productos.leer',
  [appPath('/tipos-producto')]: 'tipos_producto.leer',
  [appPath('/unidades-medida')]: 'unidades_medida.leer',
  [appPath('/bodegas')]: 'bodegas.leer',
  [appPath('/tipos-zona')]: 'tipos_zona.leer',
  [appPath('/zonas-bodega')]: 'zonas_bodega.leer',
  [appPath('/inventario/dashboard')]: 'inventario.leer',
  [appPath('/inventario/stock')]: 'inventario.leer',
  [appPath('/inventario/movimientos')]: 'inventario.leer',
  [appPath('/inventario/recepcion')]: 'inventario.recepcionar',
  [appPath('/inventario/traslado')]: 'inventario.trasladar',
  [appPath('/inventario/despacho')]: 'inventario.despachar',
  [appPath('/inventario/configuracion')]: 'inventario.configurar',
  [appPath('/usuarios')]: 'usuarios.leer',
  [appPath('/cargos')]: 'cargos.leer',
  [appPath('/roles')]: 'roles.leer',
  [appPath('/asignar-permisos')]: 'roles.leer',
  [appPath('/permisos')]: 'permisos.leer',
  [appPath('/empresas')]: 'empresas.leer',
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
            { id: 'productos', title: 'Productos', url: appPath('/productos'), routeMetadata: { iconName: 'table', breadcrumbTitle: 'Productos' } },
            { id: 'consulta-producto', title: 'Consulta producto', url: appPath('/productos/consulta'), routeMetadata: { iconName: 'search', breadcrumbTitle: 'Consulta producto' } },
            { id: 'tipos-producto', title: 'Tipos de producto', url: appPath('/tipos-producto'), routeMetadata: { iconName: 'layers', breadcrumbTitle: 'Tipos de producto' } },
            { id: 'unidades', title: 'Unidades de medida', url: appPath('/unidades-medida'), routeMetadata: { iconName: 'layers', breadcrumbTitle: 'Unidades de medida' } },
          ],
        },
        {
          title: 'Almacén',
          icon: 'building',
          children: [
            { id: 'bodegas', title: 'Bodegas', url: appPath('/bodegas'), routeMetadata: { iconName: 'building', breadcrumbTitle: 'Bodegas' } },
            { id: 'tipos-zona', title: 'Tipos de zona', url: appPath('/tipos-zona'), routeMetadata: { iconName: 'layers', breadcrumbTitle: 'Tipos de zona' } },
            { id: 'zonas-bodega', title: 'Zonas de bodega', url: appPath('/zonas-bodega'), routeMetadata: { iconName: 'layers', breadcrumbTitle: 'Zonas de bodega' } },
          ],
        },
      ],
    },
    {
      id: 2,
      title: 'Inventario operativo',
      children: [
        {
          title: 'Resumen',
          icon: 'home',
          children: [
            {
              id: 'inv-dashboard',
              title: 'Dashboard',
              url: appPath('/inventario/dashboard'),
              permission: 'inventario.leer',
              routeMetadata: { iconName: 'home', breadcrumbTitle: 'Dashboard inventario' },
            },
          ],
        },
        {
          title: 'Consultas',
          icon: 'table',
          children: [
            {
              id: 'inv-stock',
              title: 'Stock por ubicación',
              url: appPath('/inventario/stock'),
              permission: 'inventario.leer',
              routeMetadata: { iconName: 'table', breadcrumbTitle: 'Stock por ubicación' },
            },
            {
              id: 'inv-movimientos',
              title: 'Historial de movimientos',
              url: appPath('/inventario/movimientos'),
              permission: 'inventario.leer',
              routeMetadata: { iconName: 'table', breadcrumbTitle: 'Historial de movimientos' },
            },
          ],
        },
        {
          title: 'Operaciones',
          icon: 'layers',
          children: [
            {
              id: 'inv-recepcion',
              title: 'Recepción',
              url: appPath('/inventario/recepcion'),
              permission: 'inventario.recepcionar',
              routeMetadata: { iconName: 'layers', breadcrumbTitle: 'Recepción' },
            },
            {
              id: 'inv-traslado',
              title: 'Traslado',
              url: appPath('/inventario/traslado'),
              permission: 'inventario.trasladar',
              routeMetadata: { iconName: 'layers', breadcrumbTitle: 'Traslado' },
            },
            {
              id: 'inv-despacho',
              title: 'Despacho',
              url: appPath('/inventario/despacho'),
              permission: 'inventario.despachar',
              routeMetadata: { iconName: 'layers', breadcrumbTitle: 'Despacho' },
            },
          ],
        },
        {
          title: 'Configuración',
          icon: 'setting',
          children: [
            {
              id: 'inv-config',
              title: 'Zona de recepción',
              url: appPath('/inventario/configuracion'),
              permission: 'inventario.configurar',
              routeMetadata: { iconName: 'setting', breadcrumbTitle: 'Zona de recepción' },
            },
          ],
        },
      ],
    },
    {
      id: 3,
      title: 'Administración',
      children: [
        {
          title: 'Accesos',
          icon: 'usersAlt',
          children: [
            { id: 'usuarios', title: 'Usuarios', url: appPath('/usuarios'), routeMetadata: { iconName: 'user', breadcrumbTitle: 'Usuarios' } },
            { id: 'cargos', title: 'Cargos', url: appPath('/cargos'), routeMetadata: { iconName: 'user', breadcrumbTitle: 'Cargos' } },
            { id: 'roles', title: 'Roles', url: appPath('/roles'), routeMetadata: { iconName: 'lock', breadcrumbTitle: 'Roles' } },
            { id: 'asignar-permisos', title: 'Asignar permisos', url: appPath('/asignar-permisos'), routeMetadata: { iconName: 'lock', breadcrumbTitle: 'Asignar permisos' } },
            { id: 'permisos', title: 'Permisos', url: appPath('/permisos'), routeMetadata: { iconName: 'lock', breadcrumbTitle: 'Permisos' } },
          ],
        },
      ],
    },
  ];

  const configChildren: MenuLinkNode[] = [
    { id: 'inicio', title: 'Panel principal', url: appPath(), routeMetadata: { iconName: 'home', breadcrumbTitle: 'Inicio' } },
  ];

  if (isSuperAdmin) {
    configChildren.push({
      id: 'empresas',
      title: 'Empresas',
      url: appPath('/empresas'),
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
