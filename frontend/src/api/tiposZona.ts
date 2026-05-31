import { apiRequest } from '@/api/client';
import { buildListQuery, type PaginatedListParams } from '@/api/listQuery';
import type { PaginatedTiposZona, TipoZona, TipoZonaActualizar, TipoZonaCrear } from '@/types/api';

export async function listarTiposZona(params: PaginatedListParams = {}) {
  const response = await apiRequest<PaginatedTiposZona>(
    `/api/v1/tipos-zona?${buildListQuery(params)}`,
  );
  return response.datos!;
}

export async function crearTipoZona(data: TipoZonaCrear) {
  const response = await apiRequest<TipoZona>('/api/v1/tipos-zona', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.datos!;
}

export async function actualizarTipoZona(id: number, data: TipoZonaActualizar) {
  const response = await apiRequest<TipoZona>(`/api/v1/tipos-zona/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.datos!;
}

export async function eliminarTipoZona(id: number) {
  await apiRequest(`/api/v1/tipos-zona/${id}`, { method: 'DELETE' });
}
