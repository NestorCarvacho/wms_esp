import { useEffect, useRef, useState, type FormEvent } from 'react';
import { responderTicket } from '@/api/tickets';
import { ApiError } from '@/api/client';
import type { Ticket, TicketMensaje } from '@/types/api';

interface TicketConversacionProps {
  ticket: Ticket;
  onUpdated: (ticket: Ticket) => void;
  onError: (message: string) => void;
}

export function TicketConversacion({ ticket, onUpdated, onError }: TicketConversacionProps) {
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const fondoRef = useRef<HTMLDivElement>(null);
  const mensajes = ticket.mensajes ?? [];

  useEffect(() => {
    const nodo = fondoRef.current;
    if (nodo) nodo.scrollTop = nodo.scrollHeight;
  }, [mensajes.length, ticket.id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const texto = mensaje.trim();
    if (!texto || !ticket.es_abierto) return;
    setEnviando(true);
    try {
      const actualizado = await responderTicket(ticket.id, texto);
      setMensaje('');
      onUpdated(actualizado);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'No se pudo enviar el mensaje');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div
        ref={fondoRef}
        className="flex max-h-80 flex-col gap-2 overflow-y-auto rounded-md border border-border bg-muted/30 p-3"
        data-testid="ticket-chat"
      >
        {mensajes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin mensajes todavía.</p>
        ) : (
          mensajes.map((item) => <Burbuja key={item.id} mensaje={item} />)
        )}
      </div>

      {ticket.es_abierto ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <label htmlFor={`ticket-respuesta-${ticket.id}`} className="text-sm font-medium">
            Mensaje
          </label>
          <textarea
            id={`ticket-respuesta-${ticket.id}`}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={3}
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="Escriba su mensaje para la mesa de ayuda"
          />
          <button
            type="submit"
            disabled={enviando || !mensaje.trim()}
            className="self-end rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {enviando ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">Este ticket está cerrado. El historial es de solo lectura.</p>
      )}
    </div>
  );
}

function Burbuja({ mensaje }: { mensaje: TicketMensaje }) {
  if (mensaje.es_sistema) {
    return (
      <p className="rounded-md bg-amber-50 px-3 py-2 text-center text-xs text-amber-900">
        {mensaje.cuerpo}
        {mensaje.creado_at_local ? <span className="mt-1 block opacity-70">{mensaje.creado_at_local}</span> : null}
      </p>
    );
  }

  const propio = Boolean(mensaje.es_propio);
  return (
    <div className={propio ? 'flex justify-end' : 'flex justify-start'}>
      <div
        className={
          propio
            ? 'max-w-[85%] rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground'
            : 'max-w-[85%] rounded-md bg-card px-3 py-2 text-sm text-foreground shadow-sm'
        }
      >
        <p className="mb-1 text-xs font-semibold opacity-80">{mensaje.autor_nombre}</p>
        <p className="whitespace-pre-wrap">{mensaje.cuerpo}</p>
        {mensaje.creado_at_local ? (
          <p className="mt-1 text-[11px] opacity-70">{mensaje.creado_at_local}</p>
        ) : null}
      </div>
    </div>
  );
}
