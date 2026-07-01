/** Capa entity — API de productos (re-export desde cliente legacy). */
export {
  actualizarProducto,
  consultarProducto,
  crearProducto,
  eliminarProducto,
  listarProductos,
} from '@/api/productos';

export { listarTiposProducto } from '@/api/tiposProducto';
export { listarUnidadesMedida } from '@/api/unidadesMedida';

export type {
  Producto,
  ProductoConsultaDetalle,
  TipoProducto,
  UnidadMedida,
} from '@/types/api';
