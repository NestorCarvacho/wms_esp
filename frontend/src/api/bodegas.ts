import { apiRequest } from '@/api/client';
import { buildListQuery, type PaginatedListParams } from '@/api/listQuery';
import type { Bodega, BodegaActualizar, BodegaCrear, PaginatedBodegas } from '@/types/api';

export async function listarBodegas(params: PaginatedListParams = {}) {
  const response = await apiRequest<PaginatedBodegas>(
    `/api/v1/bodegas?${buildListQuery(params)}`,
  );
  return response.datos!;
}

export async function crearBodega(data: BodegaCrear) {
  const response = await apiRequest<Bodega>('/api/v1/bodegas', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.datos!;
}

export async function actualizarBodega(id: number, data: BodegaActualizar) {
  const response = await apiRequest<Bodega>(`/api/v1/bodegas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.datos!;
}

export async function eliminarBodega(id: number) {
  await apiRequest(`/api/v1/bodegas/${id}`, { method: 'DELETE' });
}
