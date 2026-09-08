import { useEffect, useState } from 'react';
import { cambiarEstadoTicket, obtenerTicket, tomarTicket } from '@/api/tickets';
import { ApiError } from '@/api/client';
import { useUI } from '@/hooks/ui';
import type { Ticket } from '@/types/api';
import { TicketConversacion } from './TicketConversacion';

export interface TicketGestionPanelProps {
  ticketId: number;
  onSaved?: () => void;
}

export function TicketGestionPanel({ ticketId, onSaved }: TicketGestionPanelProps) {
  const { showNotification } = useUI();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [cargando, setCargando] = useState(true);
  const [accion, setAccion] = useState(false);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const detalle = await obtenerTicket(ticketId);
        if (activo) setTicket(detalle);
      } catch (err) {
        showNotification({
          type: 'error',
          message: err instanceof ApiError ? err.message : 'No se pudo abrir el ticket',
        });
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [ticketId, showNotification]);

  useEffect(() => {
    const timer = window.setInterval(async () => {
      try {
        const detalle = await obtenerTicket(ticketId);
        setTicket(detalle);
      } catch {
        /* reintenta en el siguiente ciclo */
      }
    }, 8000);
    return () => window.clearInterval(timer);
  }, [ticketId]);

  async function ejecutar(fn: () => Promise<Ticket>, ok: string) {
    setAccion(true);
    try {
      const actualizado = await fn();
      setTicket(actualizado);
      onSaved?.();
      showNotification({ type: 'success', message: ok });
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'No se pudo actualizar el ticket',
      });
    } finally {
      setAccion(false);
    }
  }

  if (cargando || !ticket) {
    return <p className="text-sm text-muted-foreground">Cargando conversación...</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm">
        <p className="font-medium">{ticket.asunto}</p>
        <p className="text-muted-foreground">
          {ticket.nombre_solicitante} · {ticket.nombre_empresa}
        </p>
        <p className="text-muted-foreground">
          {ticket.tipo_solicitud_nombre} · {ticket.creado_at_local ?? ''} · {ticket.estado_nombre}
        </p>
        <p className="text-muted-foreground">
          {ticket.asignado_usuario_id ? `Asignado (#${ticket.asignado_usuario_id})` : 'Sin agente asignado'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={accion}
          className="rounded-md border border-border px-3 py-1.5 text-sm"
          onClick={() => void ejecutar(() => tomarTicket(ticket.id), 'Ticket tomado')}
        >
          Tomar
        </button>
        {ticket.es_abierto ? (
          <button
            type="button"
            disabled={accion}
            className="rounded-md border border-border px-3 py-1.5 text-sm"
            onClick={() => void ejecutar(() => cambiarEstadoTicket(ticket.id, 'cerrado'), 'Ticket cerrado')}
          >
            Cerrar
          </button>
        ) : (
          <button
            type="button"
            disabled={accion}
            className="rounded-md border border-border px-3 py-1.5 text-sm"
            onClick={() =>
              void ejecutar(() => cambiarEstadoTicket(ticket.id, 'en_proceso'), 'Ticket reabierto')
            }
          >
            Reabrir
          </button>
        )}
      </div>

      <TicketConversacion
        ticket={ticket}
        onUpdated={(actualizado) => {
          setTicket(actualizado);
          onSaved?.();
        }}
        onError={(message) => showNotification({ type: 'error', message })}
      />
    </div>
  );
}
