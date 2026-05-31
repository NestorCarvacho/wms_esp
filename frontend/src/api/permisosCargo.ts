import { apiRequest } from '@/api/client';
import type {
  PaginatedPermisosCargo,
  PermisoCargo,
  PermisoCargoActualizar,
  PermisoCargoCrear,
} from '@/types/api';

export async function listarPermisosCargo(pagina = 1, porPagina = 100) {
  const response = await apiRequest<PaginatedPermisosCargo>(
    `/api/v1/permisos-cargo?pagina=${pagina}&por_pagina=${porPagina}`,
  );
  return response.datos!;
}

export async function crearPermisoCargo(data: PermisoCargoCrear) {
  const response = await apiRequest<PermisoCargo>('/api/v1/permisos-cargo', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.datos!;
}

export async function actualizarPermisoCargo(
  cargoId: number,
  rolId: number,
  data: PermisoCargoActualizar,
) {
  const response = await apiRequest<PermisoCargo>(
    `/api/v1/permisos-cargo/${cargoId}/${rolId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
  );
  return response.datos!;
}

export async function eliminarPermisoCargo(cargoId: number, rolId: number) {
  await apiRequest(`/api/v1/permisos-cargo/${cargoId}/${rolId}`, { method: 'DELETE' });
}
