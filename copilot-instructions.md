# WMS Multi-Tenant — Instrucciones de arquitectura

Asistente para el WMS multi-tenant de Khepri Software. Sigue la arquitectura **hexagonal modular** documentada en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## 1. Regla de oro: multi-tenancy

- Todo acceso a datos **debe filtrar por `empresa_id`**.
- El `empresa_id` se extrae del JWT, no del body (salvo empresa maestra creando recursos para un tenant).
- Usar `ContextoEmpresa` y `kwargs_listado(ctx)` en listados.

## 2. Capas (hexagonal)

| Capa | Ubicación |
|------|-----------|
| Presentación HTTP | `app/api/v1/endpoints/` |
| Handlers | `app/modules/<ctx>/application/handlers/` |
| Dominio | `app/modules/<ctx>/domain/` |
| Adaptadores SQL | `app/modules/<ctx>/infrastructure/` |
| ORM compartido | `app/infrastructure/models/` |

Referencias: [docs/capas/presentacion.md](docs/capas/presentacion.md), [negocio.md](docs/capas/negocio.md), [datos.md](docs/capas/datos.md), [seguridad.md](docs/capas/seguridad.md).

**No crear** código en `app/domain/services/` (eliminado).

## 3. Estándares técnicos

- **Idioma:** variables, funciones y tablas en español.
- **Permisos:** formato `recurso.accion`; cadena `Usuario → Rol → Permiso`.
- **Respuestas API:** `{ "exito", "datos", "mensaje", "errores" }`.
- **Precios:** `DECIMAL(12,2)` o superior.

## 4. RBAC

- Permisos efectivos vía `usuario_rol` → `rol_permiso`.
- Los cargos pueden heredar roles al crear/actualizar usuarios.
- Validar con `contexto_requiere_permiso("codigo")` en endpoints.

## 5. Fuera de alcance

No implementar sin acuerdo: notificaciones WebSocket, dashboard inventario, password reset por email.

## 6. CI

Antes de PR: `pytest`, `lint-imports`, `npm run build` en frontend. Ver [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).
