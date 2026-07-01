import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  contarNotificacionesNoLeidas,
  listarNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
} from '@/api/notificaciones';
import { notificationKeys } from '@/features/notifications/model/queryKeys';

export function useNotificacionesNoLeidas(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: contarNotificacionesNoLeidas,
    enabled,
    refetchInterval: 60_000,
  });
}

export function useNotificacionesInbox(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.list({ pagina: 1, porPagina: 10 }),
    queryFn: () => listarNotificaciones({ pagina: 1, porPagina: 10 }),
    enabled,
  });
}

export function useNotificacionesActions() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });

  return {
    marcarLeida: async (id: number) => {
      await marcarNotificacionLeida(id);
      await invalidate();
    },
    marcarTodasLeidas: async () => {
      await marcarTodasNotificacionesLeidas();
      await invalidate();
    },
  };
}
