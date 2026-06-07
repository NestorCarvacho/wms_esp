import { apiRequest, getBaseUrl, getToken } from '@/api/client';
import { buildListQuery, type PaginatedListParams, type SortDirection } from '@/api/listQuery';
import type {
  BodegaConfigInventario,
  InventarioDashboardResumen,
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

export interface InventarioDashboardParams {
  empresaId?: number;
  bodegaId?: number;
  dias?: number;
}

export async function obtenerDashboardInventario(params: InventarioDashboardParams = {}) {
  const { empresaId, bodegaId, dias } = params;
  let path = withEmpresaQuery('/api/v1/inventario/dashboard', empresaId);
  const extra: string[] = [];
  if (bodegaId != null) extra.push(`bodega_id=${bodegaId}`);
  if (dias != null) extra.push(`dias=${dias}`);
  if (extra.length) {
    const sep = path.includes('?') ? '&' : '?';
    path = `${path}${sep}${extra.join('&')}`;
  }
  const response = await apiRequest<InventarioDashboardResumen>(path);
  return response.datos!;
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

export type InventarioExportFormat = 'xlsx' | 'pdf';

export interface InventarioExportParams {
  empresaId?: number;
  ordenarPor?: string;
  orden?: SortDirection;
  extra?: PaginatedListParams['extra'];
}

async function descargarReporteInventario(
  path: string,
  formato: InventarioExportFormat,
  params: InventarioExportParams = {},
  defaultFilename: string,
): Promise<void> {
  const token = getToken();
  const query = buildListQuery({
    pagina: 1,
    porPagina: 1,
    empresaId: params.empresaId,
    ordenarPor: params.ordenarPor,
    orden: params.orden,
    extra: params.extra,
  });
  const url = `${getBaseUrl()}${path}?formato=${formato}&${query}`;
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const text = await response.text();
    let message = 'Error al exportar reporte';
    try {
      const body = JSON.parse(text) as { detail?: string; mensaje?: string };
      message = body.detail ?? body.mensaje ?? message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }
  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') ?? '';
  const match = disposition.match(/filename="?([^"]+)"?/i);
  const filename = match?.[1] ?? defaultFilename;
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

export async function exportarStockInventario(
  formato: InventarioExportFormat,
  params: InventarioExportParams = {},
): Promise<void> {
  const ext = formato === 'xlsx' ? 'xlsx' : 'pdf';
  await descargarReporteInventario(
    '/api/v1/inventario/stock/export',
    formato,
    params,
    `stock_ubicacion.${ext}`,
  );
}

export async function exportarMovimientosInventario(
  formato: InventarioExportFormat,
  params: InventarioExportParams = {},
): Promise<void> {
  const ext = formato === 'xlsx' ? 'xlsx' : 'pdf';
  await descargarReporteInventario(
    '/api/v1/inventario/movimientos/export',
    formato,
    params,
    `movimientos_inventario.${ext}`,
  );
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
