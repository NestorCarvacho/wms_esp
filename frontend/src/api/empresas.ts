import { apiRequest } from '@/api/client';
import { buildListQuery, type PaginatedListParams } from '@/api/listQuery';
import type { Empresa, EmpresaActualizar, EmpresaCrear, PaginatedEmpresas } from '@/types/api';

export async function listarEmpresasAdministradas(options?: { incluirInactivas?: boolean }) {
  const qs = options?.incluirInactivas ? '?incluir_inactivas=true' : '';
  const response = await apiRequest<{ total: number; empresas: Empresa[] }>(
    `/api/v1/empresas/administradas${qs}`,
  );
  return response.datos!;
}

/** Empresas para el selector de empresa (incluye inhabilitadas). */
export async function listarEmpresasParaFiltro() {
  try {
    const res = await listarEmpresasAdministradas({ incluirInactivas: true });
    if (res.empresas.length > 0) return res;
  } catch {
    /* fallback abajo */
  }
  const res = await listarEmpresas({
    pagina: 1,
    porPagina: 500,
    extra: { solo_activas: false },
  });
  return { total: res.total, empresas: res.empresas };
}

/** Solo empresas operativas (formularios de creación). */
export async function listarEmpresasActivasParaCreacion() {
  try {
    const res = await listarEmpresasAdministradas({ incluirInactivas: false });
    if (res.empresas.length > 0) {
      return res.empresas.filter((e) => e.esta_activa);
    }
  } catch {
    /* fallback */
  }
  const res = await listarEmpresas({
    pagina: 1,
    porPagina: 500,
    extra: { solo_activas: true },
  });
  return res.empresas;
}

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

export interface ProvisionRbacResult {
  empresa_id: number;
  empresa_plantilla_id: number;
  permisos_antes: number;
  permisos_creados: number;
  total_permisos: number;
  roles_provisionados: number;
  ya_existia_catalogo: boolean;
}

export async function provisionarRbacEmpresa(empresaId: number) {
  const response = await apiRequest<ProvisionRbacResult>(
    `/api/v1/empresas/${empresaId}/provisionar-rbac`,
    { method: 'POST' },
  );
  return response.datos!;
}
