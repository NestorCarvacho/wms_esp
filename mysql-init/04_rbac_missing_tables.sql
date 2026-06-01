-- Crear tablas RBAC faltantes (seguro para BD ya en producción).
-- Ejecutar si aparece: Table 'railway.permiso' doesn't exist

CREATE TABLE IF NOT EXISTS permiso (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  empresa_id BIGINT NOT NULL,
  codigo VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  activo TINYINT(1) DEFAULT 1,
  FOREIGN KEY (empresa_id) REFERENCES empresa(id),
  UNIQUE KEY uk_permiso_empresa (codigo, empresa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS rol_permiso (
  rol_id BIGINT NOT NULL,
  permiso_id BIGINT NOT NULL,
  activo TINYINT(1) DEFAULT 1,
  PRIMARY KEY (rol_id, permiso_id),
  FOREIGN KEY (rol_id) REFERENCES rol(id),
  FOREIGN KEY (permiso_id) REFERENCES permiso(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Asegurar tabla permisos_cargo (cargo ↔ rol)
CREATE TABLE IF NOT EXISTS permisos_cargo (
  cargo_id BIGINT NOT NULL,
  rol_id BIGINT NOT NULL,
  activo TINYINT(1) DEFAULT 1,
  PRIMARY KEY (cargo_id, rol_id),
  FOREIGN KEY (cargo_id) REFERENCES cargo(id),
  FOREIGN KEY (rol_id) REFERENCES rol(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
