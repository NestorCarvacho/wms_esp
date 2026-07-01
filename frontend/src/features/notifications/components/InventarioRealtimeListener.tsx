import { useInventarioWebSocket } from '@/features/notifications/hooks/useInventarioWebSocket';

/** Escucha eventos de inventario en toda la app autenticada. */
export function InventarioRealtimeListener() {
  useInventarioWebSocket(true);
  return null;
}
