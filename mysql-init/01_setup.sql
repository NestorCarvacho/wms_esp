-- ============================================
-- WMS MULTI-TENANT - CREACIÓN DE TABLAS
-- Soft Delete con campo activo
-- ============================================
-- SET FOREIGN_KEY_CHECKS=0;
-- DROP TABLE IF EXISTS log_auditoria;
-- DROP TABLE IF EXISTS movimiento_stock;
-- DROP TABLE IF EXISTS inventario;
-- DROP TABLE IF EXISTS orden_venta;
-- DROP TABLE IF EXISTS producto;
-- DROP TABLE IF EXISTS perfil_usuario;
-- DROP TABLE IF EXISTS usuario;
-- DROP TABLE IF EXISTS permiso_cargo;
-- DROP TABLE IF EXISTS cargo;
-- DROP TABLE IF EXISTS estado_orden;
-- DROP TABLE IF EXISTS estado_inventario;
-- DROP TABLE IF EXISTS unidad_medida;
-- DROP TABLE IF EXISTS tipo_zona;
-- DROP TABLE IF EXISTS zona_bodega;
-- DROP TABLE IF EXISTS bodega;
-- DROP TABLE IF EXISTS rol;
-- DROP TABLE IF EXISTS empresa;
-- SET FOREIGN_KEY_CHECKS=1;
-- ============================================
-- TABLAS
-- ============================================

