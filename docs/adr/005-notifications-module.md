# ADR 005: Módulo notifications (WS + email)

## Estado

Aceptado — piloto (2026-06)

## Contexto

Las notificaciones en tiempo real de inventario usaban `InventarioEventBus` directamente desde `WebSocketEventPublisher`. El correo transaccional (Resend) solo servía recuperación de contraseña en IAM. No había un punto único para fan-out multi-canal.

## Decisión

Crear `app/modules/notifications/` con:

- **Puertos** `IStockRealtimePublisher`, `ITransactionalEmailSender`, `INotificationDispatcher`
- **Dispatcher** compuesto: WebSocket (inventario) + email (Resend genérico)
- **Composition root** `build_notification_handlers()` en `app/bootstrap/notification_container.py`
- **Inventory** delega publicación WS al dispatcher vía `WebSocketEventPublisher` refactorizado
- **Frontend** suscribe WS a nivel `MainLayout` (app shell), no solo en `InventarioPage`

`STOCK_CRITICO` tiene soporte en bus/UI y método `notify_stock_critical()` (WS + email opcional); la lógica de umbral en inventario queda para fase posterior.

## Consecuencias

- Camino para inbox persistente, Redis pub/sub y plantillas email
- IAM mantiene `ResendEmailNotifier` propio (sin breaking change)
- Bus in-memory sigue siendo limitación multi-réplica hasta extraer servicio

## Próximos pasos

- Tabla `notificacion` + REST inbox
- Emitir `STOCK_CRITICO` tras despacho cuando stock &lt; umbral
- Preferencias usuario por canal
