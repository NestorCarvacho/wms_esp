# CLAUDE.md — Guía de arquitectura y desarrollo

Documento de referencia rápida para colaboradores y asistentes de código. Para instalación detallada ver [README.md](README.md); para documentación completa ver [docs/INDEX.md](docs/INDEX.md).

---

## Stack

| Capa | Tecnología |
|------|------------|
| Backend | Python 3.9+, FastAPI, SQLAlchemy async, aiomysql |
| Frontend | React 19, Vite 6, TypeScript, Tailwind |
| BD | MySQL 8.0 |
| Auth | JWT (python-jose), BCrypt (passlib) |
| Deploy | Railway (API + SPA + MySQL plugin) |

---

## Comandos de desarrollo

### Stack completo con Docker (recomendado para validar E2E)

```bash
docker compose up -d --build
# Reset BD: docker compose down -v && docker compose up -d --build
```

| Servicio | URL |
|----------|-----|
| API | http://localhost:8000 |
| Swagger | http://localhost:8000/docs |
| Frontend (prod build) | http://localhost:4173 |
| MySQL | localhost:3307 → BD `wms_db` |

### Backend (local sin Docker)

```bash
cp .env.example .env          # DATABASE_URL, SECRET_KEY, CORS_ORIGINS
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Base de datos (local sin Docker)

```bash
# Instalación completa (recomendada)
mysql -u root -p wms_esp < mysql-init/schema_completo.sql

# Migración incremental en Railway / BD existente
railway service link MySQL
railway run python scripts/apply_railway_migrations.py
```

Usuario sembrado por defecto: `admin@emp001.cl` / `WmsAdmin1!`

### Frontend (local)

```bash
cd frontend
npm install
cp .env.example .env          # VITE_API_URL vacío → proxy Vite a :8000
npm run dev                     # http://localhost:5173
npm run build                   # tsc + vite build (type-check incluido)
```

### Verificación rápida

```bash
curl http://localhost:8000/health
# Login → JWT con empresa_id, permisos, es_empresa_maestra
# Endpoint protegido sin token → 401
# Frontend build → npm run build en frontend/
```

---

## Regla de oro: multi-tenant

**Todo acceso a datos DEBE filtrar por `empresa_id`.**

| Regla | Detalle |
|-------|---------|
| Origen del ID | Extraído del JWT (`TokenPayload.empresa_id`), **nunca** confiar en el body para usuarios normales |
| Aislamiento | Un tenant no ve datos de otro |
| Empresa maestra | `es_empresa_maestra=true` en JWT; puede filtrar con `?empresa_id=` en listados/creación |
| Creación | Usar `resolver_empresa_creacion()` — maestra debe enviar `empresa_id` explícito |

### Helpers obligatorios

```python
# app/api/v1/empresa_contexto.py
ContextoEmpresa          # ctx.empresa_operacion(), ctx.empresas_scope_ids()
ctx.verificar_acceso_a_empresa(empresa_id_recurso)  # 403 si no es maestra y recurso es de otra empresa
kwargs_listado(ctx)      # pasa es_super_admin, empresa_id_filtro, empresas_scope_ids
contexto_requiere_permiso("productos.leer")  # auth + tenant + permiso

# app/infrastructure/repositories/listado_helpers.py
filtro_empresa(model, empresa_id, es_super_admin, empresa_id_filtro, empresas_scope_ids)
condicion_buscar(model, buscar, *fields)
aplicar_orden(stmt, columnas={...}, ordenar_por=..., orden=...)
```

Patrón en endpoint:

```python
@router.get("")
async def listar(
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("productos.leer")),
    handlers: CatalogHandlers = Depends(obtener_catalog_handlers),
):
    return await handlers.listar_productos.handle(
        empresa_id=ctx.empresa_usuario_id,
        **kwargs_listado(ctx),
    )
```

---

## Arquitectura hexagonal modular

```
Request → endpoint (app/api/v1/endpoints/)
       → handler   (app/modules/<ctx>/application/handlers/)
       → port      (app/modules/<ctx>/domain/ports.py)
       → adapter   (app/modules/<ctx>/infrastructure/)
       → ORM       (app/infrastructure/models/)
