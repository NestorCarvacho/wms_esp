# Estructura del proyecto WMS ESP

> Última actualización: junio 2026 — arquitectura hexagonal modular (Sprints 1–4 completados).

## Vista general

```
wms_esp/
├── app/
│   ├── api/v1/              # Routers HTTP (presentación)
│   ├── bootstrap/           # Composition roots (handlers)
│   ├── modules/             # Bounded contexts hexagonales
│   ├── shared/              # Kernel, formatting, presentation helpers
│   └── infrastructure/      # ORM models + re-exports legacy
├── frontend/                # React + TypeScript + Vite
├── mysql-init/              # Scripts SQL de esquema y datos semilla
├── tests/                   # pytest
├── docs/                    # Documentación del proyecto
└── .github/workflows/       # CI (pytest, lint-imports, frontend build)
```

## Backend — capa API

```
app/api/v1/
├── endpoints/          # Un router por recurso (productos, inventario, auth, …)
├── dependencies.py       # JWT, empresa_id, permisos
├── empresa_contexto.py   # ContextoEmpresa multi-tenant
└── router.py             # Registro de routers
```

Patrón de endpoint:

```python
handlers: CatalogHandlers = Depends(obtener_catalog_handlers)
resultado = await handlers.crear_producto.handle(comando)
```

## Backend — módulos hexagonales

| Módulo | Handlers (bootstrap) | Endpoints principales |
|--------|----------------------|------------------------|
| `iam` | `build_iam_handlers` | auth, usuarios, roles, cargos, permisos, perfil |
| `tenant` | `build_tenant_handlers` | empresas |
| `catalog` | `build_catalog_handlers` | productos, tipos, unidades, consulta, import |
| `warehouse` | `build_warehouse_handlers` | bodegas, tipos_zona, zonas_bodega |
| `inventory` | `build_inventory_handlers` | stock, movimientos, recepción, traslado, despacho, config |
| `geo` | `build_geo_handlers` | regiones, ciudades, comunas |

Estructura interna típica:

```
app/modules/inventory/
├── domain/
│   ├── entities.py
│   ├── ports.py
│   └── services/           # políticas (stock, series, presentación)
├── application/
│   ├── commands.py
│   └── handlers/
├── infrastructure/
│   ├── inventario_crud.py
│   ├── inventario_repository.py
│   └── orm_mappers.py
└── presentation/http/
    └── dependencies.py
```

## Backend — shared

```
app/shared/
├── kernel/result.py
├── formatting.py
├── locale_formatting.py
└── presentation/result_http.py
```

## Backend — infraestructura compartida

```
app/infrastructure/
├── models/              # Modelos SQLAlchemy (todas las tablas)
├── database.py          # Session async
├── security/            # JWT, bcrypt
├── middleware/          # Locale, errores
└── repositories/        # Re-exports hacia módulos (compatibilidad)
```

**Nota:** `app/domain/services/` fue eliminado. La lógica vive en handlers de módulos.

## Frontend

```
frontend/src/
├── api/                 # Clientes REST + menuConfig
├── pages/               # Páginas por ruta
├── features/            # Lógica por dominio UI
├── components/          # Layout, CRUD genérico, UI
├── routing/             # ProtectedRoute, PermissionRoute
└── context/             # Auth, Locale, Theme
```

Rutas de la app: prefijo `/app/*` (ej. `/app/inventario/stock`).

## Tests

```
tests/
├── conftest.py
├── test_auth.py
├── test_inventario.py
└── …
```

## CI (GitHub Actions)

Archivo: `.github/workflows/ci.yml`

1. `pytest tests/`
2. `lint-imports` (contratos en `.importlinter`)
3. `npm run build` en `frontend/`

## Documentación

| Archivo | Audiencia |
|---------|-----------|
| [MANUAL_USUARIO.md](./MANUAL_USUARIO.md) | Operadores y administradores |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitectura técnica |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribuidores / PRs |
| [CORE_WMS.md](./CORE_WMS.md) | Inventario operativo (API + permisos) |
| [INDEX.md](./INDEX.md) | Índice maestro |

## Plantilla para nuevos recursos

Ver `PLANTILLA_ENDPOINT.py` en la raíz del repo (patrón hexagonal con handlers).
