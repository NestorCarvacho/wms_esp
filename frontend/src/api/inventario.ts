import { apiRequest } from '@/api/client';
import { buildListQuery, type PaginatedListParams } from '@/api/listQuery';
import type {
  BodegaConfigInventario,
  InventarioOperacionPayload,
  PaginatedMovimientosInventario,
  PaginatedStockZona,
  RecepcionPayload,
} from '@/types/api';

function withEmpresaQuery(path: string, empresaId?: number): string {
  if (empresaId == null) return path;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}empresa_id=${empresaId}`;
}

export async function listarStockInventario(params: PaginatedListParams = {}) {
  const { extra, ...rest } = params;
  const response = await apiRequest<PaginatedStockZona>(
    `/api/v1/inventario/stock?${buildListQuery({ ...rest, extra })}`,
  );
  return response.datos!;
}

export async function listarMovimientosInventario(params: PaginatedListParams = {}) {
  const { extra, ...rest } = params;
  const response = await apiRequest<PaginatedMovimientosInventario>(
    `/api/v1/inventario/movimientos?${buildListQuery({ ...rest, extra })}`,
  );
  return response.datos!;
}

export async function recepcionarInventario(data: RecepcionPayload, empresaId?: number) {
  const response = await apiRequest<Record<string, unknown>>(
    withEmpresaQuery('/api/v1/inventario/recepcion', empresaId),
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
  return response.datos!;
}

export async function trasladarInventario(data: InventarioOperacionPayload, empresaId?: number) {
  const response = await apiRequest<Record<string, unknown>>(
    withEmpresaQuery('/api/v1/inventario/traslado', empresaId),
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
  return response.datos!;
}

export async function despacharInventario(
  data: Omit<InventarioOperacionPayload, 'zona_destino_id'>,
  empresaId?: number,
) {
  const response = await apiRequest<Record<string, unknown>>(
    withEmpresaQuery('/api/v1/inventario/despacho', empresaId),
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
  return response.datos!;
}

export async function obtenerConfigInventarioBodega(bodegaId: number, empresaId?: number) {
  const response = await apiRequest<BodegaConfigInventario>(
    withEmpresaQuery(`/api/v1/inventario/bodegas/${bodegaId}/configuracion`, empresaId),
  );
  return response.datos!;
}

export async function actualizarConfigInventarioBodega(
  bodegaId: number,
  zonaRecepcionDefaultId: number | null,
  empresaId?: number,
) {
  const response = await apiRequest<BodegaConfigInventario>(
    withEmpresaQuery(`/api/v1/inventario/bodegas/${bodegaId}/configuracion`, empresaId),
    {
      method: 'PUT',
      body: JSON.stringify({ zona_recepcion_default_id: zonaRecepcionDefaultId }),
    },
  );
  return response.datos!;
}
