import { apiRequest } from '@/api/client';
import type {
  PaginatedSeriesProducto,
  SerieDespacharRequest,
  SerieProducto,
  SerieRecepcionarRequest,
  SerieTrasladarRequest,
} from '@/types/api';

const BASE = '/api/v1/inventario/series';

export async function recepcionarSerie(data: SerieRecepcionarRequest): Promise<{ serie_id: number; numero_serie: string }> {
  const res = await apiRequest<{ serie_id: number; numero_serie: string }>(
    `${BASE}/recepcionar`,
    { method: 'POST', body: JSON.stringify(data) },
  );
  return res.datos!;
}

export async function trasladarSerie(data: SerieTrasladarRequest): Promise<{ serie_id: number }> {
  const res = await apiRequest<{ serie_id: number }>(
    `${BASE}/trasladar`,
    { method: 'POST', body: JSON.stringify(data) },
  );
  return res.datos!;
}

export async function despacharSerie(data: SerieDespacharRequest): Promise<{ serie_id: number }> {
  const res = await apiRequest<{ serie_id: number }>(
    `${BASE}/despachar`,
    { method: 'POST', body: JSON.stringify(data) },
  );
  return res.datos!;
}

export async function ubicarSerie(numeroSerie: string): Promise<SerieProducto> {
  const res = await apiRequest<SerieProducto>(`${BASE}/${encodeURIComponent(numeroSerie)}`);
  return res.datos!;
}

export async function listarSeriesProducto(
  productoId: number,
  params: { estado?: string; zonaBodegaId?: number; pagina?: number; porPagina?: number } = {},
): Promise<PaginatedSeriesProducto> {
  const q = new URLSearchParams();
  if (params.estado) q.set('estado', params.estado);
  if (params.zonaBodegaId != null) q.set('zona_bodega_id', String(params.zonaBodegaId));
  if (params.pagina) q.set('pagina', String(params.pagina));
  if (params.porPagina) q.set('por_pagina', String(params.porPagina));
  const res = await apiRequest<PaginatedSeriesProducto>(
    `${BASE}/producto/${productoId}?${q.toString()}`,
  );
  return res.datos!;
}
