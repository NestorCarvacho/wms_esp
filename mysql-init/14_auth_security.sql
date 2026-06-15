-- NO pegar este archivo en Railway Query (falla con SET/PREPARE o multiples sentencias).
-- Railway: ejecute UNO POR UNO los archivos en mysql-init/railway_14_auth/
-- Script:  railway run python scripts/apply_railway_migrations.py --file 14_auth_security.sql

-- intentos_fallidos
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuario' AND COLUMN_NAME = 'intentos_fallidos'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE usuario ADD COLUMN intentos_fallidos INT NOT NULL DEFAULT 0',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- bloqueado_hasta
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuario' AND COLUMN_NAME = 'bloqueado_hasta'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE usuario ADD COLUMN bloqueado_hasta DATETIME NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- bloqueos_temporales
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuario' AND COLUMN_NAME = 'bloqueos_temporales'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE usuario ADD COLUMN bloqueos_temporales INT NOT NULL DEFAULT 0',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- bloqueado_permanente
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuario' AND COLUMN_NAME = 'bloqueado_permanente'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE usuario ADD COLUMN bloqueado_permanente TINYINT(1) NOT NULL DEFAULT 0',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS password_reset_token (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT NOT NULL,
  token_hash VARCHAR(64) NOT NULL,
  expira_at DATETIME NOT NULL,
  usado_at DATETIME NULL,
  creado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_password_reset_token_hash (token_hash),
  INDEX idx_password_reset_usuario (usuario_id),
  CONSTRAINT fk_password_reset_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
