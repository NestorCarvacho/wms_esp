/** Prefijo de rutas de la aplicación (post-login). La landing pública vive en `/`. */
export const APP_BASE = '/app';

export function appPath(path: string = ''): string {
  if (!path || path === '/') return APP_BASE;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${APP_BASE}${normalized}`;
}

export const PATHS = {
  landing: '/',
  login: '/login',
  app: APP_BASE,
  perfil: appPath('/perfil'),
  productos: appPath('/productos'),

  // Marketing / SEO
  precios: '/precios',
  contacto: '/contacto',
  demo: '/demo',
  softwareBodega: '/software-bodega',
  controlInventario: '/control-inventario',
  wmsPyme: '/wms-pyme',
  multiEmpresa: '/multi-empresa',
  compararExcel: '/comparar/excel',
  nosotros: '/nosotros',
  privacidad: '/privacidad',
  terminos: '/terminos',
  blog: '/blog',
} as const;
