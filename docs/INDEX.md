# Índice de documentación — WMS Multi-Tenant (Khepri Software)

Mapa central de toda la documentación del proyecto **wms_esp**. Use este archivo como punto de entrada.

---

## Para usuarios finales

| Documento | Descripción |
|-----------|-------------|
| [**MANUAL_USUARIO.md**](./MANUAL_USUARIO.md) | Manual de uso de la aplicación web: login, menús, inventario, administración y regionalización |
| [**CORE_WMS.md**](./CORE_WMS.md) | Referencia técnica del módulo de inventario operativo (API + permisos) |

---

## Para desarrolladores e implementadores

| Documento | Descripción |
|-----------|-------------|
| [README.md](../README.md) | Instalación local, variables de entorno, estructura del monorepo |
| [ESTRUCTURA_PROYECTO.md](./ESTRUCTURA_PROYECTO.md) | Árbol de carpetas y archivos principales |
| [API_EXAMPLES.md](../API_EXAMPLES.md) | Ejemplos de llamadas a la API REST |
| [PLANTILLA_ENDPOINT.py](../PLANTILLA_ENDPOINT.py) | Plantilla para nuevos endpoints FastAPI |
| [copilot-instructions.md](../copilot-instructions.md) | Reglas de arquitectura para asistentes de código |

### Capas de la aplicación (`docs/capas/`)

| Archivo | Capa |
|---------|------|
| [presentacion.md](./capas/presentacion.md) | API REST, endpoints, DTOs |
| [negocio.md](./capas/negocio.md) | Servicios de dominio |
| [datos.md](./capas/datos.md) | Repositorios, modelos ORM |
| [seguridad.md](./capas/seguridad.md) | JWT, RBAC, multi-tenant |

### Frontend

| Recurso | Descripción |
|---------|-------------|
| [frontend/src/hooks/README.md](../frontend/src/hooks/README.md) | Convenciones de hooks React |
| [FRONTEND_SERUI_MIGRATION.md](./FRONTEND_SERUI_MIGRATION.md) | Notas de migración UI |

---

## Despliegue y base de datos

| Documento | Descripción |
|-----------|-------------|
| [DEPLOY_RAILWAY.md](./DEPLOY_RAILWAY.md) | Guía general de despliegue en Railway |
| [RAILWAY_WMS_ESP.md](./RAILWAY_WMS_ESP.md) | Configuración del proyecto WMS_ESP en producción |
| [mysql-init/README_RAILWAY.md](../mysql-init/README_RAILWAY.md) | Migraciones SQL en Railway |
| [mysql-init/railway_migration_steps.md](../mysql-init/railway_migration_steps.md) | Pasos manuales en consola Railway |
| [scripts/apply_railway_migrations.py](../scripts/apply_railway_migrations.py) | Script automatizado de migraciones |

### Migraciones SQL relevantes (orden)

| # | Archivo | Contenido |
|---|---------|-----------|
| 04–08 | RBAC, multiempresa, usuario_rol | Permisos, roles, empresa maestra |
| 12 | `12_inventario_operativo.sql` | Stock, movimientos, permisos `inventario.*` |
| 14 | `14_auth_security.sql` | Bloqueo por intentos, reset de contraseña |
| 18 | `18_serie_producto.sql` | Inventario serializado |
| 19 | `19_locale_currency.sql` | Locale, timezone, moneda por empresa |

---

## Módulos funcionales del sistema

| Módulo | Ruta en la app | Permiso típico | Backend |
|--------|----------------|----------------|---------|
| Panel principal | `/app` | — | — |
| Productos | `/app/productos` | `productos.leer` | `productos.py` |
| Consulta producto | `/app/productos/consulta` | `productos.leer` | `productos.py` |
| Tipos de producto | `/app/tipos-producto` | `tipos_producto.leer` | `tipo_producto.py` |
| Unidades de medida | `/app/unidades-medida` | `unidades_medida.leer` | `unidadesMedidas.py` |
| Bodegas | `/app/bodegas` | `bodegas.leer` | `bodegas.py` |
| Tipos de zona | `/app/tipos-zona` | `tipos_zona.leer` | `tipo_zona.py` |
| Zonas de bodega | `/app/zonas-bodega` | `zonas_bodega.leer` | `zona_bodega.py` |
| Inventario — dashboard | `/app/inventario/dashboard` | `inventario.leer` | `inventario.py` |
| Inventario — stock | `/app/inventario/stock` | `inventario.leer` | `inventario.py` |
| Inventario — movimientos | `/app/inventario/movimientos` | `inventario.leer` | `inventario.py` |
| Inventario — recepción | `/app/inventario/recepcion` | `inventario.recepcionar` | `inventario.py` |
| Inventario — traslado | `/app/inventario/traslado` | `inventario.trasladar` | `inventario.py` |
| Inventario — despacho | `/app/inventario/despacho` | `inventario.despachar` | `inventario.py` |
| Inventario — configuración | `/app/inventario/configuracion` | `inventario.configurar` | `inventario.py` |
| Usuarios | `/app/usuarios` | `usuarios.leer` | `usuarios.py` |
| Cargos | `/app/cargos` | `cargos.leer` | `cargos.py` |
| Roles | `/app/roles` | `roles.leer` | `roles.py` |
| Asignar permisos | `/app/asignar-permisos` | `roles.leer` | `rol_permiso.py` |
| Permisos | `/app/permisos` | `permisos.leer` | `permisos.py` |
| Empresas | `/app/empresas` | Super admin | `empresas.py` |
| Perfil | `/app/perfil` | Autenticado | `perfil_usuario.py` |

---

## URLs de producción (Railway)

| Servicio | URL |
|----------|-----|
| Aplicación web | https://wms-frontend-production-296e.up.railway.app |
| API REST | https://wmsesp-production.up.railway.app |
| Documentación API (Swagger) | https://wmsesp-production.up.railway.app/docs |
| Health check | https://wmsesp-production.up.railway.app/health |

---

## Diagramas y otros

| Archivo | Descripción |
|---------|-------------|
| [decision-tree-escaneo.bpmn](./decision-tree-escaneo.bpmn) | Diagrama BPMN del flujo de escaneo en operaciones |

---

## Índice rápido por rol

| Rol | Empiece por |
|-----|-------------|
| Operador de bodega | [MANUAL_USUARIO.md § Inventario operativo](./MANUAL_USUARIO.md#6-inventario-operativo) |
| Administrador de empresa | [MANUAL_USUARIO.md § Configuración inicial](./MANUAL_USUARIO.md#4-configuración-inicial-recomendada) |
| Super administrador (SaaS) | [MANUAL_USUARIO.md § Multi-empresa](./MANUAL_USUARIO.md#8-multi-empresa-empresa-maestra) |
| Desarrollador | [README.md](../README.md) → [capas/](./capas/) → [CORE_WMS.md](./CORE_WMS.md) |
| DevOps | [DEPLOY_RAILWAY.md](./DEPLOY_RAILWAY.md) → [README_RAILWAY.md](../mysql-init/README_RAILWAY.md) |
