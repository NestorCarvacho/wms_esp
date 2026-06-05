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
