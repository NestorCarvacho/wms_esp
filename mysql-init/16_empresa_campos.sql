-- =============================================================================
-- 16_empresa_campos.sql
-- Amplía empresa: razon_social + campos de contacto (idempotente).
-- =============================================================================

SET @has_nombre := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'empresa' AND COLUMN_NAME = 'nombre'
);
SET @sql := IF(
  @has_nombre > 0,
  'ALTER TABLE empresa CHANGE COLUMN nombre razon_social VARCHAR(255) NOT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'empresa' AND COLUMN_NAME = 'nombre_fantasia'
);
SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE empresa
     ADD COLUMN nombre_fantasia VARCHAR(255) NULL AFTER razon_social,
     ADD COLUMN giro VARCHAR(255) NULL AFTER nombre_fantasia,
     ADD COLUMN telefono VARCHAR(30) NULL AFTER giro,
     ADD COLUMN correo VARCHAR(255) NULL AFTER telefono,
     ADD COLUMN sitio_web VARCHAR(255) NULL AFTER correo',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
