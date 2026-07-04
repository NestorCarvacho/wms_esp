# Plan de normalización

Estado de avance del roadmap acordado.

## Sprint 1 — Quick wins

- [x] Eliminar pantallas dashboard (app + inventario)
- [x] Eliminar API `/inventario/dashboard`
- [x] Limpiar `schema_completo.sql` (sin notificacion, password_reset, inventario legacy)
- [x] Integrar locale/moneda en schema base
- [x] `UNIQUE (sku, empresa_id)` en producto
- [x] FKs geografía en `empresa`
- [x] Migración `23_schema_cleanup.sql`
- [x] CI: pytest + lint-imports + frontend build
- [x] `docs/ARCHITECTURE.md`

## Sprint 2 — Cerrar bounded contexts

- [x] Módulo `geo`: `geografia.py` → handlers + repositorio
- [x] IAM: `perfil_usuario.py` → handlers
- [x] Catalog: `producto_presentacion`, import/consulta producto
- [x] Adoptar `Result<T>` en login y cambiar-contrasena

## Sprint 3 — Eliminar fachadas

- [x] Todos los endpoints HTTP → handlers directos (catalog, IAM, tenant, warehouse, inventory)
- [x] `empresa_contexto.py` → `TenantHandlers.tenant`
- [x] Dependencias IAM/warehouse/tenant/inventory simplificadas
- [x] Borrar fachadas delegadoras huérfanas en `app/domain/services/`
- [x] Utilidades puras en `app/shared/` (`formatting.py`)

## Sprint 4 — Dominio rico

- [x] Entidades de dominio geo (`Region`, `Ciudad`, `Comuna`)
- [x] Entidades catalog (`Producto`, `TipoProducto`, `UnidadMedida`) — ORM mapeado en adaptadores
- [x] Entidades IAM (`Usuario`, `PerfilUsuario`, `UsuarioAuth`)
- [x] Adaptadores IAM: auth y perfil con SQL propio; CRUD usuario mapea a dominio
- [x] Puertos catalog tipados con entidades de dominio
- [x] Absorber repos legacy: warehouse, tenant, catalog CRUD, inventory (SQL en módulos)
- [x] Absorber repos legacy IAM RBAC (cargo, rol, permiso, usuario_rol, bootstrap, junctions)

## Documentación

- [x] README, CLAUDE, copilot-instructions, PLANTILLA_ENDPOINT
- [x] MANUAL_USUARIO, INDEX, ARCHITECTURE, ESTRUCTURA_PROYECTO, CORE_WMS
- [x] docs/capas/*, CONTRIBUTING, .github/README
- [x] ADR 001/003 actualizados post-normalización

## BBDD pendiente (opcional)

- [ ] Simplificar geo a solo `comuna_id`
- [ ] Triggers multi-tenant en junctions
- [ ] Unificar `empresa.activo` / `esta_activa`
