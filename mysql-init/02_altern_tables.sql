SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS perfil_usuario;
DROP TABLE IF EXISTS usuario;

SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE usuario (
    id BIGINT NOT NULL AUTO_INCREMENT,
    empresa_id BIGINT NOT NULL,
    cargo_id BIGINT DEFAULT NULL,

    -- autenticación
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    -- estado sistema
    activo TINYINT(1) DEFAULT 1,
    ultimo_login DATETIME DEFAULT NULL,

    -- auditoría
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uk_email_empresa (email, empresa_id),

    KEY empresa_id (empresa_id),
    KEY cargo_id (cargo_id),

    CONSTRAINT usuarios_ibfk_1
        FOREIGN KEY (empresa_id) REFERENCES empresa(id),

    CONSTRAINT usuarios_ibfk_2
        FOREIGN KEY (cargo_id) REFERENCES cargo(id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE perfil_usuario (
    usuario_id BIGINT PRIMARY KEY,

    -- datos personales
    rut VARCHAR(20) UNIQUE,
    nombres VARCHAR(100),
    apellido_paterno VARCHAR(100),
    apellido_materno VARCHAR(100),

    fecha_nacimiento DATE,
    genero VARCHAR(20),

    telefono VARCHAR(30),

    -- ubicación
    direccion TEXT,
    comuna VARCHAR(100),
    ciudad VARCHAR(100),
    region VARCHAR(100),
    pais VARCHAR(100),

    -- extras
    foto_url VARCHAR(500),
    biografia TEXT,

    FOREIGN KEY (usuario_id)
        REFERENCES usuario(id)
        ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
