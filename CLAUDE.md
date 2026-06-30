# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es

WMS (Warehouse Management System) multi-empresa (multi-tenant). Monorepo con backend FastAPI async + MySQL y frontend Vite/React 19. Auth JWT con RBAC jerárquico (Usuario → Cargo → Rol → Permiso).

## Comandos

### Backend
```bash
# Entorno
python -m venv venv && source venv/bin/activate   # Linux/Mac (venv\Scripts\activate en Windows)
pip install -r requirements.txt
cp .env.example .env                               # editar DATABASE_URL, SECRET_KEY, CORS_ORIGINS

# Servidor (Swagger en /docs, ReDoc en /redoc, health en /health)
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Base de datos
```bash
# Opción A — schema consolidado (recomendada)
mysql -u root -p wms_esp < mysql-init/schema_completo.sql   # admin@emp001.cl / WmsAdmin1!

# Opción B — Docker (MySQL en localhost:3307, DB wms_db; reset: down -v)
docker compose up -d
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_URL vacío → Vite proxya /api a localhost:8000
npm run dev                 # http://localhost:5173
npm run build               # tsc -b && vite build (el build SÍ chequea tipos)
```

### Tests / lint
No hay suite de tests automatizada ni linter configurado. `testgeneral.py` es un script manual de depuración de login (usa `unittest.mock`, no pytest). El único "type-check" es `npm run build` en el frontend (`tsc -b`).

## Regla de oro: multi-tenancy

**Todo acceso a datos DEBE filtrar por `empresa_id`.** El `empresa_id` se extrae del JWT del usuario autenticado, **nunca** se acepta desde el body de una petición de usuario final. El cruce de datos entre empresas está prohibido salvo para la **empresa maestra** (`EMPRESA_MAESTRA_ID = 1`, claim `es_empresa_maestra`), que puede operar sobre las empresas que administra.

El flujo correcto usa los helpers de `app/api/v1/`:
- `obtener_usuario_autenticado` — valida el JWT y devuelve dict con `usuario_id`, `empresa_id`, `permisos`, `es_empresa_maestra`.
- `requiere_permiso("recurso.accion")` — exige al menos uno de los permisos (p. ej. `productos.leer`, `productos.crear`, `productos.importar`).
- `obtener_contexto_empresa` / `contexto_requiere_permiso(...)` (`empresa_contexto.py`) — combinan permiso + `ContextoEmpresa`, que resuelve si la empresa maestra está filtrando una empresa concreta o agregando todas las administradas.
- `resolver_empresa_creacion(...)` — determina la empresa destino al **crear** (valida que un usuario normal no cree en otra empresa; exige `empresa_id` explícito a la maestra).
- `kwargs_listado(ctx)` — desempaqueta `es_super_admin`, `empresa_id_filtro`, `empresas_scope_ids` hacia los servicios de listado.

En la capa de datos, `infrastructure/repositories/listado_helpers.py` centraliza el WHERE multi-tenant (`filtro_empresa`), la búsqueda (`condicion_buscar`) y el orden validado (`aplicar_orden`).

## Arquitectura de capas (N-tier)

El flujo de una petición es estricto: **endpoint → service → repository**. Nunca saltarse capas (un endpoint no toca la BD directamente; un repository no contiene reglas de negocio).

```
app/
├── api/v1/endpoints/      # Presentación: routers FastAPI, validación HTTP, mapeo de errores
├── api/v1/                # Dependencias compartidas (dependencies, empresa_contexto, listado_query)
├── domain/services/       # Negocio: reglas, validaciones, orquestación
├── infrastructure/
│   ├── repositories/      # Datos: SQLAlchemy async, filtrado por empresa_id
│   ├── models/            # Modelos ORM (ver nota abajo)
│   ├── email/             # Resend
│   └── database.py        # Engine async + get_db_session (NullPool)
├── schemas/               # DTOs Pydantic (entrada/salida)
└── core/                  # config, security (JWT/bcrypt), rate_limit
```

**Nota sobre modelos:** pese al nombre, **casi todos los modelos ORM viven en `app/infrastructure/models/usuario.py`** (~25 clases: Empresa, Producto, Bodega, Inventario, etc.) compartiendo el mismo `Base`. Al crear un modelo nuevo, hereda de ese `Base`.

**Inyección de dependencias:** cada endpoint define factories locales (`async def obtener_X_service(session = Depends(get_db_session))`) que arman `Service(Repository(session))`. Las sesiones se inyectan vía `Depends(get_db_session)`.

**Respuestas:** los endpoints devuelven `RespuestaAPIDTO(exito, datos, mensaje).dict()`. Los servicios lanzan `ValueError` con mensajes en español ("no encontrado", "duplicado", "ya existe") y el endpoint los mapea a `HTTPException` con el status code correcto.

`PLANTILLA_ENDPOINT.py` es la guía paso a paso para añadir un recurso nuevo (DTO → modelo ORM → repository → service → endpoint → registrar el router en `app/main.py`).

## Convenciones del proyecto

- **Idioma español** en nombres de variables, funciones, tablas y columnas.
- **Sin ENUMs:** los estados se modelan en tablas (`estados_inventario`, `estados_orden`, etc.), no como enums de código.
- **Auditoría:** toda escritura debe registrar el actor en `ultimo_movimiento_por` y generar un registro en `movimiento_inventario` / `movimientos_stock`.
- **Precios:** usar tipos de alta precisión para `precio_costo` / `precio_venta`.
- **RBAC:** un `Cargo` pertenece a una empresa y se relaciona N:M con `Roles`; los permisos atómicos siguen el patrón `recurso.accion`.

## Frontend (`frontend/src/`)

- `api/` — un wrapper tipado por recurso sobre `client.ts` (`apiRequest`, token en `localStorage['wms_token']`, handler global de 401). `listQuery.ts` arma los query params de paginación/búsqueda/orden que esperan los listados del backend.
- `crud/` — hooks genéricos reutilizables que abstraen el CRUD paginado (`usePaginatedCrudTable`, `useCrudUi`, filtros, y el caso especial de la empresa maestra). Las páginas de recurso se construyen sobre estos hooks; preferir extenderlos antes que duplicar lógica.
- `pages/` — una página por recurso (Productos, Bodegas, Inventario, etc.).
- `context/` — `AuthContext`, `ThemeContext`, `UIContext`.
- `routing/` — `ProtectedRoute` (sesión) y `PermissionRoute` (permiso RBAC); las rutas se definen en `routes/paths.ts`.

UI: Tailwind + Radix UI + `lucide-react`, toasts con `sonner`, formularios con `react-hook-form`.

## Migraciones y despliegue

- **Migraciones:** archivos SQL numerados en `mysql-init/` (`01_…` a `18_…`). `schema_completo.sql` es el schema consolidado; los `railway_*.sql` son variantes/pasos para aplicar en la BD de Railway (ver `mysql-init/railway_migration_steps.md`).
- **Railway:** backend y frontend se despliegan como **servicios separados** del mismo repo (Dockerfile + `railway.toml` / `frontend/railway.toml`). Health check en `/health`. `config.py` normaliza la `DATABASE_URL` de Railway (`mysql://` → `mysql+aiomysql://`) automáticamente. Detalle en `docs/DEPLOY_RAILWAY.md` y `docs/RAILWAY_WMS_ESP.md`.

## Seguridad y auth

JWT HS256 (`core/security.py`), access token de 30 min, contraseñas con bcrypt (truncadas a 72 bytes). Login con bloqueo por intentos (`LOGIN_MAX_ATTEMPTS`/`LOGIN_LOCKOUT_MINUTES`) y recuperación de contraseña por email vía Resend. En local, `EMAIL_DEV_LOG_ONLY=True` imprime el enlace de reset en la consola de uvicorn en vez de enviar correo.