```

Composition roots en `app/bootstrap/*_container.py`. Los routers inyectan handlers con `Depends(obtener_*_handlers)`.

| Capa | Responsabilidad | No debe |
|------|-----------------|---------|
| **Endpoint** | HTTP, DTOs, Depends, status codes | SQL, lógica de negocio pesada |
| **Handler** | Caso de uso, orquestación | Importar FastAPI Request |
| **Domain** | Entidades, puertos, políticas | SQLAlchemy, infraestructura |
| **Infrastructure** | Queries, mappers ORM | Validar permisos HTTP |
| **Schema** | Pydantic DTOs | Acceder a BD |

`app/domain/services/` fue **eliminado** — no crear servicios allí.

Referencia: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/capas/](docs/capas/)

### Módulos (`app/modules/`)

| Módulo | Bootstrap |
|--------|-----------|
| `iam` | `build_iam_handlers` |
| `tenant` | `build_tenant_handlers` |
| `catalog` | `build_catalog_handlers` |
| `warehouse` | `build_warehouse_handlers` |
| `inventory` | `build_inventory_handlers` |
| `geo` | `build_geo_handlers` |

### CI local

```bash
python -m pytest -q
lint-imports
cd frontend && npm run build
```

### Modelos ORM

Concentrados en `app/infrastructure/models/usuario.py` (Empresa, Usuario, Producto, StockZona, MovimientoInventario, etc.). Modelos auxiliares en archivos dedicados (ej. `empresa_administrada.py`).

---

## Convenciones del proyecto

| Tema | Convención |
|------|------------|
| Idioma código | Español: tablas, columnas, funciones, variables de dominio |
| Permisos RBAC | Formato `recurso.accion` — ej. `inventario.recepcionar`, `productos.leer` |
| Cadena RBAC | `Usuario → usuario_rol → Rol → rol_permiso → Permiso` (+ herencia desde Cargo) |
| Estados | Tablas catálogo (`estado_orden`, etc.), **no** ENUMs MySQL |
| Precios | `DECIMAL(12,2)` o superior |
| Respuestas API | `{ "exito": bool, "datos": ..., "mensaje": str, "errores": [] }` |
| JWT claims | `usuario_id`, `empresa_id`, `roles[]`, `permisos[]`, `es_empresa_maestra` |
| Localización | Middleware `LocaleMiddleware` → `contextvars` (`Accept-Language`, `X-Time-Zone`) |
| Plantilla endpoint | [PLANTILLA_ENDPOINT.py](PLANTILLA_ENDPOINT.py) |

### Auditoría de inventario

Handlers en `app/modules/inventory/` → tabla `movimiento_inventario` (tipos: `RECEPCION`, `TRASLADO`, `DESPACHO`). Timestamps UTC en BD; presentación local vía `locale_formatting` + headers de timezone.

---

## Estructura del monorepo

```
wms_esp/
├── app/
│   ├── main.py
│   ├── api/v1/endpoints/
│   ├── bootstrap/              # build_*_handlers
│   ├── modules/                # iam, catalog, warehouse, inventory, tenant, geo
│   ├── shared/
│   ├── infrastructure/models/
│   └── schemas/
├── frontend/src/
├── mysql-init/
├── tests/
└── docs/
```

### Frontend — patrones clave

| Concepto | Ubicación |
|----------|-----------|
| Rutas post-login | `/app/*` — ver `src/routes/paths.ts` |
| Auth + permisos | `src/context/AuthContext.tsx`, `src/hooks/usePermissions.ts` |
| Locale/i18n | `src/context/LocaleContext.tsx`, `src/i18n/` |
| CRUD tablas | `src/crud/usePaginatedCrudTable.ts` |
| Filtro empresa maestra | `src/crud/useCrudEmpresaFilterCard.ts` |
| Menú + permisos ruta | `src/api/menuConfig.ts` → `ROUTE_PERMISSIONS` |
| API client | `src/api/client.ts` — JWT en `localStorage`, headers locale |

Alias Vite: `@` → `src/`, `@/components` → `component/`

---

## Auth y seguridad

```
POST /api/v1/auth/login → JWT
Authorization: Bearer <token> en endpoints protegidos
```

- Bloqueo por intentos fallidos (`LOGIN_MAX_ATTEMPTS`, `LOGIN_LOCKOUT_MINUTES`)
- Cambio de contraseña: perfil propio (`POST /auth/cambiar-contrasena`) o admin/gestor vía CRUD usuarios
- Login devuelve `preferencias_locale` (empresa + overrides de perfil)

Dependencias comunes:

```python
Depends(obtener_usuario_autenticado)   # dict con claims JWT
Depends(requiere_permiso("codigo"))    # 403 si falta permiso
Depends(contexto_requiere_permiso(...)) # tenant + permiso combinados
```

---

## Migraciones SQL

| Escenario | Archivo / comando |
|-----------|-------------------|
| BD nueva (local/Docker) | `mysql-init/schema_completo.sql` |
| BD existente (Railway) | `scripts/apply_railway_migrations.py` |
| Diagnóstico | `railway run python scripts/apply_railway_migrations.py --diagnose` |
| Una migración | `--file 19_locale_currency.sql` |

Orden y detalle: [mysql-init/README_RAILWAY.md](mysql-init/README_RAILWAY.md)

**No ejecutar** en producción con datos: `01_setup.sql`, `03_rbac_hierarchy.sql` (recrean esquema).

---

## Despliegue Railway

| Servicio | Root | URL producción |
|----------|------|----------------|
| `wms_esp` (API) | `/` | https://wmsesp-production.up.railway.app |
| `wms-frontend` | `frontend/` | https://wms-frontend-production-296e.up.railway.app |

```bash
railway login && railway link -p WMS_ESP
railway service link wms_esp && railway redeploy -y
railway service link wms-frontend && railway redeploy -y
railway service link MySQL && railway run python scripts/apply_railway_migrations.py
```

Guías: [docs/DEPLOY_RAILWAY.md](docs/DEPLOY_RAILWAY.md), [docs/RAILWAY_WMS_ESP.md](docs/RAILWAY_WMS_ESP.md)

---

## Módulos principales (estado actual)

| Módulo | Backend | Notas |
|--------|---------|-------|
| Auth / usuarios / RBAC | `auth.py`, `usuarios.py`, `roles.py`, `permisos.py` | Multi-tenant + empresa maestra |
| Catálogo | `productos.py`, `bodegas.py`, `tipo_zona.py`, … | CRUD estándar |
| Inventario operativo | `inventario.py` | Handlers en `modules/inventory` | Ver [docs/CORE_WMS.md](docs/CORE_WMS.md) |
| Regionalización | `locale_middleware`, `auth_service._resolver_preferencias_locale` | Migración `19_locale_currency.sql` |
| Órdenes compra/venta | — | Próximamente (tag OpenAPI existe) |

---

## Checklist al agregar una feature

1. ¿Filtra por `empresa_id` vía JWT / `ContextoEmpresa`?
2. ¿Endpoint delgado → handler (módulo) → port → adapter?
3. ¿DTO en `app/schemas/`?
4. ¿Permiso `recurso.accion` registrado y sembrado en SQL si es nuevo?
5. ¿Ruta frontend en `App.tsx` + `menuConfig.ts` + `ROUTE_PERMISSIONS`?
6. ¿Migración SQL si hay cambio de esquema?
7. ¿Pasa `lint-imports` y pytest?

---

## Documentación relacionada

| Doc | Audiencia |
|-----|-----------|
| [docs/INDEX.md](docs/INDEX.md) | Índice maestro |
| [docs/MANUAL_USUARIO.md](docs/MANUAL_USUARIO.md) | Usuarios finales |
| [docs/CORE_WMS.md](docs/CORE_WMS.md) | Inventario (técnico) |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitectura hexagonal |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | PRs y CI |
| [copilot-instructions.md](copilot-instructions.md) | Instrucciones Copilot |
| [API_EXAMPLES.md](API_EXAMPLES.md) | Ejemplos curl/API |
