import { apiRequest, getBaseUrl, getToken } from '@/api/client';
import { buildListQuery, type PaginatedListParams } from '@/api/listQuery';
import type {
  PaginatedProductos,
  Producto,
  ProductoActualizar,
  ProductoConsultaDetalle,
  ProductoCrear,
  ProductoImportacionResultado,
} from '@/types/api';

export async function listarProductos(params: PaginatedListParams = {}) {
  const response = await apiRequest<PaginatedProductos>(
    `/api/v1/productos?${buildListQuery(params)}`,
  );
  return response.datos!;
}

export async function crearProducto(data: ProductoCrear) {
  const response = await apiRequest<Producto>('/api/v1/productos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.datos!;
}

export async function actualizarProducto(id: number, data: ProductoActualizar) {
  const response = await apiRequest<Producto>(`/api/v1/productos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.datos!;
}

export async function eliminarProducto(id: number) {
  await apiRequest(`/api/v1/productos/${id}`, { method: 'DELETE' });
}

export async function descargarPlantillaProductos(): Promise<void> {
  const token = getToken();
  const response = await fetch(`${getBaseUrl()}/api/v1/productos/plantilla-importacion`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const text = await response.text();
    let message = 'Error al descargar plantilla';
    try {
      const body = JSON.parse(text) as { detail?: string; mensaje?: string };
      message = body.detail ?? body.mensaje ?? message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'plantilla_productos.xlsx';
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function consultarProducto(codigo: string): Promise<ProductoConsultaDetalle> {
  const response = await apiRequest<ProductoConsultaDetalle>(
    `/api/v1/productos/consulta/${encodeURIComponent(codigo.trim())}`,
  );
  return response.datos!;
}

export async function importarProductos(archivo: File): Promise<ProductoImportacionResultado> {
  const token = getToken();
  const formData = new FormData();
  formData.append('archivo', archivo);
  const response = await fetch(`${getBaseUrl()}/api/v1/productos/importacion`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const text = await response.text();
  let body: { exito?: boolean; datos?: ProductoImportacionResultado; mensaje?: string; detail?: string } = {};
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { mensaje: text };
    }
  }
  if (!response.ok) {
    throw new Error(body.detail ?? body.mensaje ?? `Error HTTP ${response.status}`);
  }
  if (body.exito === false) {
    throw new Error(body.mensaje ?? 'Importación fallida');
  }
  return body.datos!;
}
