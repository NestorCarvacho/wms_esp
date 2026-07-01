# ADR 004: Módulo catalog (productos)

## Estado

Aceptado — piloto (2026-06)

## Contexto

El CRUD de productos vivía en `ProductoService` acoplado directamente a `ProductoCRUDRepository`. Es el siguiente bounded context natural tras tenant e IAM: catálogo maestro por empresa, consumido por inventario y operaciones.

## Decisión

Crear `app/modules/catalog/` con:

- **Puerto** `IProductoRepository`: listar, obtener, crear, actualizar, eliminar
- **Handlers** CQRS en `application/handlers/producto_handlers.py`
- **Infraestructura** `SqlAlchemyProductoRepository` sobre el repo legacy
- **Composition root** `build_catalog_handlers()` en `app/bootstrap/catalog_container.py`
- **Fachada** `ProductoService` delega al módulo catalog
- **DI** `obtener_producto_service` en `app/modules/catalog/presentation/http/dependencies.py`

Importación masiva y consultas compuestas (`ProductoImportacionService`, `ProductoConsultaService`) permanecen legacy hasta fase posterior.

## Consecuencias

- Lógica CRUD producto testeable sin FastAPI ni SQLAlchemy en application
- Camino para extraer `catalog-service` en microservicios
- `tipo_producto` y `unidades_medida` siguen como endpoints legacy

## Próximos pasos

- Migrar `tipo_producto` y `unidades_medida` al módulo catalog
- Frontend FSD para productos (TanStack Query)
- Eventos de dominio `ProductoCreado` / `ProductoActualizado` para integración con inventario
