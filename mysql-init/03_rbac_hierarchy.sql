-- Migración: jerarquía Usuario → Cargo → Cargo_Rol → Rol → Rol_Permiso → Permiso
-- Ejecutar una vez sobre BD existente (ajustar si algún paso ya fue aplicado).

-- 1) Usuario solo tiene cargo_id (sin rol_id directo)
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuario' AND COLUMN_NAME = 'rol_id'
);
SET @sql = IF(@col_exists > 0,
  'ALTER TABLE usuario DROP FOREIGN KEY fk_usuario_rol',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(@col_exists > 0,
  'ALTER TABLE usuario DROP COLUMN rol_id',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2) Rol independiente del cargo
ALTER TABLE rol DROP FOREIGN KEY rol_ibfk_2;
ALTER TABLE rol DROP INDEX uk_rol_cargo_empresa;
ALTER TABLE rol DROP COLUMN cargo_id;
ALTER TABLE rol ADD UNIQUE KEY uk_rol_empresa (nombre, empresa_id);

-- 3) Catálogo de permisos
CREATE TABLE IF NOT EXISTS permiso (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  empresa_id BIGINT NOT NULL,
  codigo VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  activo TINYINT(1) DEFAULT 1,
  FOREIGN KEY (empresa_id) REFERENCES empresa(id),
  UNIQUE KEY uk_permiso_empresa (codigo, empresa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4) Relación rol ↔ permiso
CREATE TABLE IF NOT EXISTS rol_permiso (
  rol_id BIGINT NOT NULL,
  permiso_id BIGINT NOT NULL,
  activo TINYINT(1) DEFAULT 1,
  PRIMARY KEY (rol_id, permiso_id),
  FOREIGN KEY (rol_id) REFERENCES rol(id),
  FOREIGN KEY (permiso_id) REFERENCES permiso(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- permisos_cargo = cargo_rol (sin cambios de estructura)
