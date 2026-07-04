import { appPath } from '@/routes/paths';

export type InventarioVista =
  | 'stock'
  | 'movimientos'
  | 'recepcion'
  | 'traslado'
  | 'despacho'
  | 'configuracion';

export const INVENTARIO_VISTA_META: Record<
  InventarioVista,
  { title: string; section: string; permission: string }
> = {
  stock: { title: 'Stock por ubicación', section: 'Consultas', permission: 'inventario.leer' },
  movimientos: { title: 'Historial de movimientos', section: 'Consultas', permission: 'inventario.leer' },
  recepcion: { title: 'Recepción', section: 'Operaciones', permission: 'inventario.recepcionar' },
  traslado: { title: 'Traslado', section: 'Operaciones', permission: 'inventario.trasladar' },
  despacho: { title: 'Despacho', section: 'Operaciones', permission: 'inventario.despachar' },
  configuracion: {
    title: 'Zona de recepción',
    section: 'Configuración',
    permission: 'inventario.configurar',
  },
};

export const INVENTARIO_ROUTE_PATHS: Record<InventarioVista, string> = {
  stock: appPath('/inventario/stock'),
  movimientos: appPath('/inventario/movimientos'),
  recepcion: appPath('/inventario/recepcion'),
  traslado: appPath('/inventario/traslado'),
  despacho: appPath('/inventario/despacho'),
  configuracion: appPath('/inventario/configuracion'),
};

/** Pestañas del módulo inventario operativo (orden de navegación). */
export const INVENTARIO_NAV_ITEMS: {
  vista: InventarioVista;
  label: string;
  permission: string;
  path: string;
}[] = [
  { vista: 'stock', label: 'Stock', permission: 'inventario.leer', path: INVENTARIO_ROUTE_PATHS.stock },
  { vista: 'movimientos', label: 'Movimientos', permission: 'inventario.leer', path: INVENTARIO_ROUTE_PATHS.movimientos },
  { vista: 'recepcion', label: 'Recepción', permission: 'inventario.recepcionar', path: INVENTARIO_ROUTE_PATHS.recepcion },
  { vista: 'traslado', label: 'Traslado', permission: 'inventario.trasladar', path: INVENTARIO_ROUTE_PATHS.traslado },
  { vista: 'despacho', label: 'Despacho', permission: 'inventario.despachar', path: INVENTARIO_ROUTE_PATHS.despacho },
  { vista: 'configuracion', label: 'Configuración', permission: 'inventario.configurar', path: INVENTARIO_ROUTE_PATHS.configuracion },
];
