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
- [ ] Borrar fachadas delegadoras huérfanas en `app/domain/services/`
- [x] Utilidades puras en `app/shared/` (`formatting.py`)

## Sprint 4 — Dominio rico

- [x] Entidades de dominio geo (`Region`, `Ciudad`, `Comuna`)
- [x] Entidades catalog (`Producto`, `TipoProducto`, `UnidadMedida`) — ORM mapeado en adaptadores
- [ ] Entidades IAM (usuario/perfil)
- [ ] Absorber repos legacy restantes en adaptadores de módulo

## BBDD pendiente (opcional)

- [ ] Simplificar geo a solo `comuna_id`
- [ ] Triggers multi-tenant en junctions
- [ ] Unificar `empresa.activo` / `esta_activa`
