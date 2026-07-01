# ADR 007: Extracción notification-service (Fase 2)

## Estado

Aceptado — Fase 2 (2026-06)

## Contexto

Fase 1 completó el módulo hexagonal `notifications` en el monolito (inbox MySQL, WebSocket inventario, email Resend). Para escalar y aislar la carga de tiempo real, se aplica **Strangler Fig**: el monolito deja de emitir WS/inbox directamente y publica eventos en Redis; un servicio dedicado consume y entrega.

## Decisión

1. **Contrato de eventos:** `StockEventV1` en `app/shared/events/stock_event.py`, canal Redis `wms:stock-events`.
2. **Monolito:** `NOTIFICATIONS_MODE=local|remote`. En `remote`, `RemoteNotificationDispatcher` publica a Redis; routers `/api/v1/notificaciones` y `/api/v1/ws/inventario` no se montan.
3. **notification-service:** FastAPI en `services/notification-service/` reutilizando `app.modules.notifications` con modo local interno + suscriptor Redis.
4. **MySQL compartido** (Fase 2a): tabla `notificacion` sigue en la misma BD.
5. **JWT compartido:** mismo `SECRET_KEY` para REST y WS del servicio.
6. **Frontend:** `VITE_NOTIFICATIONS_API_URL` y `VITE_NOTIFICATIONS_WS_URL` apuntan al nuevo servicio en producción.

## Arquitectura

```
Monolito (remote) ──publish──► Redis (wms:stock-events)
                                      │
                                      ▼
                         notification-service
                           ├── subscriber → dispatcher local
                           ├── REST /api/v1/notificaciones
                           └── WS /api/v1/ws/inventario
```

## Rollback

`NOTIFICATIONS_MODE=local` en el monolito restaura el comportamiento Fase 1 sin desplegar cambios en frontend (si URLs vacías).

## Consecuencias

### Positivas

- Desacoplamiento de WebSocket y email del API principal
- Camino a escalar notification-service independientemente
- Contrato versionado (`StockEventV1`) para futuros consumidores

### Negativas

- Redis obligatorio en modo remote
- MySQL compartido hasta Fase 2b (BD dedicada o event sourcing)
- Dos servicios que desplegar en Railway

## Próximos pasos

- Fase 2b: BD dedicada o réplica de lectura para inbox
- Fase 3: `inventory-service` con publicación de eventos al mismo canal