CREATE TABLE empresa (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
codigo VARCHAR(50) UNIQUE NOT NULL,
nombre VARCHAR(255) NOT NULL,
rut VARCHAR(50),
esta_activa TINYINT(1) DEFAULT 1,
activo TINYINT(1) DEFAULT 1,
creado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE cargo (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
empresa_id BIGINT NOT NULL,
nombre VARCHAR(100) NOT NULL,
activo TINYINT(1) DEFAULT 1,
FOREIGN KEY (empresa_id) REFERENCES empresa(id),
UNIQUE KEY uk_cargo_empresa (nombre, empresa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE rol (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
empresa_id BIGINT NOT NULL,
nombre VARCHAR(50) NOT NULL,
descripcion VARCHAR(255),
activo TINYINT(1) DEFAULT 1,
creado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (empresa_id) REFERENCES empresa(id),
UNIQUE KEY uk_rol_empresa (nombre, empresa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE permiso (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
empresa_id BIGINT NOT NULL,
codigo VARCHAR(100) NOT NULL,
descripcion VARCHAR(255),
activo TINYINT(1) DEFAULT 1,
FOREIGN KEY (empresa_id) REFERENCES empresa(id),
UNIQUE KEY uk_permiso_empresa (codigo, empresa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE rol_permiso (
rol_id BIGINT NOT NULL,
permiso_id BIGINT NOT NULL,
activo TINYINT(1) DEFAULT 1,
PRIMARY KEY (rol_id, permiso_id),
FOREIGN KEY (rol_id) REFERENCES rol(id),
FOREIGN KEY (permiso_id) REFERENCES permiso(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- cargo_rol (tabla legacy: permisos_cargo)
CREATE TABLE permisos_cargo (
cargo_id BIGINT NOT NULL,
rol_id BIGINT NOT NULL,
activo TINYINT(1) DEFAULT 1,
PRIMARY KEY (cargo_id, rol_id),
FOREIGN KEY (cargo_id) REFERENCES cargo(id),
FOREIGN KEY (rol_id) REFERENCES rol(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE estado_inventario (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
empresa_id BIGINT NOT NULL,
nombre VARCHAR(50) NOT NULL,
descripcion VARCHAR(255),
permite_venta TINYINT(1) DEFAULT 1,
activo TINYINT(1) DEFAULT 1,
FOREIGN KEY (empresa_id) REFERENCES empresa(id),
UNIQUE KEY uk_estado_inv_empresa (nombre, empresa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE estado_orden (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
empresa_id BIGINT NOT NULL,
nombre VARCHAR(50) NOT NULL,
orden_flujo INT DEFAULT 0,
activo TINYINT(1) DEFAULT 1,
FOREIGN KEY (empresa_id) REFERENCES empresa(id),
UNIQUE KEY uk_estado_ord_empresa (nombre, empresa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE unidad_medida (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
empresa_id BIGINT NOT NULL,
codigo VARCHAR(10) NOT NULL,
nombre VARCHAR(50) NOT NULL,
activo TINYINT(1) DEFAULT 1,
FOREIGN KEY (empresa_id) REFERENCES empresa(id),
UNIQUE KEY uk_unidad_empresa (codigo, empresa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE tipo_zona (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
empresa_id BIGINT NOT NULL,
nombre VARCHAR(50) NOT NULL,
activo TINYINT(1) DEFAULT 1,
FOREIGN KEY (empresa_id) REFERENCES empresa(id),
UNIQUE KEY uk_tipozona_empresa (nombre, empresa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE usuario (
id bigint NOT NULL AUTO_INCREMENT,
empresa_id bigint NOT NULL,
cargo_id bigint DEFAULT NULL,
email varchar(255) NOT NULL,
password_hash varchar(255) NOT NULL,
no_Usar tinyint(1) DEFAULT '1',
nombre_completo varchar(255) DEFAULT '',
rut varchar(20) DEFAULT NULL,
esta_activo tinyint(1) DEFAULT '1',
activo TINYINT(1) DEFAULT 1,
ultimo_login datetime DEFAULT NULL,
fecha_creacion datetime DEFAULT CURRENT_TIMESTAMP,
fecha_actualizacion datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE
CURRENT_TIMESTAMP,
PRIMARY KEY (id),
UNIQUE KEY uk_email_empresa (email,empresa_id),
KEY empresa_id (empresa_id),
KEY cargo_id (cargo_id),
CONSTRAINT usuarios_ibfk_1 FOREIGN KEY (empresa_id) REFERENCES empresa(id),
CONSTRAINT usuarios_ibfk_2 FOREIGN KEY (cargo_id) REFERENCES cargo (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE perfil_usuario (
id BIGINT PRIMARY KEY,
rut VARCHAR(20) UNIQUE,
nombre_completo VARCHAR(255),
genero VARCHAR(20),
direccion TEXT,
activo TINYINT(1) DEFAULT 1,
FOREIGN KEY (id) REFERENCES usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE bodega (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
empresa_id BIGINT NOT NULL,
codigo VARCHAR(50) NOT NULL,
nombre VARCHAR(255) NOT NULL,
activo TINYINT(1) DEFAULT 1,
FOREIGN KEY (empresa_id) REFERENCES empresa(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE zona_bodega (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
bodega_id BIGINT NOT NULL,
tipo_zona_id BIGINT NOT NULL,
nombre VARCHAR(100),
activo TINYINT(1) DEFAULT 1,
FOREIGN KEY (bodega_id) REFERENCES bodega(id),
FOREIGN KEY (tipo_zona_id) REFERENCES tipo_zona(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE producto (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
empresa_id BIGINT NOT NULL,
sku VARCHAR(100) NOT NULL,
nombre VARCHAR(255) NOT NULL,
unidad_medida_id BIGINT NOT NULL,
precio_costo DECIMAL(12,2),
activo TINYINT(1) DEFAULT 1,
FOREIGN KEY (empresa_id) REFERENCES empresa(id),
FOREIGN KEY (unidad_medida_id) REFERENCES unidad_medida(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE inventario (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
bodega_id BIGINT NOT NULL,
producto_id BIGINT NOT NULL,
estado_id BIGINT NOT NULL,
cantidad INT NOT NULL DEFAULT 0,
cantidad_reservada INT DEFAULT 0,
ultimo_movimiento_por BIGINT,
activo TINYINT(1) DEFAULT 1,
actualizado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE
CURRENT_TIMESTAMP,
FOREIGN KEY (bodega_id) REFERENCES bodega(id),
FOREIGN KEY (producto_id) REFERENCES producto(id),
FOREIGN KEY (estado_id) REFERENCES estado_inventario(id),
FOREIGN KEY (ultimo_movimiento_por) REFERENCES usuario(id),
UNIQUE KEY uk_inventario_fina (bodega_id, producto_id, estado_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE movimiento_stock (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
empresa_id BIGINT NOT NULL,
usuario_id BIGINT DEFAULT NULL,
producto_id BIGINT NOT NULL,
cantidad INT NOT NULL,
bodega_origen_id BIGINT,
bodega_destino_id BIGINT,
estado_inv_anterior_id BIGINT,
estado_inv_nuevo_id BIGINT,
activo TINYINT(1) DEFAULT 1,
fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (empresa_id) REFERENCES empresa(id),
FOREIGN KEY (usuario_id) REFERENCES usuario(id),
FOREIGN KEY (producto_id) REFERENCES producto(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX idx_rol_empresa_id ON rol (empresa_id);
CREATE INDEX idx_rol_cargo_id ON rol (cargo_id);
CREATE INDEX idx_cargo_empresa_id ON cargo (empresa_id);
