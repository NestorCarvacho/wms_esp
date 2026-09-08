import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { crearTicket, listarTickets, listarTiposSolicitud, obtenerTicket } from '@/api/tickets';
import { ApiError } from '@/api/client';
import { useAuthContext } from '@/context/AuthContext';
import { useUI } from '@/hooks/ui';
import type { Ticket, TipoSolicitud } from '@/types/api';
import { TicketConversacion } from './TicketConversacion';

type Vista = 'lista' | 'nuevo' | 'chat';

export function CentroAyudaPanel() {
  const { user } = useAuthContext();
  const { showNotification } = useUI();
  const [vista, setVista] = useState<Vista>('lista');
  const [tipos, setTipos] = useState<TipoSolicitud[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [tipoPadreId, setTipoPadreId] = useState<number | ''>('');
  const [tipoId, setTipoId] = useState<number | ''>('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [confirmado, setConfirmado] = useState(false);

  const nombre = useMemo(() => {
    const perfil = user?.perfil;
    const partes = [perfil?.nombres, perfil?.apellido_paterno].filter(Boolean);
    return partes.length > 0 ? partes.join(' ') : user?.email ?? '';
  }, [user]);
  const empresa = user?.empresa_nombre ?? '';

  const padres = useMemo(() => tipos.filter((tipo) => tipo.tipo_padre_id == null), [tipos]);
  const hijos = useMemo(
    () => tipos.filter((tipo) => tipo.tipo_padre_id === tipoPadreId),
    [tipos, tipoPadreId],
  );
  const padreSeleccionado = padres.find((tipo) => tipo.id === tipoPadreId);
  const requiereSubtipo = hijos.length > 0;

  const recargarLista = useCallback(async () => {
    const res = await listarTickets({ porPagina: 20, extra: { solo_propios: 'true' } });
    setTickets(res.tickets ?? []);
  }, []);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const [catalogo] = await Promise.all([listarTiposSolicitud(), recargarLista()]);
        if (activo) setTipos(catalogo);
      } catch (err) {
        showNotification({
          type: 'error',
          message: err instanceof ApiError ? err.message : 'No se pudo abrir el centro de ayuda',
        });
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [recargarLista, showNotification]);

  useEffect(() => {
    if (vista !== 'chat' || !ticket?.id) return;
    const timer = window.setInterval(async () => {
      try {
        const actualizado = await obtenerTicket(ticket.id);
        setTicket(actualizado);
      } catch {
        /* el siguiente ciclo reintenta */
      }
    }, 8000);
    return () => window.clearInterval(timer);
  }, [vista, ticket?.id]);

  async function abrirTicket(id: number) {
    try {
      const detalle = await obtenerTicket(id);
      setTicket(detalle);
      setConfirmado(false);
      setVista('chat');
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'No se pudo abrir el ticket',
      });
    }
  }

  async function handleCrear(e: FormEvent) {
    e.preventDefault();
    const tipoFinal = requiereSubtipo ? tipoId : tipoPadreId;
    if (!tipoFinal || !mensaje.trim()) return;
    setEnviando(true);
    try {
      const creado = await crearTicket({
        tipo_solicitud_id: Number(tipoFinal),
        mensaje: mensaje.trim(),
      });
      setTicket(creado);
      setConfirmado(true);
      setMensaje('');
      setTipoPadreId('');
      setTipoId('');
      setVista('chat');
      await recargarLista();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'No se pudo crear el ticket',
      });
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) {
    return <p className="text-sm text-muted-foreground">Cargando centro de ayuda...</p>;
  }

  if (vista === 'chat' && ticket) {
    return (
      <div className="flex flex-col gap-4">
        <button type="button" className="self-start text-sm text-primary" onClick={() => setVista('lista')}>
          Volver a mis solicitudes
        </button>
        {confirmado ? (
          <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800" data-testid="ticket-confirmacion">
            Su solicitud está siendo procesada y asignada.
          </p>
        ) : null}
        <CabeceraTicket ticket={ticket} />
        <TicketConversacion
          ticket={ticket}
          onUpdated={setTicket}
          onError={(message) => showNotification({ type: 'error', message })}
        />
      </div>
    );
  }

  if (vista === 'nuevo') {
    return (
      <form onSubmit={handleCrear} className="flex flex-col gap-4">
        <button type="button" className="self-start text-sm text-primary" onClick={() => setVista('lista')}>
          Volver
        </button>
        <CampoSoloLectura label="Usuario" value={nombre || 'Usuario autenticado'} />
        <CampoSoloLectura label="Empresa" value={empresa || 'Empresa de la sesión'} />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Tipo de solicitud</span>
          <select
            required
            value={tipoPadreId}
            onChange={(e) => {
              setTipoPadreId(e.target.value ? Number(e.target.value) : '');
              setTipoId('');
            }}
            className="rounded-md border border-border bg-background px-3 py-2"
          >
            <option value="">Seleccione</option>
            {padres.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </label>
        {requiereSubtipo ? (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Subtipo{padreSeleccionado ? ` de ${padreSeleccionado.nombre}` : ''}</span>
            <select
              required
              value={tipoId}
              onChange={(e) => setTipoId(e.target.value ? Number(e.target.value) : '')}
              className="rounded-md border border-border bg-background px-3 py-2"
            >
              <option value="">Seleccione</option>
              {hijos.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Problema</span>
          <textarea
            required
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={5}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
            placeholder="Describa lo que necesita"
          />
        </label>
        <button
          type="submit"
          disabled={enviando}
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {enviando ? 'Enviando...' : 'Enviar solicitud'}
        </button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Abra un ticket y converse con la mesa de ayuda. El usuario y la empresa se toman de su sesión.
      </p>
      <button
        type="button"
        className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        onClick={() => setVista('nuevo')}
      >
        Nueva solicitud
      </button>
      <ul className="flex flex-col gap-2">
        {tickets.length === 0 ? (
          <li className="text-sm text-muted-foreground">No tiene solicitudes.</li>
        ) : (
          tickets.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="w-full rounded-md border border-border px-3 py-2 text-left"
                onClick={() => void abrirTicket(item.id)}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{item.asunto}</span>
                  <EstadoBadge abierto={item.es_abierto} nombre={item.estado_nombre} />
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {item.tipo_solicitud_nombre} · {item.creado_at_local ?? ''}
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function CampoSoloLectura({ label, value }: { label: string; value: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <input value={value} readOnly className="rounded-md border border-border bg-muted px-3 py-2" />
    </label>
  );
}

function CabeceraTicket({ ticket }: { ticket: Ticket }) {
  return (
    <div className="text-sm">
      <p className="font-medium">{ticket.asunto}</p>
      <p className="text-muted-foreground">
        {ticket.nombre_solicitante} · {ticket.nombre_empresa}
      </p>
      <p className="text-muted-foreground">
        {ticket.tipo_solicitud_nombre} · {ticket.creado_at_local ?? ''} · {ticket.estado_nombre}
      </p>
    </div>
  );
}

function EstadoBadge({ abierto, nombre }: { abierto: boolean; nombre: string }) {
  return (
    <span
      className={
        abierto
          ? 'shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800'
          : 'shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600'
      }
    >
      {nombre}
    </span>
  );
}
