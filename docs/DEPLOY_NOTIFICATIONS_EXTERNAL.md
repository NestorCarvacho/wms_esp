# Fase 2 sin upgrade Railway — Upstash + Render

Despliega `notification-service` **fuera de Railway** (gratis) y conecta el monolito en Railway vía **Upstash Redis**.

```
Railway wms_esp (remote) ──publish──► Upstash Redis
                                           │
                                           ▼
                              Render wms-notifications
                                • REST inbox
                                • WebSocket inventario
                                • MySQL Railway (proxy público)
```

## Coste estimado

| Recurso | Plan | Coste |
|---------|------|-------|
| Railway (API + frontend + MySQL) | Free | $0 |
| Upstash Redis | Free (10k cmds/día) | $0 |
| Render Web Service | Free | $0* |

\* Render Free **duerme** tras ~15 min sin tráfico. El primer request tarda ~30 s; WebSocket puede cortarse al dormir. Para prod seria considera Render Starter ($7/m) o Fly.io.

---

## Paso 1 — Upstash Redis

1. [console.upstash.com](https://console.upstash.com) → **Create database**.
2. Región: elige la más cercana a Railway (ej. `us-east-1`).
3. Copia **Redis URL** (`rediss://default:...@....upstash.io:6379`).
4. Guarda también el token — lo usarás en Railway y Render.

> Upstash usa TLS (`rediss://`). El cliente `redis` de Python lo soporta nativamente.

---

## Paso 2 — MySQL público (Railway)

El servicio en Render **no** puede usar `mysql.railway.internal`. Necesitas la URL **pública** del plugin MySQL:

1. Railway → servicio **MySQL** → **Connect** → **Public Network**.
2. Copia la URL tipo:
   ```
   mysql://root:PASSWORD@viaduct.proxy.rlwy.net:PORT/railway
   ```
3. Para el notification-service, usa la misma URL; la app la convierte a `mysql+aiomysql://` automáticamente.

O con CLI:

```bash
railway link -p WMS_ESP
railway service link MySQL
railway variable list --kv
# Busca MYSQL_PUBLIC_URL o MYSQL_URL con host viaduct.proxy.rlwy.net
```

---

## Paso 3 — Desplegar en Render

### Opción A — Blueprint (recomendado)

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**.
2. Conecta repo `NestorCarvacho/wms_esp`.
3. Render detecta `render.yaml` en la raíz.
4. Al crear, rellena variables secretas:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | URL pública MySQL (paso 2) |
| `SECRET_KEY` | **Misma** que `wms_esp` en Railway |
| `REDIS_URL` | URL Upstash (`rediss://...`) |
| `CORS_ORIGINS` | `https://wms-frontend-production-296e.up.railway.app` |

5. Deploy → anota la URL: `https://wms-notifications.onrender.com` (o similar).

### Opción B — Manual

1. **New Web Service** → repo GitHub.
2. **Language:** Docker.
3. **Dockerfile Path:** `services/notification-service/Dockerfile`.
4. **Root Directory:** vacío (raíz del repo).
5. Variables de entorno (tabla arriba).
6. **Health Check Path:** `/health`.

---

## Paso 4 — Cutover Railway (monolito + frontend)

Con la URL de Render lista:

```powershell
.\scripts\cutover_notifications_external.ps1 `
  -NotificationsUrl "https://wms-notifications.onrender.com" `
  -RedisUrl "rediss://default:xxxx@xxxx.upstash.io:6379"
```

El script:

1. Pone `NOTIFICATIONS_MODE=remote` y `REDIS_URL` en `wms_esp`.
2. Configura `VITE_NOTIFICATIONS_*` en `wms-frontend`.
3. Redeploy backend y frontend en Railway.

---

## Paso 5 — Verificación

```bash
# Notification-service (Render)
curl https://TU-URL.onrender.com/health
# {"status":"ok","service":"notification-service","redis":true,...}

# Monolito
curl https://wmsesp-production.up.railway.app/health
# {"notifications_mode":"remote",...}

# Inbox (con JWT)
curl -H "Authorization: Bearer TOKEN" \
  https://TU-URL.onrender.com/api/v1/notificaciones
```

Prueba funcional: despacho que deje stock crítico → toast WS + entrada en bandeja.

---

## Alternativa — Fly.io

```bash
cd E:/git/wms_esp
fly launch --no-deploy --config services/notification-service/fly.toml
fly secrets set DATABASE_URL="mysql://..." SECRET_KEY="..." REDIS_URL="rediss://..." CORS_ORIGINS="https://wms-frontend-production-296e.up.railway.app"
fly secrets set NOTIFICATIONS_MODE=local DEBUG=False
fly deploy --config services/notification-service/fly.toml
```

Ver `services/notification-service/fly.toml`.

---

## Rollback

```powershell
railway variable set NOTIFICATIONS_MODE=local --service wms_esp
railway variable delete REDIS_URL --service wms_esp
# Quitar VITE_NOTIFICATIONS_* del frontend y redeploy
```

El monolito vuelve a servir WS + inbox sin Redis.

---

## Troubleshooting

| Síntoma | Causa probable |
|---------|----------------|
| `/health` redis: false | `REDIS_URL` incorrecta o Upstash inactivo |
| 500 en inbox | `DATABASE_URL` apunta a `mysql.railway.internal` en vez del proxy público |
| 401 en notificaciones | `SECRET_KEY` distinta entre Render y Railway |
| WS no conecta | CORS, URL `wms-notifications` mal en frontend, o Render dormido |
| Eventos no llegan | `REDIS_URL` distinta entre `wms_esp` y Render, o `NOTIFICATIONS_MODE` no es `remote` |

---

## Referencias

- [services/notification-service/README.md](../services/notification-service/README.md)
- [docs/RAILWAY_WMS_ESP.md](RAILWAY_WMS_ESP.md)
- [render.yaml](../render.yaml)
