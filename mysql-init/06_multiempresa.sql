-- Multiempresa: empresa maestra y empresas administradas
-- Railway Query: ejecutar UNA sentencia a la vez, en orden (no pegar todo junto).

-- 1) Crear columna (obligatorio primero)
ALTER TABLE empresa ADD COLUMN es_empresa_maestra TINYINT(1) NOT NULL DEFAULT 0;

-- 2) Marcar empresa 1 como maestra (solo despues del paso 1)
UPDATE empresa SET es_empresa_maestra = 1 WHERE id = 1;

-- 3) Tabla de vinculo maestra ↔ hijas
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

-- 4) Vincular empresas activas a la maestra id=1
INSERT IGNORE INTO empresa_administrada (empresa_maestra_id, empresa_administrada_id, activo)
SELECT 1, e.id, 1
FROM empresa e
WHERE COALESCE(e.esta_activa, 1) = 1
  AND COALESCE(e.activo, 1) = 1;

-- 5) Verificar (solo consola Railway; el script Python omite SELECT)
-- SELECT id, razon_social, es_empresa_maestra FROM empresa;
