import { apiRequest } from '@/api/client';
import { listarProductos } from '@/api/productos';
import type { BarcodeResolucion, Producto } from '@/types/api';

/** Resuelve un código de barras contra la tabla producto_presentacion. */
export async function resolverBarcode(
  codigo: string,
  empresaId?: number,
): Promise<BarcodeResolucion | null> {
  const term = codigo.trim();
  if (!term) return null;
  try {
    const query = empresaId != null ? `?empresa_id=${empresaId}` : '';
    const res = await apiRequest<BarcodeResolucion>(
      `/api/v1/productos/barcode/${encodeURIComponent(term)}${query}`,
    );
    return res.datos ?? null;
  } catch {
    return null;
  }
}

/** Resuelve producto por SKU/código de barras (coincidencia exacta, sin distinguir mayúsculas). */
export async function buscarProductoPorSku(
  sku: string,
  empresaId?: number,
): Promise<Producto | null> {
  const term = sku.trim();
  if (!term) return null;

  const res = await listarProductos({
    pagina: 1,
    porPagina: 100,
    buscar: term,
    ...(empresaId != null ? { empresaId } : {}),
  });

  const lower = term.toLowerCase();
  const exact = res.productos.find((p) => p.sku.toLowerCase() === lower);
  if (exact) return exact;

  return res.productos.length === 1 ? res.productos[0] : null;
}

export function indiceProductosPorSku(productos: Producto[]): Map<string, Producto> {
  const map = new Map<string, Producto>();
  for (const p of productos) {
    map.set(p.sku.trim().toLowerCase(), p);
  }
  return map;
}
