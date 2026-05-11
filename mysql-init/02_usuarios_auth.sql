-- ============================================
-- WMS MULTI-TENANT - TABLAS DE AUTENTICACIÓN
-- Script para inicializar tablas de usuarios y empresas
-- ============================================

USE wms_esp;

-- Crear tabla de empresas
CREATE TABLE IF NOT EXISTS empresas (
    empresa_id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    rut VARCHAR(20) UNIQUE NOT NULL,
    correo_contacto VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(500),
    ciudad VARCHAR(255),
    pais VARCHAR(100),
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_activa (activa),
    INDEX idx_rut (rut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    rut VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    ultimo_login DATETIME,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(empresa_id) ON DELETE CASCADE,
    INDEX idx_empresa_id (empresa_id),
    INDEX idx_correo (correo),
    INDEX idx_activo (activo),
    CONSTRAINT uc_usuario_empresa UNIQUE (empresa_id, correo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de cargos
CREATE TABLE IF NOT EXISTS cargos (
    cargo_id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(empresa_id) ON DELETE CASCADE,
    INDEX idx_empresa_id (empresa_id),
    CONSTRAINT uc_cargo_empresa UNIQUE (empresa_id, nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de permisos por cargo (N:N entre Cargos y Roles)
CREATE TABLE IF NOT EXISTS permisos_cargo (
    permiso_cargo_id INT PRIMARY KEY AUTO_INCREMENT,
    cargo_id INT NOT NULL,
    rol VARCHAR(100) NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cargo_id) REFERENCES cargos(cargo_id) ON DELETE CASCADE,
    INDEX idx_cargo_id (cargo_id),
    CONSTRAINT uc_cargo_rol UNIQUE (cargo_id, rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATOS INICIALES PARA TESTING
-- ============================================

-- Insertar empresa maestra (SaaS-CORE)
INSERT INTO empresas (empresa_id, nombre, rut, correo_contacto, telefono, activa)
VALUES (1, 'WMS CORE - Sistema Administrativo', '11.111.111-1', 'admin@wmscode.cl', '+56 9 1234 5678', TRUE)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Insertar empresa de prueba
INSERT INTO empresas (nombre, rut, correo_contacto, telefono, ciudad, pais, activa)
VALUES ('Empresa de Prueba Ltda.', '22.222.222-2', 'contacto@prueba.cl', '+56 9 2222 2222', 'Santiago', 'Chile', TRUE)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Insertar usuario de prueba para la empresa 1 (contraseña: Test1234)
-- Hash: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUuzP46m (bcrypt)
INSERT INTO usuarios (empresa_id, correo, contrasena, nombre, apellido, rut, activo)
VALUES (1, 'admin@wmscode.cl', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUuzP46m', 'Admin', 'Sistema', '11.111.111-1', TRUE)
ON DUPLICATE KEY UPDATE contrasena = VALUES(contrasena);

-- Insertar usuario de prueba para la empresa 2
INSERT INTO usuarios (empresa_id, correo, contrasena, nombre, apellido, rut, activo)
VALUES (2, 'usuario@prueba.cl', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUuzP46m', 'Juan', 'Pérez', '22.222.222-2', TRUE)
ON DUPLICATE KEY UPDATE contrasena = VALUES(contrasena);

-- Insertar cargos de prueba
INSERT INTO cargos (empresa_id, nombre, descripcion, activo)
VALUES 
    (1, 'Administrador', 'Acceso total al sistema', TRUE),
    (1, 'Operario de Bodega', 'Gestión de inventario y movimientos', TRUE),
    (2, 'Administrador', 'Acceso total al sistema', TRUE)
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- Insertar permisos de cargos
INSERT INTO permisos_cargo (cargo_id, rol)
SELECT c.cargo_id, 'admin'
FROM cargos c
WHERE c.nombre = 'Administrador'
ON DUPLICATE KEY UPDATE permiso_cargo_id = permiso_cargo_id;

INSERT INTO permisos_cargo (cargo_id, rol)
SELECT c.cargo_id, 'operario'
FROM cargos c
WHERE c.nombre = 'Operario de Bodega'
ON DUPLICATE KEY UPDATE permiso_cargo_id = permiso_cargo_id;

-- ============================================
-- CONFIRMACIÓN
-- ============================================
SELECT 'Tablas de autenticación creadas exitosamente' AS mensaje;
