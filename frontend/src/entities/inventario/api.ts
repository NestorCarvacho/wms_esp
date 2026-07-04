/** Capa entity — API de inventario (re-export desde cliente legacy). */
export {
  actualizarConfigInventarioBodega,
  despacharInventario,
  exportarMovimientosInventario,
  exportarStockInventario,
  listarMovimientosInventario,
  listarStockInventario,
  obtenerConfigInventarioBodega,
  recepcionarInventario,
  trasladarInventario,
  type InventarioExportFormat,
  type InventarioExportParams,
} from '@/api/inventario';
