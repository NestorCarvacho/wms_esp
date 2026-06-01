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
- `CORS_ORIGINS` — `https://wms-frontend-production-296e.up.railway.app`
- `SECRET_KEY` — **cambiar** en Railway si sigue siendo la de ejemplo

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
4. **MySQL:** ejecutar scripts si faltan tablas RBAC:
   ```bash
   # En consola MySQL de Railway (Query) o con cliente mysql:
   mysql ... < mysql-init/04_rbac_missing_tables.sql
   mysql ... < mysql-init/05_rbac_seed_empresa_1.sql
   # Migración completa (BD antigua): mysql-init/03_rbac_hierarchy.sql
   ```
5. **SECRET_KEY:** generar una clave nueva en Variables del backend.
