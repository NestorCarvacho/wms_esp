import { apiRequest } from '@/api/client';
import { buildListQuery, type PaginatedListParams } from '@/api/listQuery';
import type {
  PaginatedZonasBodega,
  ZonaBodega,
  ZonaBodegaActualizar,
  ZonaBodegaCrear,
} from '@/types/api';

export async function listarZonasBodega(params: PaginatedListParams = {}) {
  const response = await apiRequest<PaginatedZonasBodega>(
    `/api/v1/zonas-bodega?${buildListQuery(params)}`,
  );
  return response.datos!;
}

export async function crearZonaBodega(data: ZonaBodegaCrear) {
  const response = await apiRequest<ZonaBodega>('/api/v1/zonas-bodega', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.datos!;
}

export async function actualizarZonaBodega(id: number, data: ZonaBodegaActualizar) {
  const response = await apiRequest<ZonaBodega>(`/api/v1/zonas-bodega/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.datos!;
}

export async function eliminarZonaBodega(id: number) {
  await apiRequest(`/api/v1/zonas-bodega/${id}`, { method: 'DELETE' });
}
