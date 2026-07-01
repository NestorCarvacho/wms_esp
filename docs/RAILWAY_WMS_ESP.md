# Railway — proyecto WMS_ESP

Configuración as-code para los servicios del monorepo.

## Servicios

| Servicio | Config | Root directory (Dashboard) |
|----------|--------|--------------------------|
| `wms_esp` (API) | `/railway.toml` | `/` (raíz) |
| `wms-frontend` | `/frontend/railway.toml` | `frontend` |
| `wms-notifications` (Fase 2) | `/services/notification-service/railway.toml` | `/` (raíz) |
| `MySQL` | — | — |
| Redis | Upstash o plugin Railway | ver Fase 2 abajo |

> En Settings de cada servicio, **Config file path**: ruta absoluta desde el repo (`/railway.toml`, `/frontend/railway.toml` o `/services/notification-service/railway.toml`).

## URLs (production)

- **API:** https://wmsesp-production.up.railway.app
- **Frontend:** https://wms-frontend-production-296e.up.railway.app
- **Health:** https://wmsesp-production.up.railway.app/health
- **Notifications (Fase 2):** pendiente — ver cutover abajo

## Estado actual (2026-06)

| Componente | Estado |
|------------|--------|
| Código Fase 2 | Desplegado en `main` |
| `NOTIFICATIONS_MODE` prod | `local` (monolito WS + inbox) |
| `wms-notifications` | **No creado** — límite plan Free |
| Redis | **No creado** — 1 volumen ya usado por MySQL |

El health del API incluye `"notifications_mode": "local"`.

## Variables configuradas

### wms_esp (backend)

| Variable | Valor prod |
|----------|------------|
| `DATABASE_URL` | MySQL (Railway) |
| `DEBUG` | `False` |
| `CORS_ORIGINS` | `https://wms-frontend-production-296e.up.railway.app` |
| `SECRET_KEY` | compartida con notification-service |
| `NOTIFICATIONS_MODE` | `local` (cutover → `remote`) |

### wms-frontend

| Variable | Valor prod |
|----------|------------|
| `VITE_API_URL` | `https://wmsesp-production.up.railway.app` |
| `VITE_NOTIFICATIONS_API_URL` | pendiente cutover |
| `VITE_NOTIFICATIONS_WS_URL` | pendiente cutover |

## Fase 2 — Cutover notification-service

### Limitación plan Free

Railway Free permite **1 volumen** (MySQL) y un **límite de servicios/recursos**. Al intentar añadir Redis o `wms-notifications`:

```
Failed to add Redis: You can only have 1 volumes per project
Free plan resource provision limit exceeded
```

**Opciones:**

1. **Upstash + Render/Fly** (gratis) → [docs/DEPLOY_NOTIFICATIONS_EXTERNAL.md](DEPLOY_NOTIFICATIONS_EXTERNAL.md) **recomendado sin pagar**
2. **Upgrade** Railway Hobby/Pro → añadir Redis + `wms-notifications` en el mismo proyecto
3. **Mantener `NOTIFICATIONS_MODE=local`** (comportamiento actual, sin regresión)

### Pasos tras upgrade (Dashboard o CLI)

#### 1. Redis

**Opción A — Upstash (recomendado en Free):**

1. [console.upstash.com](https://console.upstash.com) → Create Redis database.
2. Copiar `REDIS_URL` (formato `rediss://...`).

**Opción B — Railway plugin:**

```bash
railway add --database redis
```

#### 2. Servicio `wms-notifications`

1. Railway → **New Service** → GitHub Repo `NestorCarvacho/wms_esp`.
2. **Root Directory:** `/` (raíz del repo).
3. **Config file path:** `/services/notification-service/railway.toml`.
4. **Networking:** generar dominio público (puerto 8010 o el que asigne Railway).

O vía CLI (con plan que permita más servicios):

```bash
railway add --repo NestorCarvacho/wms_esp --service wms-notifications
```

#### 3. Variables `wms-notifications`

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | mismo que `wms_esp` |
| `SECRET_KEY` | mismo que `wms_esp` |
| `REDIS_URL` | Upstash o Railway Redis |
| `CORS_ORIGINS` | URL del frontend |
| `NOTIFICATIONS_MODE` | `local` (obligatorio en este servicio) |
| `DEBUG` | `False` |

#### 4. Variables `wms_esp` (cutover)

```bash
railway variable set NOTIFICATIONS_MODE=remote --service wms_esp
railway variable set REDIS_URL="rediss://..." --service wms_esp
```

#### 5. Variables `wms-frontend` (rebuild)

```bash
railway variable set VITE_NOTIFICATIONS_API_URL="https://TU-NOTIFICATIONS.up.railway.app" --service wms-frontend
railway variable set VITE_NOTIFICATIONS_WS_URL="https://TU-NOTIFICATIONS.up.railway.app" --service wms-frontend
```

Redeploy frontend (build time):

```bash
railway service link wms-frontend
railway up ./frontend --path-as-root --detach
```

#### 6. Verificación

```bash
curl https://TU-NOTIFICATIONS.up.railway.app/health
# {"status":"ok","service":"notification-service","redis":true,...}

curl https://wmsesp-production.up.railway.app/health
# {"notifications_mode":"remote",...}
```

Despacho con stock crítico → evento Redis → inbox + WS en notification-service.

### Rollback

```bash
railway variable set NOTIFICATIONS_MODE=local --service wms_esp
```

Quitar `VITE_NOTIFICATIONS_*` del frontend y redeploy.

## Puertos (importante)

En los logs del backend debe aparecer algo como:

```
Uvicorn running on http://0.0.0.0:8080
```

El dominio público debe apuntar al **mismo puerto**:

1. Servicio `wms_esp` → **Settings → Networking**
2. Puerto público: **8080** (no 8000)
3. Redeploy si hiciste cambios

Si el puerto no coincide, la API responde **502** y el navegador muestra un error de **CORS** aunque `CORS_ORIGINS` esté bien.

## Comandos útiles

```bash
railway link -p WMS_ESP
railway service link wms_esp
railway logs --service wms_esp

railway service link wms-frontend
railway up ./frontend --path-as-root --detach

# Tras crear wms-notifications:
railway service link wms-notifications
railway up --detach -m "deploy notification-service"
```

Script automatizado (PowerShell): `scripts/railway_configure_notifications.ps1`

## Pendiente manual

1. **Upgrade Railway** o **Upstash Redis** para habilitar Fase 2 en producción.
2. **SECRET_KEY:** generar una clave fuerte compartida entre `wms_esp` y `wms-notifications`.
3. **MySQL:** migraciones pendientes en `mysql-init/` si aplica.
