import { apiRequest } from '@/api/client';

export interface UsuarioRolesData {
  usuario_id: number;
  rol_ids: number[];
}

export async function listarRolesUsuario(usuarioId: number) {
  const response = await apiRequest<UsuarioRolesData>(`/api/v1/usuarios/${usuarioId}/roles`);
  return response.datos!;
}

export async function sincronizarRolesUsuario(usuarioId: number, rolIds: number[]) {
  const response = await apiRequest<UsuarioRolesData>(`/api/v1/usuarios/${usuarioId}/roles`, {
    method: 'PUT',
    body: JSON.stringify({ rol_ids: rolIds }),
  });
  return response.datos!;
}
