# ADR 005: Módulo notifications (WS + email)

## Estado

Aceptado — piloto ampliado (2026-06)

## Contexto

Las notificaciones en tiempo real de inventario usaban `InventarioEventBus` directamente. El correo transaccional (Resend) solo servía recuperación de contraseña en IAM.

## Decisión

Crear `app/modules/notifications/` con:

- **Dispatcher** compuesto: WebSocket + email genérico Resend + **inbox persistente**
- **Tabla** `notificacion` + REST `/api/v1/notificaciones`
- **`STOCK_CRITICO`** tras despacho cuando `stock_zona <= producto.stock_minimo`
- **Frontend:** `NotificationBell` en barra superior + listener WS global

## Consecuencias

- Bandeja in-app por usuario con contador de no leídas
- Umbral configurable por producto (`stock_minimo`)
- Bus in-memory sigue limitación multi-réplica

## Próximos pasos

- Preferencias usuario por canal
- Redis pub/sub para WS multi-instancia
- Página dedicada de historial de notificaciones
