# ADR 006: Módulo warehouse (bodegas y zonas)

## Estado

Aceptado — Fase 1 completada (2026-06)

## Contexto

Tras catalog e inventory, la infraestructura de almacén (bodegas, tipos de zona, zonas físicas) seguía en servicios legacy acoplados a repositorios CRUD. `ZonaBodegaService` además instanciaba repositorios auxiliares en el constructor.

ADR 001 definía **warehouse** como bounded context pendiente de Fase 1.

## Decisión

Crear `app/modules/warehouse/` con:

| Entidad | Handlers (5 c/u) |
|---------|------------------|
| Bodega | listar, obtener, crear, actualizar, eliminar |
| TipoZona | listar, obtener, crear, actualizar, eliminar |
| ZonaBodega | listar, obtener, crear, actualizar, eliminar |

- **Puertos:** `IBodegaRepository`, `ITipoZonaRepository`, `IZonaBodegaRepository`
- **Validación cruzada** bodega↔tipo en handlers de zona (misma empresa, activos)
- **Composition root:** `build_warehouse_handlers()` en `app/bootstrap/warehouse_container.py`
- **Fachadas:** `BodegaService`, `TipoZonaService`, `ZonaBodegaService` delegan a handlers
- **DI:** `app/modules/warehouse/presentation/http/dependencies.py`

Endpoints `/api/v1/bodegas`, `/tipos-zona`, `/zonas-bodega` usan DI del módulo.

## Consecuencias

- Fase 1 del monolito modular **completa** (inventory, iam, tenant, catalog, warehouse)
- `bodega_config` permanece en módulo inventory (config operativa de recepción)
- Campos geográficos de bodega en DTO aún no persistidos — deuda legacy existente

## Próximos pasos (Fase 2)

- Extracción a microservicios (Strangler Fig) — **diferida** (plan Free / portafolio)
- Eventos de dominio `BodegaCreada` / `ZonaBodegaActualizada`
