-- Limpieza tablas/features eliminados del monolito (notificaciones, reset email, inventario legacy).
-- Idempotente: seguro re-ejecutar en Railway.

DROP TABLE IF EXISTS notificacion;
DROP TABLE IF EXISTS password_reset_token;
DROP TABLE IF EXISTS inventario;
DROP TABLE IF EXISTS movimiento_stock;

-- SKU único por tenant (si no existe ya)
SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'producto'
    AND INDEX_NAME = 'uk_producto_sku_empresa'
);
SET @sql := IF(
  @idx_exists = 0,
  'ALTER TABLE producto ADD UNIQUE KEY uk_producto_sku_empresa (sku, empresa_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
