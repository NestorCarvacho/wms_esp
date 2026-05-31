import { apiRequest } from '@/api/client';
import { buildListQuery, type PaginatedListParams } from '@/api/listQuery';
import type { PaginatedUnidadesMedida, UnidadMedida, UnidadMedidaActualizar, UnidadMedidaCrear } from '@/types/api';

export async function listarUnidadesMedida(params: PaginatedListParams = {}) {
  const response = await apiRequest<PaginatedUnidadesMedida>(
    `/api/v1/unidades-medida?${buildListQuery(params)}`,
  );
  return response.datos!;
}

export async function crearUnidadMedida(data: UnidadMedidaCrear) {
  const response = await apiRequest<UnidadMedida>('/api/v1/unidades-medida', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.datos!;
}

export async function actualizarUnidadMedida(id: number, data: UnidadMedidaActualizar) {
  const response = await apiRequest<UnidadMedida>(`/api/v1/unidades-medida/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.datos!;
}

export async function eliminarUnidadMedida(id: number) {
  await apiRequest(`/api/v1/unidades-medida/${id}`, { method: 'DELETE' });
}
