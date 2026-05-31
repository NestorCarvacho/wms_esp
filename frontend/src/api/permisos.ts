import { apiRequest } from '@/api/client';
import { buildListQuery, type PaginatedListParams } from '@/api/listQuery';
import type { Permiso } from '@/types/api';

export interface PaginatedPermisos {
  total: number;
  pagina: number;
  por_pagina: number;
  permisos: Permiso[];
}

export interface RolPermisosData {
  rol_id: number;
  permiso_ids: number[];
  permisos: { permiso_id: number; codigo: string; descripcion?: string | null }[];
}

export async function listarPermisos(params: PaginatedListParams = {}) {
  const response = await apiRequest<PaginatedPermisos>(
    `/api/v1/permisos?${buildListQuery(params)}`,
  );
  return response.datos!;
}

export async function crearPermiso(data: { codigo: string; descripcion?: string | null }) {
  const response = await apiRequest<Permiso>('/api/v1/permisos', {
    method: 'POST',
    body: JSON.stringify({ ...data, activo: 1 }),
  });
  return response.datos!;
}

export async function listarPermisosRol(rolId: number) {
  const response = await apiRequest<RolPermisosData>(`/api/v1/roles/${rolId}/permisos`);
  return response.datos!;
}

export async function sincronizarPermisosRol(rolId: number, permisoIds: number[]) {
  const response = await apiRequest<{ rol_id: number; permiso_ids: number[] }>(
    `/api/v1/roles/${rolId}/permisos`,
    {
      method: 'PUT',
      body: JSON.stringify({ permiso_ids: permisoIds }),
    },
  );
  return response.datos!;
}

export async function listarRolesCargo(cargoId: number) {
  const response = await apiRequest<{ cargo_id: number; rol_ids: number[] }>(
    `/api/v1/permisos-cargo/cargo/${cargoId}/roles`,
  );
  return response.datos!;
}

export async function sincronizarRolesCargo(cargoId: number, rolIds: number[]) {
  const response = await apiRequest<{ cargo_id: number; rol_ids: number[] }>(
    `/api/v1/permisos-cargo/cargo/${cargoId}/roles`,
    {
      method: 'PUT',
      body: JSON.stringify({ rol_ids: rolIds }),
    },
  );
  return response.datos!;
}
