import { apiRequest } from '@/api/client';
import { buildListQuery, type PaginatedListParams } from '@/api/listQuery';
import type { Empresa, EmpresaActualizar, EmpresaCrear, PaginatedEmpresas } from '@/types/api';

export async function listarEmpresas(params: PaginatedListParams = {}) {
  const response = await apiRequest<PaginatedEmpresas>(
    `/api/v1/empresas?${buildListQuery(params)}`,
  );
  return response.datos!;
}

export async function crearEmpresa(data: EmpresaCrear) {
  const response = await apiRequest<Empresa>('/api/v1/empresas', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.datos!;
}

export async function actualizarEmpresa(id: number, data: EmpresaActualizar) {
  const response = await apiRequest<Empresa>(`/api/v1/empresas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.datos!;
}

export async function eliminarEmpresa(id: number) {
  await apiRequest(`/api/v1/empresas/${id}`, { method: 'DELETE' });
}
