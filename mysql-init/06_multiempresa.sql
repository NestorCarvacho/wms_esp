-- Multiempresa: empresa maestra y empresas administradas

ALTER TABLE empresa
  ADD COLUMN es_empresa_maestra TINYINT(1) NOT NULL DEFAULT 0 AFTER esta_activa;

UPDATE empresa SET es_empresa_maestra = 1 WHERE id = 1;

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

-- Vincular todas las empresas activas a la maestra id=1 (ajustar según despliegue)
INSERT IGNORE INTO empresa_administrada (empresa_maestra_id, empresa_administrada_id, activo)
SELECT 1, e.id, 1
FROM empresa e
WHERE e.activo = 1;
