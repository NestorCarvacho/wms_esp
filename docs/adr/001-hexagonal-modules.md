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

**Composition root:** `app/bootstrap/container.py` y contenedores por contexto (`catalog_container`, `warehouse_container`, `tenant_container`, `geo_container`).

**Estado (2026-06):** Todos los bounded contexts principales migrados. Endpoints consumen handlers directamente; `app/domain/services/` eliminado.

## Consecuencias

### Positivas

- Handlers testeables con repositorios fake
- `import-linter` enforcea aislamiento de capas
- Camino claro para extraer `inventory-service` (mismo bounded context)

### Negativas / deuda resuelta

- ~~Duplicación temporal con repos legacy~~ — absorbidos en módulos (Sprint 3–4)
- ~~Fachadas en `domain/services`~~ — eliminadas
- Repos de compatibilidad restantes en `app/infrastructure/repositories/` (usuario, perfil, tipo_cambio) — opcional eliminar

## Próximos pasos

1. ~~Fase 1: módulos `iam`, `catalog`, `warehouse`, `tenant`~~ — **completada** (ver ADR 002–004, 006)
2. ~~Notificaciones y recuperación por email~~ — **no aplican** (alcance portafolio simplificado)
3. Fase 3: `inventory-service` — **diferida**
