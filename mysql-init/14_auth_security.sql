-- Seguridad de autenticación: bloqueo por intentos y tokens de recuperación.
-- Ejecutar en entornos existentes (Railway: una sentencia a la vez).

ALTER TABLE usuario ADD COLUMN intentos_fallidos INT NOT NULL DEFAULT 0;
ALTER TABLE usuario ADD COLUMN bloqueado_hasta DATETIME NULL;
ALTER TABLE usuario ADD COLUMN bloqueos_temporales INT NOT NULL DEFAULT 0;
ALTER TABLE usuario ADD COLUMN bloqueado_permanente TINYINT(1) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS password_reset_token (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT NOT NULL,
  token_hash VARCHAR(64) NOT NULL,
  expira_at DATETIME NOT NULL,
  usado_at DATETIME NULL,
  creado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_password_reset_token_hash (token_hash),
  INDEX idx_password_reset_usuario (usuario_id),
  CONSTRAINT fk_password_reset_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
