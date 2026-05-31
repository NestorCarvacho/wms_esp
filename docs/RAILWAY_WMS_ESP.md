# Railway — proyecto WMS_ESP

Configuración as-code para los servicios del monorepo.

## Servicios

| Servicio | Config | Root directory (Dashboard) |
|----------|--------|--------------------------|
| `wms_esp` (API) | `/railway.toml` | `/` (raíz) |
| `wms-frontend` | `/frontend/railway.toml` | `frontend` |
| `MySQL` | — | — |

> En Settings de cada servicio, **Config file path**: ruta absoluta desde el repo (`/railway.toml` o `/frontend/railway.toml`).

## URLs (production)

- **API:** https://wmsesp-production.up.railway.app
- **Frontend:** https://wms-frontend-production-296e.up.railway.app
- **Health:** https://wmsesp-production.up.railway.app/health

## Variables configuradas

### wms_esp (backend)
- `DATABASE_URL` — MySQL (Railway)
- `DEBUG` — `False`
- `CORS_ORIGINS` — URL del frontend
- `SECRET_KEY` — **cambiar** en Railway si sigue siendo la de ejemplo

### wms-frontend
- `VITE_API_URL` — `https://wmsesp-production.up.railway.app`

## Comandos útiles

```bash
railway link -p WMS_ESP
railway service link wms_esp
railway logs --service wms_esp

railway service link wms-frontend
railway up ./frontend --path-as-root --detach
```

## Pendiente manual

1. **Frontend → GitHub:** en Railway, servicio `wms-frontend` → Settings → Connect Repo `NestorCarvacho/wms_esp`, Root Directory `frontend`.
2. **Push** los cambios locales (`railway.toml`, `frontend/railway.toml`, CORS, etc.) a `main` para que GitHub dispare el deploy.
3. **Deploy:** el plan free puede bloquear deploys en horario pico (8–20 h ET); reintentar después o usar `railway up`.
4. **MySQL:** ejecutar `mysql-init/*.sql` si la BD aún no tiene el esquema completo.
5. **SECRET_KEY:** generar una clave nueva en Variables del backend.
