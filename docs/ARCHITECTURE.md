# Arquitectura WMS ESP

Monolito modular hexagonal. Los bounded contexts viven en `app/modules/`; la API REST centralizada permanece en `app/api/v1/endpoints/` como capa de presentación HTTP.

## Bounded contexts

| Módulo | Ruta | Responsabilidad |
|--------|------|-----------------|
| `iam` | `app/modules/iam/` | Auth, RBAC, usuarios, perfil |
| `tenant` | `app/modules/tenant/` | Empresas multi-tenant, acceso maestra |
| `catalog` | `app/modules/catalog/` | Productos, tipos, unidades, presentaciones, import |
| `warehouse` | `app/modules/warehouse/` | Bodegas, tipos de zona, zonas |
| `inventory` | `app/modules/inventory/` | Stock, movimientos, operaciones, series |
| `geo` | `app/modules/geo/` | Regiones, ciudades, comunas |

## Flujo HTTP (estado actual)

```
app/api/v1/endpoints/*
  → Depends(obtener_*_handlers)     # composition root
  → application/handlers            # casos de uso (CQRS ligero)
  → domain/ports (Protocol)         # contratos
  → infrastructure/*_repository     # SQLAlchemy + mappers ORM→dominio
```

Los routers **no** importan SQLAlchemy ni repositorios legacy directamente. La lógica de negocio está en handlers; la persistencia en adaptadores del módulo.

## Composition root

| Archivo | Contenido |
|---------|-----------|
| `app/bootstrap/container.py` | IAM + inventario |
| `app/bootstrap/catalog_container.py` | Catálogo |
| `app/bootstrap/warehouse_container.py` | Bodegas y zonas |
| `app/bootstrap/tenant_container.py` | Empresas |
| `app/bootstrap/geo_container.py` | Geografía |

## Capas por módulo

```
app/modules/<contexto>/
├── domain/
│   ├── entities.py      # entidades de dominio (donde aplica)
│   ├── ports.py         # Protocol — puertos
│   └── services/        # reglas puras (políticas)
├── application/
│   ├── commands*.py
│   ├── handlers/
│   └── *_mappers.py     # dominio → dict API
├── infrastructure/
│   ├── *_crud.py        # persistencia SQL
│   ├── orm_mappers.py   # ORM → entidad (donde aplica)
│   └── *_repository.py  # adaptadores que implementan puertos
└── presentation/http/
    └── dependencies.py  # Depends FastAPI → handlers
```

## Shared kernel

| Ruta | Uso |
|------|-----|
| `app/shared/kernel/result.py` | `Result<T>` para login y cambio de contraseña |
| `app/shared/formatting.py` | Helpers de formato (empresa, etc.) |
| `app/shared/locale_formatting.py` | Fechas/números según contexto de request |
| `app/shared/presentation/result_http.py` | Mapeo `Result` → HTTP |

## Persistencia ORM

Los modelos SQLAlchemy siguen en `app/infrastructure/models/` (monolito). Los adaptadores de módulo los importan en la capa `infrastructure` del bounded context — no en `domain` ni `application`.

Los archivos en `app/infrastructure/repositories/` son **re-exports de compatibilidad** hacia implementaciones en módulos (`cargo_crud`, `producto_crud`, etc.).

## Multi-tenant

- `empresa_id` del JWT (`ContextoEmpresa` en `app/api/v1/empresa_contexto.py`)
- Helpers: `kwargs_listado(ctx)`, `filtro_empresa()` en `listado_helpers.py`
- Empresa maestra: `es_empresa_maestra` en token; filtro `?empresa_id=` en listados

## CI

| Check | Comando |
|-------|---------|
| Tests backend | `pytest tests/` |
| Aislamiento de capas | `lint-imports` (`.importlinter`) |
| Build frontend | `cd frontend && npm run build` |

Ver `.github/workflows/ci.yml`.

## Documentación relacionada

- [PLAN_NORMALIZACION.md](./PLAN_NORMALIZACION.md) — roadmap de refactor (completado)
- [adr/001-hexagonal-modules.md](./adr/001-hexagonal-modules.md) — decisión arquitectónica
- [INDEX.md](./INDEX.md) — índice maestro
- [CONTRIBUTING.md](./CONTRIBUTING.md) — guía para contribuir (GitHub)
