import { useEffect, useRef } from 'react';

import { getBaseUrl, getToken } from '@/api/client';
import { useLocale } from '@/context/LocaleContext';
import { useUI } from '@/hooks/ui';

export interface InventarioStockEvent {
  event_type: string;
  mensaje: string;
  producto_nombre?: string;
  cantidad?: number;
  movimiento_id?: number;
}

export function useInventarioWebSocket(enabled = true) {
  const { locale, timezone } = useLocale();
  const { showNotification } = useUI();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const token = getToken();
    if (!token) return;

    const base = getBaseUrl().replace(/^http/, 'ws');
    const params = new URLSearchParams({
      token,
      locale,
      tz: timezone,
    });
    const ws = new WebSocket(`${base}/api/v1/ws/inventario?${params}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as InventarioStockEvent;
        showNotification({
          type: data.event_type === 'STOCK_CRITICO' ? 'warning' : 'info',
          message: data.mensaje,
        });
      } catch {
        /* ignore malformed payloads */
      }
    };

    ws.onerror = () => {
      ws.close();
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [enabled, locale, timezone, showNotification]);
}
