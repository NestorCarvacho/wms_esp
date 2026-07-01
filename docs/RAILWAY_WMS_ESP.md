# Railway — proyecto WMS_ESP

Configuración as-code para el monolito modular hexagonal (Fase 1).

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

Notificaciones (inbox + WebSocket) van en el **mismo API** — no hay servicio separado.

## Variables configuradas

### wms_esp (backend)

| Variable | Valor prod |
|----------|------------|
| `DATABASE_URL` | MySQL (Railway) |
| `DEBUG` | `False` |
| `CORS_ORIGINS` | `https://wms-frontend-production-296e.up.railway.app` |
| `SECRET_KEY` | clave JWT (cambiar si sigue siendo la de ejemplo) |

### wms-frontend

| Variable | Valor prod |
|----------|------------|
| `VITE_API_URL` | `https://wmsesp-production.up.railway.app` |

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
```

## Arquitectura objetivo (implementada)

Monolito hexagonal en Railway Free — ver ADR 001–006 y ADR 005 (módulo notifications in-process).

Extracción a microservicios (Fase 2/3) **diferida** por coste/límites del plan Free.
