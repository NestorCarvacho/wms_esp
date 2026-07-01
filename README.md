# WMS Multi-Tenant

Sistema de gestión de almacén multi-empresa con autenticación JWT, RBAC (Usuario → Cargo → Rol → Permiso) y frontend React.

## Requisitos

| Componente | Versión |
|------------|---------|
| Python | 3.9+ |
| Node.js | 18+ |
| MySQL | 8.0+ |
| Git | — |

## Estructura del monorepo

```
wms_esp/
├── app/                    # Backend FastAPI
├── frontend/               # Frontend Vite + React
├── mysql-init/             # Scripts SQL de inicialización
├── docs/                   # Documentación
├── docker-compose.yml      # MySQL + backend (local)
├── railway.toml            # Config Railway — API
└── frontend/railway.toml   # Config Railway — SPA
```

### Backend (`app/`)

```
app/
├── api/v1/endpoints/       # Controladores REST
├── core/                   # Config, JWT, seguridad
├── domain/services/        # Lógica de negocio
├── infrastructure/         # Repositorios, modelos, BD
├── schemas/                # DTOs Pydantic
└── main.py
```

### Frontend (`frontend/`)

```
frontend/
├── src/                    # Páginas, hooks, API, contexto auth
├── component/              # UI legacy (layout, formularios, menú)
└── assets/img/             # Logos WMS
```

## Desarrollo local

### 1. Clonar e instalar

```bash
git clone https://github.com/NestorCarvacho/wms_esp.git
cd wms_esp

python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/Mac

pip install -r requirements.txt
```

### 2. Base de datos

Instalación completa (recomendada):

```bash
mysql -u root -p wms_esp < mysql-init/schema_completo.sql
```

Usuario admin incluido: `admin@emp001.cl` / `WmsAdmin1!`

Alternativa con Docker (aplica `schema_completo.sql` al levantar MySQL):

```bash
docker compose up -d
# Primera vez o reset completo de BD:
# docker compose down -v && docker compose up -d
```

MySQL expuesto en `localhost:3307`, base de datos `wms_db`.

### 3. Backend

```bash
cp .env.example .env
# Editar DATABASE_URL, SECRET_KEY, CORS_ORIGINS

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Swagger: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health: http://localhost:8000/health

### 4. Frontend

```bash
cd frontend
npm install
cp .env.example .env          # VITE_API_URL vacío → proxy Vite a :8000
npm run dev
```

- App: http://localhost:5173

## Variables de entorno

### Backend (`.env`)

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Conexión MySQL (`mysql+aiomysql://...`) |
| `SECRET_KEY` | Clave para firmar JWT |
| `DEBUG` | `True` en local, `False` en producción |
| `CORS_ORIGINS` | URLs del frontend, separadas por coma |

### Frontend (`frontend/.env`)

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL del API en producción. Vacío en local (usa proxy Vite) |

## API principal

| Módulo | Prefijo |
|--------|---------|
| Autenticación | `/api/v1/auth/` |
| Usuarios, empresas, cargos, roles | `/api/v1/...` |
| Bodegas, productos, unidades de medida | `/api/v1/...` |
| Tipos de zona, zonas de bodega | `/api/v1/...` |
| Permisos y RBAC | `/api/v1/...` |

## Multi-tenancy

Todo acceso a datos **debe filtrar por `empresa_id`**:

- Se obtiene del JWT del usuario autenticado
- No se acepta como parámetro del body
- Garantiza aislamiento entre empresas

## Arquitectura de capas

1. **Presentación** — `api/v1/endpoints/`
2. **Negocio** — `domain/services/`
3. **Datos** — `infrastructure/`
4. **Seguridad** — `core/security.py`

Detalle en [`docs/capas/`](docs/capas/) y [`docs/ESTRUCTURA_PROYECTO.md`](docs/ESTRUCTURA_PROYECTO.md).

## Despliegue en Railway

Frontend y backend se despliegan como **servicios separados** en el mismo repositorio.

| Servicio | Root directory | URL (production) |
|----------|----------------|------------------|
| `wms_esp` (API) | `/` | https://wmsesp-production.up.railway.app |
| `wms-frontend` | `frontend` | https://wms-frontend-production-296e.up.railway.app |
| MySQL | plugin Railway | — |

Guías:

- [`docs/DEPLOY_RAILWAY.md`](docs/DEPLOY_RAILWAY.md) — guía general paso a paso
- [`docs/RAILWAY_WMS_ESP.md`](docs/RAILWAY_WMS_ESP.md) — estado y variables del proyecto WMS_ESP
- [`docs/DEPLOY_NOTIFICATIONS_EXTERNAL.md`](docs/DEPLOY_NOTIFICATIONS_EXTERNAL.md) — Fase 2 sin upgrade (Upstash + Render)

```bash
npm i -g @railway/cli
railway login
railway link -p WMS_ESP

# Backend
railway service link wms_esp
railway redeploy -y

# Frontend
railway service link wms-frontend
railway up ./frontend --path-as-root --detach
```

## Funcionalidades

- [x] Auth JWT multi-tenant
- [x] CRUD usuarios, empresas, cargos, roles, permisos
- [x] RBAC: Usuario → Cargo → Rol → Permiso
- [x] Bodegas, productos, unidades de medida
- [x] Tipos de zona y zonas de bodega
- [x] Importación masiva de productos (Excel)
- [x] Paginación y búsqueda server-side en tablas CRUD
- [x] Inventario operativo (stock, recepción, traslado, despacho, exportaciones)
- [x] Regionalización por empresa (locale, timezone, moneda)

## Documentación

| Recurso | Contenido |
|---------|-----------|
| [**CLAUDE.md**](CLAUDE.md) | Guía concisa de arquitectura, comandos y convenciones (onboarding devs) |
| [**docs/INDEX.md**](docs/INDEX.md) | **Índice maestro** de toda la documentación |
| [**docs/MANUAL_USUARIO.md**](docs/MANUAL_USUARIO.md) | **Manual de uso** para operadores y administradores |
| [docs/CORE_WMS.md](docs/CORE_WMS.md) | Inventario operativo (referencia técnica) |
| [docs/capas/](docs/capas/) | Capas presentación, negocio, datos, seguridad |
| [docs/DEPLOY_RAILWAY.md](docs/DEPLOY_RAILWAY.md) | Despliegue en Railway |
| [docs/RAILWAY_WMS_ESP.md](docs/RAILWAY_WMS_ESP.md) | Configuración actual en Railway |
| [docs/DEPLOY_NOTIFICATIONS_EXTERNAL.md](docs/DEPLOY_NOTIFICATIONS_EXTERNAL.md) | Notification-service en Render + Upstash |
| [mysql-init/README_RAILWAY.md](mysql-init/README_RAILWAY.md) | Migraciones SQL en Railway |
| [frontend/src/hooks/README.md](frontend/src/hooks/README.md) | Convenciones de hooks |
