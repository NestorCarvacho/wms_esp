import { apiRequest, getNotificationsBaseUrl } from '@/api/client';
import { buildListQuery, type PaginatedListParams } from '@/api/listQuery';

export interface Notificacion {
  id: number;
  empresa_id: number;
  tipo: string;
  titulo: string;
  mensaje?: string | null;
  payload?: Record<string, unknown> | null;
  leida: boolean;
  creado_at?: string;
  leida_at?: string | null;
}

export interface PaginatedNotificaciones {
  total: number;
  pagina: number;
  por_pagina: number;
  notificaciones: Notificacion[];
}

export async function listarNotificaciones(params: PaginatedListParams & { leida?: boolean } = {}) {
  const { leida, ...rest } = params;
  const query = buildListQuery(rest);
  const leidaParam = leida === undefined ? '' : `&leida=${leida ? 'true' : 'false'}`;
  const response = await apiRequest<PaginatedNotificaciones>(
    `/api/v1/notificaciones?${query}${leidaParam}`,
    {},
    true,
    getNotificationsBaseUrl(),
  );
  return response.datos!;
}

export async function contarNotificacionesNoLeidas() {
  const response = await apiRequest<{ total: number }>(
    '/api/v1/notificaciones/no-leidas/count',
    {},
    true,
    getNotificationsBaseUrl(),
  );
  return response.datos!.total;
}

export async function marcarNotificacionLeida(id: number) {
  await apiRequest(`/api/v1/notificaciones/${id}/leer`, { method: 'PATCH' }, true, getNotificationsBaseUrl());
}

export async function marcarTodasNotificacionesLeidas() {
  await apiRequest('/api/v1/notificaciones/leer-todas', { method: 'PATCH' }, true, getNotificationsBaseUrl());
}
