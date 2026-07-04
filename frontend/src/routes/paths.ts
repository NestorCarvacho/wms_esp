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
} as const;
