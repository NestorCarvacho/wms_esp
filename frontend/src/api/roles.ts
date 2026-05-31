import { apiRequest } from '@/api/client';
import { buildListQuery, type PaginatedListParams } from '@/api/listQuery';
import type { PaginatedRoles, Rol, RolActualizar, RolCrear } from '@/types/api';

export async function listarRoles(params: PaginatedListParams = {}) {
  const response = await apiRequest<PaginatedRoles>(
    `/api/v1/roles?${buildListQuery(params)}`,
  );
  return response.datos!;
}

export async function crearRol(data: RolCrear) {
  const response = await apiRequest<Rol>('/api/v1/roles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.datos!;
}

export async function actualizarRol(id: number, data: RolActualizar) {
  const response = await apiRequest<Rol>(`/api/v1/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.datos!;
}

export async function eliminarRol(id: number) {
  await apiRequest(`/api/v1/roles/${id}`, { method: 'DELETE' });
}
