# ADR 001: Módulos hexagonales (piloto inventario)

## Estado

Aceptado — Fase 0 (2026-06)

## Contexto

El WMS creció como monolito N-capas (`api` → `domain/services` → `infrastructure/repositories`) con acoplamiento directo a SQLAlchemy y WebSocket en la capa de servicios. Esto dificulta:

- Tests unitarios sin base de datos
- Extracción futura a microservicios (Strangler Fig)
- Cumplimiento estricto de SOLID (DIP, SRP)

## Decisión

Introducir **módulos hexagonales** bajo `app/modules/<bounded-context>/` con:

```
domain/          → entidades, eventos, puertos (Protocol)
application/     → commands, queries, handlers (CQRS ligero)
infrastructure/  → adaptadores SQLAlchemy, WebSocket, UoW
presentation/    → dependencias FastAPI
```

**Piloto:** `inventory` (recepción, traslado, despacho, consultas, config bodega).

**Composition root:** `app/bootstrap/container.py` (`build_inventory_handlers`).

**Compatibilidad:** `InventarioOperacionService` permanece como fachada delegando a handlers; endpoints y reportes no rompen contrato.

**Eventos de dominio:** `StockMovimientoRegistrado` desacoplado del bus WebSocket via `IEventPublisher`.

## Consecuencias

### Positivas

- Handlers testeables con repositorios fake
- `import-linter` enforcea aislamiento de capas
- Camino claro para extraer `inventory-service` (mismo bounded context)

### Negativas / deuda

- Duplicación temporal: adaptador envuelve `InventarioCRUDRepository` legacy
- Otros bounded contexts siguen en estructura antigua hasta Fase 1+
- `InventarioOperacionService` se eliminará cuando todos los consumidores usen handlers directamente

## Próximos pasos

1. ~~Fase 1: módulos `iam`, `catalog`, `warehouse`, `tenant`, `notifications`~~ — **completada** (ver ADR 002–006, 005)
2. ~~Fase 2: extraer `notification-service`~~ — **descartada** (monolito único; ver ADR 007)
3. Fase 3: `inventory-service` — **diferida** (inventario permanece en monolito)
