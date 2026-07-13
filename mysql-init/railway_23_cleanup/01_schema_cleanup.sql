-- Railway Query: ejecutar UNA sentencia a la vez (Sprint 1 cleanup).

-- 01 — tablas legacy eliminadas del monolito
DROP TABLE IF EXISTS notificacion;

-- 02
DROP TABLE IF EXISTS password_reset_token;

-- 03
DROP TABLE IF EXISTS inventario;

-- 04
DROP TABLE IF EXISTS movimiento_stock;

-- 05 — SKU único por tenant (omitir si error "Duplicate key name")
ALTER TABLE producto ADD UNIQUE KEY uk_producto_sku_empresa (sku, empresa_id);
