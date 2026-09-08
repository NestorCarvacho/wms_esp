import { apiRequest } from '@/api/client';
import { buildListQuery, type PaginatedListParams } from '@/api/listQuery';
import type { PaginatedTickets, Ticket, TipoSolicitud } from '@/types/api';

export async function listarTiposSolicitud() {
  const response = await apiRequest<{ tipos: TipoSolicitud[] }>('/api/v1/tickets/tipos');
  return response.datos?.tipos ?? [];
}

export async function listarTickets(params: PaginatedListParams = {}) {
  const response = await apiRequest<PaginatedTickets>(`/api/v1/tickets?${buildListQuery(params)}`);
  return response.datos!;
}

export async function obtenerTicket(id: number) {
  const response = await apiRequest<Ticket>(`/api/v1/tickets/${id}`);
  return response.datos!;
}

export async function crearTicket(data: { tipo_solicitud_id: number; mensaje: string; asunto?: string }) {
  const response = await apiRequest<Ticket>('/api/v1/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.datos!;
}

export async function responderTicket(id: number, mensaje: string) {
  const response = await apiRequest<Ticket>(`/api/v1/tickets/${id}/mensajes`, {
    method: 'POST',
    body: JSON.stringify({ mensaje }),
  });
  return response.datos!;
}

export async function cambiarEstadoTicket(id: number, estado_codigo: 'en_proceso' | 'cerrado') {
  const response = await apiRequest<Ticket>(`/api/v1/tickets/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado_codigo }),
  });
  return response.datos!;
}

export async function tomarTicket(id: number) {
  const response = await apiRequest<Ticket>(`/api/v1/tickets/${id}/tomar`, {
    method: 'POST',
  });
  return response.datos!;
}
