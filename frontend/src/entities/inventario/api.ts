/** Capa entity — API de inventario (re-export desde cliente legacy). */
export {
  actualizarConfigInventarioBodega,
  despacharInventario,
  exportarMovimientosInventario,
  exportarStockInventario,
  listarMovimientosInventario,
  listarStockInventario,
  obtenerConfigInventarioBodega,
  obtenerDashboardInventario,
  recepcionarInventario,
  trasladarInventario,
  type InventarioDashboardParams,
  type InventarioExportFormat,
  type InventarioExportParams,
} from '@/api/inventario';
