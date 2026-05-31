import { apiRequest } from '@/api/client';
import { buildListQuery, type PaginatedListParams } from '@/api/listQuery';
import type {
  PaginatedUsuarios,
  PerfilUsuario,
  PerfilUsuarioActualizar,
  Usuario,
  UsuarioActualizar,
  UsuarioCrear,
  UsuarioLista,
} from '@/types/api';

export async function listarUsuarios(params: PaginatedListParams = {}) {
  const response = await apiRequest<PaginatedUsuarios>(
    `/api/v1/usuarios?${buildListQuery(params)}`,
  );
  return response.datos!;
}

export async function obtenerUsuario(id: number) {
  const response = await apiRequest<Usuario>(`/api/v1/usuarios/${id}`);
  return response.datos!;
}

export async function actualizarUsuario(id: number, data: UsuarioActualizar) {
  const response = await apiRequest<Usuario>(`/api/v1/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.datos!;
}

export async function obtenerPerfilUsuario(id: number) {
  const response = await apiRequest<PerfilUsuario>(`/api/v1/usuarios/${id}/perfil`);
  return response.datos!;
}

export async function actualizarPerfilUsuario(id: number, data: PerfilUsuarioActualizar) {
  const response = await apiRequest<PerfilUsuario>(`/api/v1/usuarios/${id}/perfil`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.datos!;
}

export async function crearUsuario(data: UsuarioCrear) {
  const response = await apiRequest<UsuarioLista>('/api/v1/usuarios', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.datos!;
}

export async function eliminarUsuario(id: number) {
  await apiRequest(`/api/v1/usuarios/${id}`, { method: 'DELETE' });
}
