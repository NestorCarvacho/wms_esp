-- Fix Railway: columna es_empresa_maestra + tabla empresa_administrada
-- IMPORTANTE: ejecutar cada bloque por separado en Railway Query (Run selection).

-- === BLOQUE 1 (primero; ignorar error si columna ya existe) ===
ALTER TABLE empresa ADD COLUMN es_empresa_maestra TINYINT(1) NOT NULL DEFAULT 0;

-- === BLOQUE 2 (solo si bloque 1 OK o "Duplicate column") ===
UPDATE empresa SET es_empresa_maestra = 1 WHERE id = 1;

-- === BLOQUE 3 ===
CREATE TABLE IF NOT EXISTS empresa_administrada (
  empresa_maestra_id BIGINT NOT NULL,
  empresa_administrada_id BIGINT NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (empresa_maestra_id, empresa_administrada_id),
  KEY idx_empresa_administrada_hija (empresa_administrada_id),
  CONSTRAINT fk_empresa_admin_maestra
    FOREIGN KEY (empresa_maestra_id) REFERENCES empresa(id),
  CONSTRAINT fk_empresa_admin_hija
    FOREIGN KEY (empresa_administrada_id) REFERENCES empresa(id)
);

-- === BLOQUE 4 ===
INSERT IGNORE INTO empresa_administrada (empresa_maestra_id, empresa_administrada_id, activo)
SELECT 1, e.id, 1
FROM empresa e
WHERE COALESCE(e.esta_activa, 1) = 1
  AND COALESCE(e.activo, 1) = 1;

-- === BLOQUE 5 (verificar) ===
SELECT id, nombre, es_empresa_maestra, esta_activa FROM empresa;
