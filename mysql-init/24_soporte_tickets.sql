-- Centro de ayuda: tipos de solicitud, estados, tickets y chat con mesa de ayuda.
-- Idempotente. tickets.gestionar solo empresa maestra (no se copia a hijas).

CREATE TABLE IF NOT EXISTS estado_ticket (
  id          INT          NOT NULL AUTO_INCREMENT,
  codigo      VARCHAR(30)  NOT NULL,
  nombre      VARCHAR(80)  NOT NULL,
  es_abierto  TINYINT(1)   NOT NULL DEFAULT 1,
  orden_flujo INT          NOT NULL DEFAULT 0,
  activo      TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_estado_ticket_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tipo_solicitud (
  id             BIGINT       NOT NULL AUTO_INCREMENT,
  empresa_id     BIGINT       NOT NULL,
  tipo_padre_id  BIGINT       DEFAULT NULL,
  codigo         VARCHAR(50)  NOT NULL,
  nombre         VARCHAR(100) NOT NULL,
  orden          INT          NOT NULL DEFAULT 0,
  activo         TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tipo_solicitud_empresa_codigo (empresa_id, codigo),
  KEY idx_tipo_solicitud_padre (tipo_padre_id),
  CONSTRAINT fk_tipo_solicitud_empresa FOREIGN KEY (empresa_id) REFERENCES empresa (id),
  CONSTRAINT fk_tipo_solicitud_padre FOREIGN KEY (tipo_padre_id) REFERENCES tipo_solicitud (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ticket (
  id                   BIGINT       NOT NULL AUTO_INCREMENT,
  empresa_id           BIGINT       NOT NULL,
  usuario_id           BIGINT       NOT NULL,
  tipo_solicitud_id    BIGINT       NOT NULL,
  estado_ticket_id     INT          NOT NULL,
  asunto               VARCHAR(160) NOT NULL,
  asignado_usuario_id  BIGINT       DEFAULT NULL,
  nombre_solicitante   VARCHAR(255) NOT NULL,
  nombre_empresa       VARCHAR(255) NOT NULL,
  creado_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  cerrado_at           DATETIME     DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_ticket_empresa_estado_creado (empresa_id, estado_ticket_id, creado_at),
  KEY idx_ticket_usuario_creado (usuario_id, creado_at),
  CONSTRAINT fk_ticket_empresa FOREIGN KEY (empresa_id) REFERENCES empresa (id),
  CONSTRAINT fk_ticket_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id),
  CONSTRAINT fk_ticket_tipo FOREIGN KEY (tipo_solicitud_id) REFERENCES tipo_solicitud (id),
  CONSTRAINT fk_ticket_estado FOREIGN KEY (estado_ticket_id) REFERENCES estado_ticket (id),
  CONSTRAINT fk_ticket_asignado FOREIGN KEY (asignado_usuario_id) REFERENCES usuario (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ticket_mensaje (
  id         BIGINT   NOT NULL AUTO_INCREMENT,
  ticket_id  BIGINT   NOT NULL,
  usuario_id BIGINT   DEFAULT NULL,
  es_sistema TINYINT(1) NOT NULL DEFAULT 0,
  cuerpo     TEXT     NOT NULL,
  creado_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ticket_mensaje_ticket_creado (ticket_id, creado_at),
  CONSTRAINT fk_ticket_mensaje_ticket FOREIGN KEY (ticket_id) REFERENCES ticket (id),
  CONSTRAINT fk_ticket_mensaje_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO estado_ticket (codigo, nombre, es_abierto, orden_flujo, activo)
SELECT 'en_proceso', 'En proceso', 1, 1, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM estado_ticket WHERE codigo = 'en_proceso');

INSERT INTO estado_ticket (codigo, nombre, es_abierto, orden_flujo, activo)
SELECT 'cerrado', 'Cerrado', 0, 2, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM estado_ticket WHERE codigo = 'cerrado');

INSERT INTO tipo_solicitud (empresa_id, tipo_padre_id, codigo, nombre, orden, activo)
SELECT e.id, NULL, t.codigo, t.nombre, t.orden, 1
FROM empresa e
INNER JOIN (
  SELECT 'post_venta' AS codigo, 'Post-venta' AS nombre, 1 AS orden UNION ALL
  SELECT 'error', 'Error', 2 UNION ALL
  SELECT 'consulta', 'Consulta', 3 UNION ALL
  SELECT 'otro', 'Otro', 4
) t
WHERE e.es_empresa_maestra = 1
  AND NOT EXISTS (
    SELECT 1 FROM tipo_solicitud ts
    WHERE ts.empresa_id = e.id AND ts.codigo = t.codigo
  );

INSERT INTO tipo_solicitud (empresa_id, tipo_padre_id, codigo, nombre, orden, activo)
SELECT padre.empresa_id, padre.id, t.codigo, t.nombre, t.orden, 1
FROM tipo_solicitud padre
INNER JOIN (
  SELECT 'error_acceso' AS codigo, 'Acceso' AS nombre, 1 AS orden UNION ALL
  SELECT 'error_inventario', 'Inventario', 2 UNION ALL
  SELECT 'error_catalogo', 'Catálogo', 3 UNION ALL
  SELECT 'error_otro', 'Otro', 4
) t
WHERE padre.codigo = 'error'
  AND NOT EXISTS (
    SELECT 1 FROM tipo_solicitud ts
    WHERE ts.empresa_id = padre.empresa_id AND ts.codigo = t.codigo
  );

INSERT INTO permiso (empresa_id, codigo, descripcion, activo)
SELECT 1, codigo, descripcion, 1 FROM (
  SELECT 'tickets.crear' AS codigo, 'Crear tickets de ayuda' AS descripcion UNION ALL
  SELECT 'tickets.leer', 'Ver tickets de ayuda' UNION ALL
  SELECT 'tickets.responder', 'Responder en el chat de un ticket' UNION ALL
  SELECT 'tickets.gestionar', 'Gestionar la mesa de ayuda (empresa maestra)'
) t
WHERE NOT EXISTS (
  SELECT 1 FROM permiso p WHERE p.empresa_id = 1 AND p.codigo = t.codigo
);

INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT r.id, p.id, 1
FROM rol r
INNER JOIN permiso p ON p.empresa_id = r.empresa_id AND p.activo = 1
WHERE r.empresa_id = 1 AND r.nombre = 'Administrador'
  AND p.codigo IN ('tickets.crear', 'tickets.leer', 'tickets.responder', 'tickets.gestionar');

INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT r.id, p.id, 1
FROM rol r
INNER JOIN permiso p ON p.empresa_id = r.empresa_id AND p.activo = 1
WHERE r.empresa_id = 1
  AND r.nombre IN ('Recepción', 'Despacho', 'Consulta Inventario', 'Inventario Completo')
  AND p.codigo IN ('tickets.crear', 'tickets.leer', 'tickets.responder');

-- Hijas: solo códigos de usuario. tickets.gestionar no se copia.
INSERT INTO permiso (empresa_id, codigo, descripcion, activo)
SELECT e.id, p.codigo, p.descripcion, 1
FROM empresa e
INNER JOIN permiso p ON p.empresa_id = 1 AND p.activo = 1
LEFT JOIN permiso px ON px.empresa_id = e.id AND px.codigo = p.codigo
WHERE e.id <> 1
  AND COALESCE(e.esta_activa, 1) = 1
  AND p.codigo IN ('tickets.crear', 'tickets.leer', 'tickets.responder')
  AND px.id IS NULL;

INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT r.id, p.id, 1
FROM rol r
INNER JOIN permiso p ON p.empresa_id = r.empresa_id AND p.activo = 1
WHERE r.empresa_id <> 1
  AND r.activo = 1
  AND p.codigo IN ('tickets.crear', 'tickets.leer', 'tickets.responder');
