-- Railway Query: copiar y ejecutar SOLO el CREATE TABLE (sin comentarios).

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
