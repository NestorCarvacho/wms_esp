-- =============================================================================
-- WMS ESP — Schema completo v1.0
-- Instalación desde cero: crea todas las tablas e inserta datos base (RBAC).
--
-- ⚠  ATENCIÓN: este script ELIMINA y RECREA todas las tablas.
--    NO ejecutar sobre una BD con datos de producción sin respaldo previo.
--
-- Uso:
--   mysql -u root -p <password> wms_esp < schema_completo.sql
--
-- Tablas incluidas (24):
--   empresa, cargo, rol, permiso, rol_permiso, permisos_cargo,
--   estado_inventario, estado_orden, unidad_medida, tipo_zona, tipo_producto,
--   usuario, perfil_usuario, password_reset_token, usuario_rol,
--   bodega, zona_bodega, bodega_config, empresa_administrada,
--   producto, producto_presentacion,
--   inventario (legacy), movimiento_stock (legacy),
--   stock_zona, serie_producto, movimiento_inventario
--
-- Datos semilla: permisos, roles operativos (empresa_id = 1).
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================================
-- SECCIÓN 1 — DROP (orden inverso de dependencias)
-- =============================================================================

DROP TABLE IF EXISTS movimiento_inventario;
DROP TABLE IF EXISTS comuna;
DROP TABLE IF EXISTS ciudad;
DROP TABLE IF EXISTS region;
DROP TABLE IF EXISTS serie_producto;
DROP TABLE IF EXISTS stock_zona;
DROP TABLE IF EXISTS bodega_config;
DROP TABLE IF EXISTS inventario;
DROP TABLE IF EXISTS movimiento_stock;
DROP TABLE IF EXISTS producto_presentacion;
DROP TABLE IF EXISTS producto;
DROP TABLE IF EXISTS tipo_producto;
DROP TABLE IF EXISTS unidad_medida;
DROP TABLE IF EXISTS zona_bodega;
DROP TABLE IF EXISTS bodega;
DROP TABLE IF EXISTS tipo_zona;
DROP TABLE IF EXISTS empresa_administrada;
DROP TABLE IF EXISTS usuario_rol;
DROP TABLE IF EXISTS password_reset_token;
DROP TABLE IF EXISTS perfil_usuario;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS rol_permiso;
DROP TABLE IF EXISTS permisos_cargo;
DROP TABLE IF EXISTS permiso;
DROP TABLE IF EXISTS rol;
DROP TABLE IF EXISTS cargo;
DROP TABLE IF EXISTS estado_inventario;
DROP TABLE IF EXISTS estado_orden;
DROP TABLE IF EXISTS empresa;

-- =============================================================================
-- SECCIÓN 2 — CREATE (orden de dependencias)
-- =============================================================================

