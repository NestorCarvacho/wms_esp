import { apiRequest } from '@/api/client';
import { buildListQuery, type PaginatedListParams } from '@/api/listQuery';
import type {
  PaginatedTiposProducto,
  TipoProducto,
  TipoProductoActualizar,
  TipoProductoCrear,
} from '@/types/api';

export async function listarTiposProducto(params: PaginatedListParams = {}) {
  const response = await apiRequest<PaginatedTiposProducto>(
    `/api/v1/tipos-producto?${buildListQuery(params)}`,
  );
  return response.datos!;
}

export async function crearTipoProducto(data: TipoProductoCrear) {
  const response = await apiRequest<TipoProducto>('/api/v1/tipos-producto', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.datos!;
}

export async function actualizarTipoProducto(id: number, data: TipoProductoActualizar) {
  const response = await apiRequest<TipoProducto>(`/api/v1/tipos-producto/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.datos!;
}

export async function eliminarTipoProducto(id: number) {
  await apiRequest(`/api/v1/tipos-producto/${id}`, { method: 'DELETE' });
}
