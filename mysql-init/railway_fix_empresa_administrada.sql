-- Llenar tabla empresa_administrada (vacía = combos de empresa sin opciones)
-- Railway Query: ejecutar bloque por bloque.

-- === BLOQUE 1: ver empresas existentes ===
SELECT id, nombre, COALESCE(esta_activa, 1) AS esta_activa, COALESCE(activo, 1) AS activo
FROM empresa
ORDER BY id;

-- === BLOQUE 2: asegurar empresa 1 como maestra ===
UPDATE empresa SET es_empresa_maestra = 1 WHERE id = 1;

-- === BLOQUE 3: crear tabla si no existe ===
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

-- === BLOQUE 4: vincular TODAS las empresas activas a la maestra id=1 ===
INSERT IGNORE INTO empresa_administrada (empresa_maestra_id, empresa_administrada_id, activo)
SELECT 1, e.id, 1
FROM empresa e
WHERE COALESCE(e.esta_activa, 1) = 1
  AND COALESCE(e.activo, 1) = 1;

-- === BLOQUE 5: verificar (debe mostrar 1 fila por cada empresa) ===
SELECT ea.empresa_maestra_id, ea.empresa_administrada_id, e.nombre
FROM empresa_administrada ea
INNER JOIN empresa e ON e.id = ea.empresa_administrada_id
WHERE ea.empresa_maestra_id = 1 AND ea.activo = 1
ORDER BY e.nombre;
