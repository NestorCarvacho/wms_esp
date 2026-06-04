-- Stock por ubicación (zona) y movimientos operativos WMS

CREATE TABLE IF NOT EXISTS stock_zona (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  zona_bodega_id BIGINT NOT NULL,
  producto_id BIGINT NOT NULL,
  cantidad DECIMAL(18, 6) NOT NULL DEFAULT 0,
  actualizado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (zona_bodega_id) REFERENCES zona_bodega(id),
  FOREIGN KEY (producto_id) REFERENCES producto(id),
  UNIQUE KEY uk_stock_zona (zona_bodega_id, producto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS movimiento_inventario (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  empresa_id BIGINT NOT NULL,
  usuario_id BIGINT NOT NULL,
  tipo VARCHAR(30) NOT NULL,
  producto_id BIGINT NOT NULL,
  cantidad DECIMAL(18, 6) NOT NULL,
  presentacion_id BIGINT NULL,
  venta_por_presentacion TINYINT(1) NOT NULL DEFAULT 0,
  zona_origen_id BIGINT NULL,
  zona_destino_id BIGINT NULL,
  documento_tipo VARCHAR(50) NULL,
  documento_folio VARCHAR(100) NULL,
  observaciones TEXT NULL,
  creado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (empresa_id) REFERENCES empresa(id),
  FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  FOREIGN KEY (producto_id) REFERENCES producto(id),
  FOREIGN KEY (presentacion_id) REFERENCES producto_presentacion(id),
  FOREIGN KEY (zona_origen_id) REFERENCES zona_bodega(id),
  FOREIGN KEY (zona_destino_id) REFERENCES zona_bodega(id),
  INDEX idx_mov_inv_empresa_fecha (empresa_id, creado_at),
  INDEX idx_mov_inv_producto (producto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bodega_config (
  bodega_id BIGINT PRIMARY KEY,
  zona_recepcion_default_id BIGINT NULL,
  actualizado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bodega_id) REFERENCES bodega(id),
  FOREIGN KEY (zona_recepcion_default_id) REFERENCES zona_bodega(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Permisos inventario operativo (empresa 1)
INSERT IGNORE INTO permiso (empresa_id, codigo, descripcion, activo) VALUES
(1, 'inventario.leer', 'Ver stock y movimientos de inventario', 1),
(1, 'inventario.recepcionar', 'Registrar recepciones de mercancía', 1),
(1, 'inventario.trasladar', 'Trasladar stock entre ubicaciones', 1),
(1, 'inventario.despachar', 'Registrar despachos de mercancía', 1),
(1, 'inventario.configurar', 'Configurar zona de recepción por bodega', 1);

INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT r.id, p.id, 1
FROM rol r
JOIN permiso p ON p.empresa_id = r.empresa_id AND p.codigo LIKE 'inventario.%'
WHERE r.empresa_id = 1 AND r.nombre IN ('Administrador', 'Admin', 'Super Admin', 'Super administrador');