-- ----------------------------------------------------------------------------
-- region / ciudad / comuna  (geografía — tablas de referencia)
-- ----------------------------------------------------------------------------
CREATE TABLE region (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  codigo VARCHAR(5)   NOT NULL,
  activo TINYINT(1)   DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_region_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ciudad (
  id        INT          NOT NULL AUTO_INCREMENT,
  region_id INT          NOT NULL,
  nombre    VARCHAR(100) NOT NULL,
  activo    TINYINT(1)   DEFAULT 1,
  PRIMARY KEY (id),
  KEY region_id (region_id),
  CONSTRAINT ciudad_ibfk_1 FOREIGN KEY (region_id) REFERENCES region (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE comuna (
  id        INT          NOT NULL AUTO_INCREMENT,
  region_id INT          NOT NULL,
  ciudad_id INT          NOT NULL,
  nombre    VARCHAR(100) NOT NULL,
  activo    TINYINT(1)   DEFAULT 1,
  PRIMARY KEY (id),
  KEY region_id (region_id),
  KEY ciudad_id (ciudad_id),
  CONSTRAINT comuna_ibfk_1 FOREIGN KEY (region_id) REFERENCES region (id),
  CONSTRAINT comuna_ibfk_2 FOREIGN KEY (ciudad_id) REFERENCES ciudad (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- empresa
-- ----------------------------------------------------------------------------
CREATE TABLE empresa (
  id                 BIGINT       NOT NULL AUTO_INCREMENT,
  codigo             VARCHAR(50)  NOT NULL,
  razon_social       VARCHAR(255) NOT NULL,
  nombre_fantasia    VARCHAR(255) DEFAULT NULL,
  giro               VARCHAR(255) DEFAULT NULL,
  telefono           VARCHAR(30)  DEFAULT NULL,
  correo             VARCHAR(255) DEFAULT NULL,
  sitio_web          VARCHAR(255) DEFAULT NULL,
  rut                VARCHAR(50)  DEFAULT NULL,
  esta_activa        TINYINT(1)   DEFAULT 1,
  es_empresa_maestra TINYINT(1)   NOT NULL DEFAULT 0,
  activo             TINYINT(1)   DEFAULT 1,
  creado_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  direccion          VARCHAR(255) DEFAULT NULL,
  region_id          INT          DEFAULT NULL,
  ciudad_id          INT          DEFAULT NULL,
  comuna_id          INT          DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_empresa_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- cargo
-- ----------------------------------------------------------------------------
CREATE TABLE cargo (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT       NOT NULL,
  nombre     VARCHAR(100) NOT NULL,
  activo     TINYINT(1)   DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_cargo_empresa (nombre, empresa_id),
  KEY idx_cargo_empresa_id (empresa_id),
  CONSTRAINT cargo_ibfk_1 FOREIGN KEY (empresa_id) REFERENCES empresa (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- rol
-- ----------------------------------------------------------------------------
CREATE TABLE rol (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  empresa_id  BIGINT       NOT NULL,
  nombre      VARCHAR(50)  NOT NULL,
  descripcion VARCHAR(255) DEFAULT NULL,
  activo      TINYINT(1)   DEFAULT 1,
  creado_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_rol_empresa (nombre, empresa_id),
  KEY idx_rol_empresa_id (empresa_id),
  CONSTRAINT rol_ibfk_1 FOREIGN KEY (empresa_id) REFERENCES empresa (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- permiso
-- ----------------------------------------------------------------------------
CREATE TABLE permiso (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  empresa_id  BIGINT       NOT NULL,
  codigo      VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255) DEFAULT NULL,
  activo      TINYINT(1)   DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_permiso_empresa (codigo, empresa_id),
  KEY empresa_id (empresa_id),
  CONSTRAINT permiso_ibfk_1 FOREIGN KEY (empresa_id) REFERENCES empresa (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- rol_permiso
-- ----------------------------------------------------------------------------
CREATE TABLE rol_permiso (
  rol_id     BIGINT     NOT NULL,
  permiso_id BIGINT     NOT NULL,
  activo     TINYINT(1) DEFAULT 1,
  PRIMARY KEY (rol_id, permiso_id),
  KEY permiso_id (permiso_id),
  CONSTRAINT rol_permiso_ibfk_1 FOREIGN KEY (rol_id)     REFERENCES rol     (id),
  CONSTRAINT rol_permiso_ibfk_2 FOREIGN KEY (permiso_id) REFERENCES permiso (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- permisos_cargo  (cargo ↔ rol)
-- ----------------------------------------------------------------------------
CREATE TABLE permisos_cargo (
  cargo_id BIGINT     NOT NULL,
  rol_id   BIGINT     NOT NULL,
  activo   TINYINT(1) DEFAULT 1,
  PRIMARY KEY (cargo_id, rol_id),
  KEY rol_id (rol_id),
  CONSTRAINT permisos_cargo_ibfk_1 FOREIGN KEY (cargo_id) REFERENCES cargo (id),
  CONSTRAINT permisos_cargo_ibfk_2 FOREIGN KEY (rol_id)   REFERENCES rol   (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- estado_inventario
-- ----------------------------------------------------------------------------
CREATE TABLE estado_inventario (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  empresa_id  BIGINT       NOT NULL,
  nombre      VARCHAR(50)  NOT NULL,
  descripcion VARCHAR(255) DEFAULT NULL,
  permite_venta TINYINT(1) DEFAULT 1,
  activo      TINYINT(1)   DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_estado_inv_empresa (nombre, empresa_id),
  KEY empresa_id (empresa_id),
  CONSTRAINT estado_inventario_ibfk_1 FOREIGN KEY (empresa_id) REFERENCES empresa (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- estado_orden
-- ----------------------------------------------------------------------------
CREATE TABLE estado_orden (
  id          BIGINT      NOT NULL AUTO_INCREMENT,
  empresa_id  BIGINT      NOT NULL,
  nombre      VARCHAR(50) NOT NULL,
  orden_flujo INT         DEFAULT 0,
  activo      TINYINT(1)  DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_estado_ord_empresa (nombre, empresa_id),
  KEY empresa_id (empresa_id),
  CONSTRAINT estado_orden_ibfk_1 FOREIGN KEY (empresa_id) REFERENCES empresa (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- unidad_medida
-- ----------------------------------------------------------------------------
CREATE TABLE unidad_medida (
  id         BIGINT      NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT      NOT NULL,
  codigo     VARCHAR(10) NOT NULL,
  nombre     VARCHAR(50) NOT NULL,
  activo     TINYINT(1)  DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_unidad_empresa (codigo, empresa_id),
  KEY empresa_id (empresa_id),
  CONSTRAINT unidad_medida_ibfk_1 FOREIGN KEY (empresa_id) REFERENCES empresa (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- tipo_zona
-- ----------------------------------------------------------------------------
CREATE TABLE tipo_zona (
  id         BIGINT      NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT      NOT NULL,
  nombre     VARCHAR(50) NOT NULL,
  activo     TINYINT(1)  DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tipozona_empresa (nombre, empresa_id),
  KEY empresa_id (empresa_id),
  CONSTRAINT tipo_zona_ibfk_1 FOREIGN KEY (empresa_id) REFERENCES empresa (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- tipo_producto
-- ----------------------------------------------------------------------------
CREATE TABLE tipo_producto (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT       NOT NULL,
  nombre     VARCHAR(100) NOT NULL,
  activo     TINYINT(1)   NOT NULL DEFAULT 1,
  creado_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tipo_producto_empresa (nombre, empresa_id),
  KEY empresa_id (empresa_id),
  CONSTRAINT tipo_producto_ibfk_1 FOREIGN KEY (empresa_id) REFERENCES empresa (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- usuario
-- ----------------------------------------------------------------------------
CREATE TABLE usuario (
  id                   BIGINT       NOT NULL AUTO_INCREMENT,
  empresa_id           BIGINT       NOT NULL,
  cargo_id             BIGINT       DEFAULT NULL,
  email                VARCHAR(255) NOT NULL,
  password_hash        VARCHAR(255) NOT NULL,
  activo               TINYINT(1)   DEFAULT 1,
  ultimo_login         DATETIME     DEFAULT NULL,
  fecha_creacion       DATETIME     DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  intentos_fallidos    INT          NOT NULL DEFAULT 0,
  bloqueado_hasta      DATETIME     DEFAULT NULL,
  bloqueos_temporales  INT          NOT NULL DEFAULT 0,
  bloqueado_permanente TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_email_empresa (email, empresa_id),
  KEY empresa_id (empresa_id),
  KEY cargo_id (cargo_id),
  CONSTRAINT usuarios_ibfk_1 FOREIGN KEY (empresa_id) REFERENCES empresa (id),
  CONSTRAINT usuarios_ibfk_2 FOREIGN KEY (cargo_id)   REFERENCES cargo   (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- perfil_usuario
-- ----------------------------------------------------------------------------
CREATE TABLE perfil_usuario (
  usuario_id       BIGINT       NOT NULL,
  rut              VARCHAR(20)  DEFAULT NULL,
  nombres          VARCHAR(100) DEFAULT NULL,
  apellido_paterno VARCHAR(100) DEFAULT NULL,
  apellido_materno VARCHAR(100) DEFAULT NULL,
  fecha_nacimiento DATE         DEFAULT NULL,
  genero           VARCHAR(20)  DEFAULT NULL,
  telefono         VARCHAR(30)  DEFAULT NULL,
  direccion        VARCHAR(255) DEFAULT NULL,
  region_id        INT          DEFAULT NULL,
  ciudad_id        INT          DEFAULT NULL,
  comuna_id        INT          DEFAULT NULL,
  pais             VARCHAR(100) DEFAULT NULL,
  foto_url         VARCHAR(500) DEFAULT NULL,
  biografia        TEXT,
  PRIMARY KEY (usuario_id),
  UNIQUE KEY rut (rut),
  KEY fk_perfil_region (region_id),
  KEY fk_perfil_ciudad (ciudad_id),
  KEY fk_perfil_comuna (comuna_id),
  CONSTRAINT perfil_usuario_ibfk_1 FOREIGN KEY (usuario_id) REFERENCES usuario   (id) ON DELETE CASCADE,
  CONSTRAINT fk_perfil_region      FOREIGN KEY (region_id)  REFERENCES region     (id),
  CONSTRAINT fk_perfil_ciudad      FOREIGN KEY (ciudad_id)  REFERENCES ciudad     (id),
  CONSTRAINT fk_perfil_comuna      FOREIGN KEY (comuna_id)  REFERENCES comuna     (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- password_reset_token
-- ----------------------------------------------------------------------------
CREATE TABLE password_reset_token (
  id         BIGINT      NOT NULL AUTO_INCREMENT,
  usuario_id BIGINT      NOT NULL,
  token_hash VARCHAR(64) NOT NULL,
  expira_at  DATETIME    NOT NULL,
  usado_at   DATETIME    DEFAULT NULL,
  creado_at  DATETIME    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_password_reset_token_hash (token_hash),
  KEY idx_password_reset_usuario    (usuario_id),
  CONSTRAINT fk_password_reset_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- usuario_rol
-- ----------------------------------------------------------------------------
CREATE TABLE usuario_rol (
  usuario_id BIGINT     NOT NULL,
  rol_id     BIGINT     NOT NULL,
  activo     TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (usuario_id, rol_id),
  KEY rol_id (rol_id),
  CONSTRAINT usuario_rol_ibfk_1 FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE,
  CONSTRAINT usuario_rol_ibfk_2 FOREIGN KEY (rol_id)     REFERENCES rol     (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- bodega
-- ----------------------------------------------------------------------------
CREATE TABLE bodega (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT       NOT NULL,
  codigo     VARCHAR(50)  NOT NULL,
  nombre     VARCHAR(255) NOT NULL,
  activo     TINYINT(1)   DEFAULT 1,
  direccion  VARCHAR(255) DEFAULT NULL,
  region_id  INT          DEFAULT NULL,
  ciudad_id  INT          DEFAULT NULL,
  comuna_id  INT          DEFAULT NULL,
  PRIMARY KEY (id),
  KEY empresa_id       (empresa_id),
  KEY fk_bodega_region (region_id),
  KEY fk_bodega_ciudad (ciudad_id),
  KEY fk_bodega_comuna (comuna_id),
  CONSTRAINT bodega_ibfk_1     FOREIGN KEY (empresa_id) REFERENCES empresa (id),
  CONSTRAINT fk_bodega_region  FOREIGN KEY (region_id)  REFERENCES region  (id),
  CONSTRAINT fk_bodega_ciudad  FOREIGN KEY (ciudad_id)  REFERENCES ciudad  (id),
  CONSTRAINT fk_bodega_comuna  FOREIGN KEY (comuna_id)  REFERENCES comuna  (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- zona_bodega
-- ----------------------------------------------------------------------------
CREATE TABLE zona_bodega (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  bodega_id   BIGINT       NOT NULL,
  tipo_zona_id BIGINT      NOT NULL,
  nombre      VARCHAR(100) DEFAULT NULL,
  activo      TINYINT(1)   DEFAULT 1,
  PRIMARY KEY (id),
  KEY bodega_id    (bodega_id),
  KEY tipo_zona_id (tipo_zona_id),
  CONSTRAINT zona_bodega_ibfk_1 FOREIGN KEY (bodega_id)    REFERENCES bodega    (id),
  CONSTRAINT zona_bodega_ibfk_2 FOREIGN KEY (tipo_zona_id) REFERENCES tipo_zona (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- bodega_config
-- ----------------------------------------------------------------------------
CREATE TABLE bodega_config (
  bodega_id                BIGINT    NOT NULL,
  zona_recepcion_default_id BIGINT   DEFAULT NULL,
  actualizado_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (bodega_id),
  KEY zona_recepcion_default_id (zona_recepcion_default_id),
  CONSTRAINT bodega_config_ibfk_1 FOREIGN KEY (bodega_id)                 REFERENCES bodega      (id),
  CONSTRAINT bodega_config_ibfk_2 FOREIGN KEY (zona_recepcion_default_id) REFERENCES zona_bodega (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- empresa_administrada
-- ----------------------------------------------------------------------------
CREATE TABLE empresa_administrada (
  empresa_maestra_id     BIGINT     NOT NULL,
  empresa_administrada_id BIGINT    NOT NULL,
  activo                 TINYINT(1) NOT NULL DEFAULT 1,
  creado_at              DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (empresa_maestra_id, empresa_administrada_id),
  KEY idx_empresa_administrada_hija (empresa_administrada_id),
  CONSTRAINT fk_empresa_admin_maestra FOREIGN KEY (empresa_maestra_id)      REFERENCES empresa (id),
  CONSTRAINT fk_empresa_admin_hija    FOREIGN KEY (empresa_administrada_id) REFERENCES empresa (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- producto
-- ----------------------------------------------------------------------------
CREATE TABLE producto (
  id               BIGINT       NOT NULL AUTO_INCREMENT,
  empresa_id       BIGINT       NOT NULL,
  sku              VARCHAR(100) NOT NULL,
  nombre           VARCHAR(255) NOT NULL,
  unidad_medida_id BIGINT       NOT NULL,
  tipo_producto_id BIGINT       DEFAULT NULL,
  precio_costo     DECIMAL(12,2) DEFAULT NULL,
  stock_minimo     DECIMAL(18,6) DEFAULT NULL,
  activo           TINYINT(1)   DEFAULT 1,
  serializado      TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY empresa_id       (empresa_id),
  KEY unidad_medida_id (unidad_medida_id),
  KEY fk_producto_tipo_producto (tipo_producto_id),
  CONSTRAINT fk_producto_tipo_producto FOREIGN KEY (tipo_producto_id) REFERENCES tipo_producto (id),
  CONSTRAINT producto_ibfk_1           FOREIGN KEY (empresa_id)       REFERENCES empresa       (id),
  CONSTRAINT producto_ibfk_2           FOREIGN KEY (unidad_medida_id) REFERENCES unidad_medida (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- producto_presentacion
-- Cada presentación es un empaque del producto (unidad, caja, display, pallet).
-- codigo_barras: EAN/código escaneable del empaque.
-- cantidad_contenida: factor de conversión a unidades base (ej. caja x12 → 12).
-- ----------------------------------------------------------------------------
CREATE TABLE producto_presentacion (
  id                       BIGINT        NOT NULL AUTO_INCREMENT,
  producto_id              BIGINT        NOT NULL,
  nombre                   VARCHAR(255)  NOT NULL,
  codigo_barras            VARCHAR(100)  DEFAULT NULL,
  cantidad_contenida       DECIMAL(18,6) NOT NULL,
  unidad_medida_id         BIGINT        NOT NULL,
  precio_costo             DECIMAL(12,2) DEFAULT NULL,
  precio_venta             DECIMAL(12,2) DEFAULT NULL,
  permite_venta_unidad     TINYINT(1)    NOT NULL DEFAULT 1,
  permite_venta_presentacion TINYINT(1)  NOT NULL DEFAULT 1,
  activo                   TINYINT(1)    NOT NULL DEFAULT 1,
  creado_at                DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_presentacion_producto (producto_id, nombre),
  KEY unidad_medida_id (unidad_medida_id),
  KEY idx_presentacion_barcode (codigo_barras),
  CONSTRAINT producto_presentacion_ibfk_1 FOREIGN KEY (producto_id)      REFERENCES producto      (id),
  CONSTRAINT producto_presentacion_ibfk_2 FOREIGN KEY (unidad_medida_id) REFERENCES unidad_medida (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- inventario  (tabla legacy — no usada por el módulo operativo actual)
-- ----------------------------------------------------------------------------
CREATE TABLE inventario (
  id                   BIGINT    NOT NULL AUTO_INCREMENT,
  bodega_id            BIGINT    NOT NULL,
  producto_id          BIGINT    NOT NULL,
  estado_id            BIGINT    NOT NULL,
  cantidad             INT       NOT NULL DEFAULT 0,
  cantidad_reservada   INT       DEFAULT 0,
  ultimo_movimiento_por BIGINT   DEFAULT NULL,
  activo               TINYINT(1) DEFAULT 1,
  actualizado_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_inventario_fina (bodega_id, producto_id, estado_id),
  KEY producto_id          (producto_id),
  KEY estado_id            (estado_id),
  KEY ultimo_movimiento_por (ultimo_movimiento_por),
  CONSTRAINT inventario_ibfk_1 FOREIGN KEY (bodega_id)             REFERENCES bodega            (id),
  CONSTRAINT inventario_ibfk_2 FOREIGN KEY (producto_id)           REFERENCES producto          (id),
  CONSTRAINT inventario_ibfk_3 FOREIGN KEY (estado_id)             REFERENCES estado_inventario (id),
  CONSTRAINT inventario_ibfk_4 FOREIGN KEY (ultimo_movimiento_por) REFERENCES usuario           (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- movimiento_stock  (tabla legacy — no usada por el módulo operativo actual)
-- ----------------------------------------------------------------------------
CREATE TABLE movimiento_stock (
  id                    BIGINT    NOT NULL AUTO_INCREMENT,
  empresa_id            BIGINT    NOT NULL,
  usuario_id            BIGINT    DEFAULT NULL,
  producto_id           BIGINT    NOT NULL,
  cantidad              INT       NOT NULL,
  bodega_origen_id      BIGINT    DEFAULT NULL,
  bodega_destino_id     BIGINT    DEFAULT NULL,
  estado_inv_anterior_id BIGINT   DEFAULT NULL,
  estado_inv_nuevo_id   BIGINT    DEFAULT NULL,
  activo                TINYINT(1) DEFAULT 1,
  fecha                 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY empresa_id  (empresa_id),
  KEY usuario_id  (usuario_id),
  KEY producto_id (producto_id),
  CONSTRAINT movimiento_stock_ibfk_1 FOREIGN KEY (empresa_id)  REFERENCES empresa  (id),
  CONSTRAINT movimiento_stock_ibfk_2 FOREIGN KEY (usuario_id)  REFERENCES usuario  (id),
  CONSTRAINT movimiento_stock_ibfk_3 FOREIGN KEY (producto_id) REFERENCES producto (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- stock_zona  — stock operativo por producto y zona
-- ----------------------------------------------------------------------------
CREATE TABLE stock_zona (
  id            BIGINT        NOT NULL AUTO_INCREMENT,
  zona_bodega_id BIGINT       NOT NULL,
  producto_id   BIGINT        NOT NULL,
  cantidad      DECIMAL(18,6) NOT NULL DEFAULT 0,
  actualizado_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_stock_zona (zona_bodega_id, producto_id),
  KEY producto_id (producto_id),
  CONSTRAINT stock_zona_ibfk_1 FOREIGN KEY (zona_bodega_id) REFERENCES zona_bodega (id),
  CONSTRAINT stock_zona_ibfk_2 FOREIGN KEY (producto_id)    REFERENCES producto     (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- serie_producto  — inventario serializado: una fila por unidad física
-- estado: EN_BODEGA | DESPACHADO | BAJA
-- ----------------------------------------------------------------------------
CREATE TABLE serie_producto (
  id             BIGINT       NOT NULL AUTO_INCREMENT,
  empresa_id     BIGINT       NOT NULL,
  producto_id    BIGINT       NOT NULL,
  numero_serie   VARCHAR(100) NOT NULL,
  zona_bodega_id BIGINT       DEFAULT NULL,
  estado         VARCHAR(30)  NOT NULL DEFAULT 'EN_BODEGA',
  creado_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_serie_empresa  (empresa_id, numero_serie),
  KEY idx_serie_producto (producto_id),
  KEY idx_serie_zona     (zona_bodega_id),
  KEY idx_serie_estado   (estado),
  CONSTRAINT serie_producto_ibfk_1 FOREIGN KEY (empresa_id)     REFERENCES empresa     (id),
  CONSTRAINT serie_producto_ibfk_2 FOREIGN KEY (producto_id)    REFERENCES producto    (id),
  CONSTRAINT serie_producto_ibfk_3 FOREIGN KEY (zona_bodega_id) REFERENCES zona_bodega (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- movimiento_inventario  — historial operativo de recepciones, traslados y despachos
-- ----------------------------------------------------------------------------
CREATE TABLE movimiento_inventario (
  id                    BIGINT        NOT NULL AUTO_INCREMENT,
  empresa_id            BIGINT        NOT NULL,
  usuario_id            BIGINT        NOT NULL,
  tipo                  VARCHAR(30)   NOT NULL,
  producto_id           BIGINT        NOT NULL,
  cantidad              DECIMAL(18,6) NOT NULL,
  presentacion_id       BIGINT        DEFAULT NULL,
  venta_por_presentacion TINYINT(1)   NOT NULL DEFAULT 0,
  zona_origen_id        BIGINT        DEFAULT NULL,
  zona_destino_id       BIGINT        DEFAULT NULL,
  documento_tipo        VARCHAR(50)   DEFAULT NULL,
  documento_folio       VARCHAR(100)  DEFAULT NULL,
  observaciones         TEXT,
  creado_at             TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  activo                TINYINT(1)    NOT NULL DEFAULT 1,
  serie_id              BIGINT        DEFAULT NULL,
  PRIMARY KEY (id),
  KEY usuario_id      (usuario_id),
  KEY presentacion_id (presentacion_id),
  KEY zona_origen_id  (zona_origen_id),
  KEY zona_destino_id (zona_destino_id),
  KEY serie_id        (serie_id),
  KEY idx_mov_inv_empresa_fecha (empresa_id, creado_at),
  KEY idx_mov_inv_producto      (producto_id),
  CONSTRAINT movimiento_inventario_ibfk_1 FOREIGN KEY (empresa_id)       REFERENCES empresa              (id),
  CONSTRAINT movimiento_inventario_ibfk_2 FOREIGN KEY (usuario_id)       REFERENCES usuario              (id),
  CONSTRAINT movimiento_inventario_ibfk_3 FOREIGN KEY (producto_id)      REFERENCES producto             (id),
  CONSTRAINT movimiento_inventario_ibfk_4 FOREIGN KEY (presentacion_id)  REFERENCES producto_presentacion(id),
  CONSTRAINT movimiento_inventario_ibfk_5 FOREIGN KEY (zona_origen_id)   REFERENCES zona_bodega          (id),
  CONSTRAINT movimiento_inventario_ibfk_6 FOREIGN KEY (zona_destino_id)  REFERENCES zona_bodega          (id),
  CONSTRAINT fk_mov_inv_serie             FOREIGN KEY (serie_id)         REFERENCES serie_producto       (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- notificacion  — bandeja in-app por usuario
-- ----------------------------------------------------------------------------
CREATE TABLE notificacion (
  id           BIGINT       NOT NULL AUTO_INCREMENT,
  empresa_id   BIGINT       NOT NULL,
  usuario_id   BIGINT       NOT NULL,
  tipo         VARCHAR(50)  NOT NULL,
  titulo       VARCHAR(255) NOT NULL,
  mensaje      TEXT,
  payload_json JSON         DEFAULT NULL,
  leida        TINYINT(1)   NOT NULL DEFAULT 0,
  creado_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  leida_at     DATETIME     DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_notif_usuario_leida (usuario_id, leida, creado_at),
  KEY idx_notif_empresa (empresa_id),
  CONSTRAINT fk_notificacion_empresa FOREIGN KEY (empresa_id) REFERENCES empresa (id),
  CONSTRAINT fk_notificacion_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- SECCIÓN 3 — DATOS SEMILLA (RBAC empresa 1)
-- Estos datos son necesarios para que el sistema arranque correctamente.
-- Ajusta el email del superadmin antes de ejecutar.
-- =============================================================================

-- Empresa maestra base (ajusta codigo/nombre/rut según tu organización)
INSERT INTO empresa (id, codigo, razon_social, esta_activa, es_empresa_maestra, activo)
VALUES (1, 'EMP001', 'Empresa Principal', 1, 1, 1)
ON DUPLICATE KEY UPDATE es_empresa_maestra = 1, activo = 1;

-- Permisos completos para empresa 1
INSERT INTO permiso (empresa_id, codigo, descripcion, activo) VALUES
(1, 'usuarios.leer',                    'Ver usuarios', 1),
(1, 'usuarios.crear',                   'Crear usuarios', 1),
(1, 'usuarios.editar',                  'Editar usuarios', 1),
(1, 'usuarios.eliminar',                'Eliminar usuarios', 1),
(1, 'empresas.leer',                    'Ver empresas', 1),
(1, 'empresas.crear',                   'Crear empresas', 1),
(1, 'empresas.editar',                  'Editar empresas', 1),
(1, 'empresas.eliminar',                'Eliminar empresas', 1),
(1, 'cargos.leer',                      'Ver cargos', 1),
(1, 'cargos.crear',                     'Crear cargos', 1),
(1, 'cargos.editar',                    'Editar cargos', 1),
(1, 'cargos.eliminar',                  'Eliminar cargos', 1),
(1, 'roles.leer',                       'Ver roles', 1),
(1, 'roles.crear',                      'Crear roles', 1),
(1, 'roles.editar',                     'Editar roles', 1),
(1, 'roles.eliminar',                   'Eliminar roles', 1),
(1, 'permisos.leer',                    'Ver permisos', 1),
(1, 'permisos.crear',                   'Crear permisos', 1),
(1, 'permisos.editar',                  'Editar permisos', 1),
(1, 'permisos.eliminar',                'Eliminar permisos', 1),
(1, 'bodegas.leer',                     'Ver bodegas', 1),
(1, 'bodegas.crear',                    'Crear bodegas', 1),
(1, 'bodegas.editar',                   'Editar bodegas', 1),
(1, 'bodegas.eliminar',                 'Eliminar bodegas', 1),
(1, 'productos.leer',                   'Ver productos', 1),
(1, 'productos.crear',                  'Crear productos', 1),
(1, 'productos.editar',                 'Editar productos', 1),
(1, 'productos.eliminar',               'Eliminar productos', 1),
(1, 'productos.importar',               'Importar productos desde Excel', 1),
(1, 'unidades_medida.leer',             'Ver unidades de medida', 1),
(1, 'unidades_medida.crear',            'Crear unidades de medida', 1),
(1, 'unidades_medida.editar',           'Editar unidades de medida', 1),
(1, 'unidades_medida.eliminar',         'Eliminar unidades de medida', 1),
(1, 'tipos_zona.leer',                  'Ver tipos de zona', 1),
(1, 'tipos_zona.crear',                 'Crear tipos de zona', 1),
(1, 'tipos_zona.editar',                'Editar tipos de zona', 1),
(1, 'tipos_zona.eliminar',              'Eliminar tipos de zona', 1),
(1, 'zonas_bodega.leer',                'Ver zonas de bodega', 1),
(1, 'zonas_bodega.crear',               'Crear zonas de bodega', 1),
(1, 'zonas_bodega.editar',              'Editar zonas de bodega', 1),
(1, 'zonas_bodega.eliminar',            'Eliminar zonas de bodega', 1),
(1, 'tipos_producto.leer',              'Ver tipos de producto', 1),
(1, 'tipos_producto.crear',             'Crear tipos de producto', 1),
(1, 'tipos_producto.editar',            'Editar tipos de producto', 1),
(1, 'tipos_producto.eliminar',          'Eliminar tipos de producto', 1),
(1, 'producto_presentacion.leer',       'Ver presentaciones de producto', 1),
(1, 'producto_presentacion.crear',      'Crear presentaciones de producto', 1),
(1, 'producto_presentacion.editar',     'Editar presentaciones de producto', 1),
(1, 'producto_presentacion.eliminar',   'Eliminar presentaciones de producto', 1),
(1, 'notificaciones.leer',              'Ver bandeja de notificaciones', 1),
(1, 'inventario.leer',                  'Ver stock y movimientos de inventario', 1),
(1, 'inventario.recepcionar',           'Registrar recepciones de mercancía', 1),
(1, 'inventario.trasladar',             'Trasladar stock entre ubicaciones', 1),
(1, 'inventario.despachar',             'Registrar despachos de mercancía', 1),
(1, 'inventario.configurar',            'Configurar zona de recepción por bodega', 1)
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion), activo = 1;

-- Roles operativos (empresa 1)
INSERT INTO rol (empresa_id, nombre, descripcion, activo)
SELECT 1, nombre, descripcion, 1 FROM (
  SELECT 'Administrador'       AS nombre, 'Acceso completo al WMS'                AS descripcion UNION ALL
  SELECT 'Recepción',                     'Operaciones de recepción en bodega'                   UNION ALL
  SELECT 'Despacho',                      'Operaciones de despacho en bodega'                    UNION ALL
  SELECT 'Consulta Inventario',           'Solo lectura de catálogo e inventario'                UNION ALL
  SELECT 'Inventario Completo',           'Gestión completa de catálogo e inventario'
) t
WHERE NOT EXISTS (SELECT 1 FROM rol r WHERE r.empresa_id = 1 AND r.nombre = t.nombre);

-- Administrador → todos los permisos
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT r.id, p.id, 1
FROM rol r
INNER JOIN permiso p ON p.empresa_id = r.empresa_id AND p.activo = 1
WHERE r.empresa_id = 1 AND r.nombre = 'Administrador';

-- Recepción → permisos de recepción
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT r.id, p.id, 1
FROM rol r INNER JOIN permiso p ON p.empresa_id = r.empresa_id
WHERE r.empresa_id = 1 AND r.nombre = 'Recepción'
  AND p.codigo IN ('bodegas.leer','zonas_bodega.leer','tipos_zona.leer',
                   'productos.leer','inventario.leer','inventario.recepcionar','inventario.configurar');

-- Despacho → permisos de despacho
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT r.id, p.id, 1
FROM rol r INNER JOIN permiso p ON p.empresa_id = r.empresa_id
WHERE r.empresa_id = 1 AND r.nombre = 'Despacho'
  AND p.codigo IN ('bodegas.leer','zonas_bodega.leer','tipos_zona.leer',
                   'productos.leer','inventario.leer','inventario.despachar');

-- Consulta Inventario → solo lectura
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT r.id, p.id, 1
FROM rol r INNER JOIN permiso p ON p.empresa_id = r.empresa_id
WHERE r.empresa_id = 1 AND r.nombre = 'Consulta Inventario'
  AND p.codigo IN ('productos.leer','unidades_medida.leer','tipos_producto.leer',
                   'producto_presentacion.leer','bodegas.leer','tipos_zona.leer',
                   'zonas_bodega.leer','inventario.leer');

-- Inventario Completo → CRUD catálogo + inventario
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT r.id, p.id, 1
FROM rol r INNER JOIN permiso p ON p.empresa_id = r.empresa_id
WHERE r.empresa_id = 1 AND r.nombre = 'Inventario Completo'
  AND p.codigo IN (
    'productos.leer','productos.crear','productos.editar','productos.eliminar','productos.importar',
    'unidades_medida.leer','unidades_medida.crear','unidades_medida.editar','unidades_medida.eliminar',
    'tipos_producto.leer','tipos_producto.crear','tipos_producto.editar','tipos_producto.eliminar',
    'producto_presentacion.leer','producto_presentacion.crear','producto_presentacion.editar','producto_presentacion.eliminar',
    'bodegas.leer','bodegas.crear','bodegas.editar','bodegas.eliminar',
    'tipos_zona.leer','tipos_zona.crear','tipos_zona.editar','tipos_zona.eliminar',
    'zonas_bodega.leer','zonas_bodega.crear','zonas_bodega.editar','zonas_bodega.eliminar',
    'inventario.leer','inventario.recepcionar','inventario.trasladar','inventario.despachar','inventario.configurar'
  );

-- =============================================================================
-- SECCIÓN 4 — SCRIPT POST-INSTALACIÓN
-- Crea el primer usuario superadmin de la empresa maestra.
--
-- Contraseña por defecto: WmsAdmin1!
-- Hash bcrypt generado con app.core.security.hash_password("WmsAdmin1!")
--
-- ⚠  IMPORTANTE: cambia la contraseña al primer inicio de sesión.
--    Puedes regenerar el hash con:
--      python -c "from app.core.security import hash_password; print(hash_password('TuNuevaContrasena'))"
-- =============================================================================

-- Ajusta el email del superadmin antes de ejecutar:
SET @admin_email    = 'admin@emp001.cl';
SET @admin_password = '$2b$12$0/lqdpkIi7fAT2Hz/2raT.9EYEJpsLxyNc.SkP1obKA7pdmMh4p2O';

-- Crear usuario superadmin (idempotente)
INSERT INTO usuario (empresa_id, email, password_hash, activo)
SELECT 1, @admin_email, @admin_password, 1
WHERE NOT EXISTS (
    SELECT 1 FROM usuario WHERE empresa_id = 1 AND email = @admin_email
);

-- Asignar rol Administrador
INSERT IGNORE INTO usuario_rol (usuario_id, rol_id, activo)
SELECT u.id, r.id, 1
FROM usuario u
INNER JOIN rol r ON r.empresa_id = u.empresa_id AND r.nombre = 'Administrador' AND r.activo = 1
WHERE u.email = @admin_email AND u.empresa_id = 1;

-- Verificación (debe mostrar el usuario y sus permisos)
SELECT
    u.email,
    e.razon_social AS empresa,
    r.nombre AS rol,
    COUNT(DISTINCT p.codigo) AS permisos_efectivos
FROM usuario u
INNER JOIN empresa e ON e.id = u.empresa_id
INNER JOIN usuario_rol ur ON ur.usuario_id = u.id AND ur.activo = 1
INNER JOIN rol r ON r.id = ur.rol_id AND r.activo = 1
INNER JOIN rol_permiso rp ON rp.rol_id = r.id AND rp.activo = 1
INNER JOIN permiso p ON p.id = rp.permiso_id AND p.activo = 1
WHERE u.email = @admin_email
GROUP BY u.email, e.razon_social, r.nombre;

-- =============================================================================
-- NOTAS PARA EMPRESAS ADICIONALES
-- Las empresas nuevas creadas desde la API reciben automáticamente:
--   • Catálogo RBAC copiado desde empresa 1
--   • Usuario admin@{codigo_empresa} con contraseña WmsAdmin1! (temporal)
-- No es necesario ejecutar pasos manuales adicionales.
-- =============================================================================
