# Notification Service (Fase 2)

Servicio FastAPI extraído del monolito. Expone:

- `GET /api/v1/notificaciones` — bandeja inbox (MySQL compartido)
- `WS /api/v1/ws/inventario` — eventos de stock en tiempo real
- Suscriptor Redis `wms:stock-events` — consume eventos del monolito

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | MySQL compartido con el monolito |
| `SECRET_KEY` | Misma clave JWT que el monolito |
| `REDIS_URL` | URL Redis (Railway plugin o local) |
| `CORS_ORIGINS` | Orígenes del frontend |
| `NOTIFICATIONS_MODE` | Debe ser `local` (default) en este servicio |

**No** usar `NOTIFICATIONS_MODE=remote` aquí — ese modo es solo para el monolito.

## Local (docker-compose)

```bash
docker compose up -d redis notification-service
```

Monolito con `NOTIFICATIONS_MODE=remote` y `REDIS_URL=redis://redis:6379/0`.

Frontend:

```
VITE_NOTIFICATIONS_API_URL=http://localhost:8010
VITE_NOTIFICATIONS_WS_URL=http://localhost:8010
```

## Railway

1. Crear servicio desde este repo con `dockerfilePath = services/notification-service/Dockerfile`
2. Añadir plugin Redis al proyecto
3. Variables: `DATABASE_URL`, `SECRET_KEY`, `REDIS_URL`, `CORS_ORIGINS` (URL del frontend)
4. Monolito: `NOTIFICATIONS_MODE=remote`, mismo `REDIS_URL` y `SECRET_KEY`
5. Frontend: `VITE_NOTIFICATIONS_API_URL` y `VITE_NOTIFICATIONS_WS_URL` apuntando al servicio

## Rollback

Monolito: `NOTIFICATIONS_MODE=local` — restaura WS + inbox en el API principal sin Redis.

## Despliegue externo (sin upgrade Railway)

**Upstash Redis + Render/Fly.io** — guía completa:

→ [docs/DEPLOY_NOTIFICATIONS_EXTERNAL.md](../../docs/DEPLOY_NOTIFICATIONS_EXTERNAL.md)

Archivos:

| Archivo | Uso |
|---------|-----|
| `/render.yaml` | Blueprint Render (Dashboard → New → Blueprint) |
| `fly.toml` | `fly deploy --config services/notification-service/fly.toml` |
| `scripts/cutover_notifications_external.ps1` | Cutover Railway tras desplegar en Render |
