-- Clasificación de productos y presentaciones comerciales

CREATE TABLE IF NOT EXISTS tipo_producto (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  empresa_id BIGINT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresa(id),
  UNIQUE KEY uk_tipo_producto_empresa (nombre, empresa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE producto
  ADD COLUMN tipo_producto_id BIGINT NULL AFTER unidad_medida_id,
  ADD CONSTRAINT fk_producto_tipo_producto
    FOREIGN KEY (tipo_producto_id) REFERENCES tipo_producto(id);

CREATE TABLE IF NOT EXISTS producto_presentacion (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  producto_id BIGINT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  cantidad_contenida DECIMAL(18, 6) NOT NULL,
  unidad_medida_id BIGINT NOT NULL,
  precio_costo DECIMAL(12, 2) NULL,
  precio_venta DECIMAL(12, 2) NULL,
  permite_venta_unidad TINYINT(1) NOT NULL DEFAULT 1,
  permite_venta_presentacion TINYINT(1) NOT NULL DEFAULT 1,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES producto(id),
  FOREIGN KEY (unidad_medida_id) REFERENCES unidad_medida(id),
  UNIQUE KEY uk_presentacion_producto (producto_id, nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Permisos RBAC (empresa maestra id=1)
SET @empresa_id = 1;

INSERT IGNORE INTO permiso (empresa_id, codigo, descripcion, activo) VALUES
(@empresa_id, 'tipos_producto.leer',     'Ver tipos de producto', 1),
(@empresa_id, 'tipos_producto.crear',    'Crear tipos de producto', 1),
(@empresa_id, 'tipos_producto.editar',   'Editar tipos de producto', 1),
(@empresa_id, 'tipos_producto.eliminar', 'Eliminar tipos de producto', 1),
(@empresa_id, 'producto_presentacion.leer',     'Ver presentaciones de producto', 1),
(@empresa_id, 'producto_presentacion.crear',    'Crear presentaciones de producto', 1),
(@empresa_id, 'producto_presentacion.editar',   'Editar presentaciones de producto', 1),
(@empresa_id, 'producto_presentacion.eliminar', 'Eliminar presentaciones de producto', 1);
