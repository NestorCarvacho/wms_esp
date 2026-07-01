-- Inbox de notificaciones por usuario
-- Railway: ejecutar bloque a bloque si hace falta.

-- === BLOQUE 1 ===
CREATE TABLE IF NOT EXISTS notificacion (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  empresa_id BIGINT NOT NULL,
  usuario_id BIGINT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NULL,
  payload_json JSON NULL,
  leida TINYINT(1) NOT NULL DEFAULT 0,
  creado_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  leida_at DATETIME NULL,
  FOREIGN KEY (empresa_id) REFERENCES empresa(id),
  FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  INDEX idx_notif_usuario_leida (usuario_id, leida, creado_at),
  INDEX idx_notif_empresa (empresa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- === BLOQUE 2 ===
INSERT INTO permiso (empresa_id, codigo, descripcion, activo)
SELECT 1, 'notificaciones.leer', 'Ver bandeja de notificaciones', 1
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM permiso WHERE empresa_id = 1 AND codigo = 'notificaciones.leer'
);
