import { apiRequest } from '@/api/client';
import { buildListQuery, type PaginatedListParams } from '@/api/listQuery';
import type { Cargo, CargoActualizar, CargoCrear, PaginatedCargos } from '@/types/api';

export async function listarCargos(params: PaginatedListParams = {}) {
  const response = await apiRequest<PaginatedCargos>(
    `/api/v1/cargos?${buildListQuery(params)}`,
  );
  return response.datos!;
}

export async function crearCargo(data: CargoCrear) {
  const response = await apiRequest<Cargo>('/api/v1/cargos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.datos!;
}

export async function actualizarCargo(id: number, data: CargoActualizar) {
  const response = await apiRequest<Cargo>(`/api/v1/cargos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.datos!;
}

export async function eliminarCargo(id: number) {
  await apiRequest(`/api/v1/cargos/${id}`, { method: 'DELETE' });
}
