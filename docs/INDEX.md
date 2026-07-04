# Índice de documentación — WMS ESP

Repositorio: [github.com/NestorCarvacho/wms_esp](https://github.com/NestorCarvacho/wms_esp)

## Para usuarios y administradores

| Documento | Descripción |
|-----------|-------------|
| [MANUAL_USUARIO.md](./MANUAL_USUARIO.md) | Manual completo: login, catálogo, inventario, RBAC, multi-empresa |
| [CORE_WMS.md](./CORE_WMS.md) | Inventario operativo: API, permisos, exportaciones |

## Para desarrolladores

| Documento | Descripción |
|-----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitectura hexagonal modular |
| [ESTRUCTURA_PROYECTO.md](./ESTRUCTURA_PROYECTO.md) | Árbol de carpetas y convenciones |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | CI, PRs, reglas de capas |
| [PLAN_NORMALIZACION.md](./PLAN_NORMALIZACION.md) | Refactor N-capas → hexagonal (completado) |
| [../CLAUDE.md](../CLAUDE.md) | Contexto para asistentes IA |
| [../copilot-instructions.md](../copilot-instructions.md) | Instrucciones GitHub Copilot |
| [../PLANTILLA_ENDPOINT.py](../PLANTILLA_ENDPOINT.py) | Plantilla de endpoint con handlers |

## Capas (referencia histórica adaptada)

| Documento | Tema |
|-----------|------|
| [capas/presentacion.md](./capas/presentacion.md) | Routers, DTOs, respuestas API |
| [capas/negocio.md](./capas/negocio.md) | Handlers y reglas de dominio |
| [capas/datos.md](./capas/datos.md) | Adaptadores SQL y multi-tenant |
| [capas/seguridad.md](./capas/seguridad.md) | JWT, RBAC, empresa maestra |

## Decisiones de arquitectura (ADR)

| ADR | Tema | Estado |
|-----|------|--------|
| [001](./adr/001-hexagonal-modules.md) | Módulos hexagonales | Aceptado — normalización completada |
| [002](./adr/002-iam-module.md) | Módulo IAM | Aceptado |
| [003](./adr/003-tenant-module.md) | Módulo tenant | Aceptado |
| [004](./adr/004-catalog-module.md) | Módulo catálogo | Aceptado |
| [006](./adr/006-warehouse-module.md) | Módulo almacén | Aceptado |

> Notificaciones en tiempo real y recuperación de contraseña por email quedaron **fuera de alcance** (Sprint 1).

## Módulos del sistema

| Módulo | Menú / API | Permisos clave |
|--------|------------|----------------|
| Catálogo | Productos, tipos, unidades, consulta | `productos.*`, `tipos_producto.*`, `unidades_medida.*` |
| Almacén | Bodegas, tipos de zona, zonas | `bodegas.*`, `tipos_zona.*`, `zonas_bodega.*` |
| Inventario | Stock, movimientos, recepción, traslado, despacho, config | `inventario.*` |
| IAM | Usuarios, cargos, roles, permisos | `usuarios.*`, `cargos.*`, `roles.*`, `permisos.*` |
| Tenant | Empresas (super admin) | `empresas.*` |
| Geo | Regiones, ciudades, comunas | (interno / formularios) |

## Rutas frontend (`/app/*`)

| Ruta | Pantalla |
|------|----------|
| `/app/productos` | Listado de productos |
| `/app/productos/consulta` | Consulta rápida |
| `/app/inventario/stock` | Stock por ubicación |
| `/app/inventario/movimientos` | Historial |
| `/app/inventario/recepcion` | Recepción |
| `/app/inventario/traslado` | Traslado |
| `/app/inventario/despacho` | Despacho |
| `/app/inventario/configuracion` | Zona de recepción |
| `/app/usuarios` | Usuarios |
| `/app/asignar-permisos` | Matriz rol–permiso |
| `/app/empresas` | Empresas (super admin) |

> `/app/inventario/dashboard` redirige a stock (dashboard eliminado del alcance).

## API en producción

- Swagger: https://wmsesp-production.up.railway.app/docs
- Health: https://wmsesp-production.up.railway.app/health

## Migraciones SQL relevantes

| Script | Contenido |
|--------|-----------|
| `mysql-init/01_setup.sql` | Esquema base |
| `mysql-init/12_inventario_operativo.sql` | Stock, movimientos, permisos inventario |
| `mysql-init/19_locale_currency.sql` | Regionalización por empresa |

## CI / GitHub

Workflow: `.github/workflows/ci.yml` — pytest, lint-imports, build frontend.

Guía de contribución: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

*Índice actualizado — junio 2026*
