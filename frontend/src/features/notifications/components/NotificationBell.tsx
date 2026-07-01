import { Bell } from 'lucide-react';

import { Button } from '@/components/ui/shadcn/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/shadcn/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  useNotificacionesActions,
  useNotificacionesInbox,
  useNotificacionesNoLeidas,
} from '@/features/notifications/hooks/useNotificacionesInbox';

export function NotificationBell() {
  const unreadQuery = useNotificacionesNoLeidas();
  const inboxQuery = useNotificacionesInbox();
  const actions = useNotificacionesActions();

  const unread = unreadQuery.data ?? 0;
  const items = inboxQuery.data?.notificaciones ?? [];

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'relative rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
          )}
          aria-label="Notificaciones"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <span className="text-sm font-semibold">Notificaciones</span>
          {unread > 0 && (
            <button
              type="button"
              className="text-xs text-blue-600 hover:underline"
              onClick={() => void actions.marcarTodasLeidas()}
            >
              Marcar todas leídas
            </button>
          )}
        </div>
        {inboxQuery.isLoading && (
          <p className="px-3 py-4 text-sm text-muted-foreground">Cargando…</p>
        )}
        {!inboxQuery.isLoading && items.length === 0 && (
          <p className="px-3 py-4 text-sm text-muted-foreground">Sin notificaciones</p>
        )}
        {items.map((n) => (
          <DropdownMenuItem
            key={n.id}
            className="flex flex-col items-start gap-0.5 cursor-pointer whitespace-normal"
            onSelect={() => {
              if (!n.leida) void actions.marcarLeida(n.id);
            }}
          >
            <span className={`text-sm ${n.leida ? 'text-muted-foreground' : 'font-medium'}`}>
              {n.titulo}
            </span>
            {n.mensaje && <span className="text-xs text-muted-foreground">{n.mensaje}</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
