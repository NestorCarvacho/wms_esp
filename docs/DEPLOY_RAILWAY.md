# Despliegue en Railway (frontend + backend separados)

Este proyecto es un **monorepo** con dos servicios independientes:

| Servicio   | Carpeta raíz | Stack              |
|-----------|--------------|--------------------|
| Backend   | `/` (raíz)   | FastAPI + MySQL    |
| Frontend  | `/frontend`  | Vite + React (SPA) |

## Arquitectura

```
┌─────────────────────┐         HTTPS          ┌─────────────────────┐
│  Frontend (Railway) │  ──── VITE_API_URL ──► │  Backend (Railway)  │
│  serve dist/        │      fetch /api/v1     │  uvicorn FastAPI    │
└─────────────────────┘                        └──────────┬──────────┘
                                                          │
                                                          ▼
                                               ┌─────────────────────┐
                                               │  MySQL (Railway)    │
                                               └─────────────────────┘
```

## 1. Crear proyecto en Railway

1. Entra en [railway.com](https://railway.com/) y crea un **New Project**.
2. Conecta el repositorio de GitHub/GitLab.

## 2. Base de datos MySQL

1. En el proyecto, **Add Service → Database → MySQL**.
2. Railway crea la variable `DATABASE_URL` (formato `mysql://...`). El backend la convierte automáticamente a `mysql+aiomysql://`.
3. Ejecuta los scripts de inicialización (consola MySQL de Railway o cliente local):

   ```bash
   mysql -h HOST -P PORT -u USER -p < mysql-init/01_setup.sql
   mysql -h HOST -P PORT -u USER -p < mysql-init/02_altern_tables.sql
   mysql -h HOST -P PORT -u USER -p < mysql-init/03_rbac_hierarchy.sql
   ```


## 3. Servicio Backend (API)

1. **Add Service → GitHub Repo** (mismo repo).
2. **Settings → Root Directory**: dejar vacío o `.` (raíz del repo).
3. Railway detecta `railpack.json` y ejecuta:

   ```bash
   pip install -r requirements.txt
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

4. **Variables de entorno** (Settings → Variables):

   | Variable       | Valor |
   |----------------|-------|
   | `DATABASE_URL` | Referencia al plugin MySQL (`${{MySQL.DATABASE_URL}}`) |
   | `SECRET_KEY`   | Clave aleatoria larga (producción) |
   | `DEBUG`        | `False` |
   | `CORS_ORIGINS` | URL del frontend (ver paso 4), ej. `https://wms-frontend.up.railway.app` |

5. **Networking → Generate Domain** para obtener la URL pública del API, ej. `https://wms-api.up.railway.app`.
6. Verifica: `GET https://wms-api.up.railway.app/health`

### Alternativa: Docker

Si prefieres Docker en lugar de Railpack, usa el `dockerfile` de la raíz. Railway respeta la variable `PORT`.

## 4. Servicio Frontend (SPA)

1. **Add Service → GitHub Repo** (mismo repo, segundo servicio).
2. **Settings → Root Directory**: `frontend`
3. Railway detecta `frontend/railpack.json`:

   ```bash
   npm ci
   npm run build
   npm run start   # serve -s dist
   ```

4. **Variables de entorno** (importante: se usan en **build**):

   | Variable        | Valor |
   |-----------------|-------|
   | `VITE_API_URL`  | URL pública del backend, **sin** barra final, ej. `https://wms-api.up.railway.app` |

5. **Generate Domain** para el frontend.
6. Vuelve al backend y actualiza `CORS_ORIGINS` con la URL del frontend. Redeploy del backend si cambias CORS.

## 5. Orden recomendado de despliegue

1. MySQL + migraciones SQL
2. Backend → obtener URL pública
3. Frontend con `VITE_API_URL` apuntando al backend
4. Backend: `CORS_ORIGINS` = URL del frontend

## 6. Desarrollo local (sin cambios)

```bash
# Backend
cp .env.example .env
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (otra terminal)
cd frontend
cp .env.example .env   # VITE_API_URL vacío → proxy Vite
npm run dev
```

## 7. Solución de problemas

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| CORS en navegador (sin header ACAO) | Backend responde **502** (caído o puerto mal configurado) | Ver fila siguiente; no es solo CORS |
| CORS en navegador | `CORS_ORIGINS` no incluye el dominio del frontend | Añadir URL exacta: `https://wms-frontend-production-296e.up.railway.app` |
| 502 en backend | Puerto del dominio ≠ puerto de la app | Servicio `wms_esp` → **Settings → Networking** → puerto **8080** (ver logs: `Uvicorn running on ...:8080`) |
| API llama a localhost | `VITE_API_URL` no se definió antes del build | Redeploy frontend con la variable |
| 502 en backend | BD no accesible o app no arranca | Revisar logs (`python-multipart`, MySQL dormido, etc.) |
| Rutas React 404 al refrescar | Falta fallback SPA | `serve -s` ya lo incluye en `npm run start` |

## 8. Dos repositorios (opcional)

Si más adelante quieres repos separados:

- Repo **wms-api**: raíz actual sin carpeta `frontend/`
- Repo **wms-web**: solo `frontend/`

La configuración de variables y CORS es la misma; solo cambia conectar cada repo a su servicio Railway.
