import { apiRequest } from '@/api/client';
import { buildListQuery, type PaginatedListParams } from '@/api/listQuery';
import type {
  PaginatedProductoPresentaciones,
  ProductoPresentacion,
  ProductoPresentacionActualizar,
  ProductoPresentacionCrear,
  VentaDescuentoRequest,
  VentaDescuentoResultado,
} from '@/types/api';

export async function listarProductoPresentaciones(
  productoId: number,
  params: PaginatedListParams = {},
) {
  const response = await apiRequest<PaginatedProductoPresentaciones>(
    `/api/v1/productos/${productoId}/presentaciones?${buildListQuery(params)}`,
  );
  return response.datos!;
}

export async function crearProductoPresentacion(
  productoId: number,
  data: ProductoPresentacionCrear,
) {
  const response = await apiRequest<ProductoPresentacion>(
    `/api/v1/productos/${productoId}/presentaciones`,
    { method: 'POST', body: JSON.stringify(data) },
  );
  return response.datos!;
}

export async function actualizarProductoPresentacion(
  id: number,
  data: ProductoPresentacionActualizar,
) {
  const response = await apiRequest<ProductoPresentacion>(
    `/api/v1/producto-presentaciones/${id}`,
    { method: 'PUT', body: JSON.stringify(data) },
  );
  return response.datos!;
}

export async function eliminarProductoPresentacion(id: number) {
  await apiRequest(`/api/v1/producto-presentaciones/${id}`, { method: 'DELETE' });
}

export async function calcularDescuentoInventario(data: VentaDescuentoRequest) {
  const response = await apiRequest<VentaDescuentoResultado>(
    '/api/v1/inventario/calcular-descuento',
    { method: 'POST', body: JSON.stringify(data) },
  );
  return response.datos!;
}
