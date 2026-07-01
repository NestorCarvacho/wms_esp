# ADR 007: Extracción notification-service (Fase 2)

## Estado

**Superseded** — descartada (2026-06)

Decisión final: notificaciones permanecen **en el monolito** (`app/modules/notifications/`). No se despliega `notification-service` separado.

## Contexto

Fase 1 completó el módulo hexagonal `notifications` (inbox, WebSocket, email). Se implementó un camino Strangler (Redis + servicio standalone) pero:

- Railway Free no permite un 4.º servicio ni Redis con volumen
- Render/Upstash Free añade complejidad y limitaciones (servicios que duermen)
- El objetivo de arquitectura alcanzable es el **monolito modular hexagonal**, no microservicios en prod

## Decisión (revisada)

1. **Mantener** `app/modules/notifications/` en el monolito (ADR 005).
2. **Eliminar** `services/notification-service/`, Redis remote, flags `NOTIFICATIONS_MODE`.
3. **No implementar** cutover Fase 2 en producción.
4. Fase 3 (`inventory-service`) **diferida** bajo la misma política.

## Consecuencias

### Positivas

- Un solo servicio API en Railway Free ($0)
- WS + inbox + stock crítico sin Redis ni hosts extra
- Menos superficie operativa

### Negativas

- WS in-memory no escala a múltiples réplicas del API
- Extracción futura requeriría reintroducir contratos de eventos

## Referencia histórica

La implementación Strangler (commit `86fbd07`) fue revertida en favor de monolito único.
