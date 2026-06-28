-- Inventario serializado: rastreo individual de unidades por número de serie

-- === BLOQUE 1: flag serializado en producto ===
ALTER TABLE producto ADD COLUMN serializado TINYINT(1) NOT NULL DEFAULT 0;

-- === BLOQUE 2: tabla de series ===
CREATE TABLE IF NOT EXISTS serie_producto (
  id             BIGINT PRIMARY KEY AUTO_INCREMENT,
  empresa_id     BIGINT NOT NULL,
  producto_id    BIGINT NOT NULL,
  numero_serie   VARCHAR(100) NOT NULL,
  zona_bodega_id BIGINT NULL,
  estado         VARCHAR(30) NOT NULL DEFAULT 'EN_BODEGA',
  creado_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id)     REFERENCES empresa(id),
  FOREIGN KEY (producto_id)    REFERENCES producto(id),
  FOREIGN KEY (zona_bodega_id) REFERENCES zona_bodega(id),
  UNIQUE KEY uk_serie_empresa (empresa_id, numero_serie),
  INDEX idx_serie_producto     (producto_id),
  INDEX idx_serie_zona         (zona_bodega_id),
  INDEX idx_serie_estado       (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- === BLOQUE 3: serie_id en movimiento_inventario ===
ALTER TABLE movimiento_inventario
  ADD COLUMN serie_id BIGINT NULL,
  ADD CONSTRAINT fk_mov_inv_serie
    FOREIGN KEY (serie_id) REFERENCES serie_producto(id);
