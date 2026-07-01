-- =============================================================================
-- 19_locale_currency.sql
-- Localización regional por tenant: locale, timezone, moneda y tipos de cambio.
-- =============================================================================

ALTER TABLE empresa
  ADD COLUMN locale       VARCHAR(10)  NOT NULL DEFAULT 'es-CL' AFTER comuna_id,
  ADD COLUMN timezone     VARCHAR(64)  NOT NULL DEFAULT 'America/Santiago' AFTER locale,
  ADD COLUMN moneda_codigo CHAR(3)    NOT NULL DEFAULT 'CLP' AFTER timezone;

ALTER TABLE perfil_usuario
  ADD COLUMN locale_override   VARCHAR(10) NULL AFTER pais,
  ADD COLUMN timezone_override VARCHAR(64) NULL AFTER locale_override;

CREATE TABLE IF NOT EXISTS moneda (
  codigo   CHAR(3)      NOT NULL PRIMARY KEY,
  nombre   VARCHAR(100) NOT NULL,
  simbolo  VARCHAR(10)  NULL,
  decimales TINYINT     NOT NULL DEFAULT 2,
  activo   TINYINT(1)   NOT NULL DEFAULT 1
);

INSERT IGNORE INTO moneda (codigo, nombre, simbolo, decimales) VALUES
  ('CLP', 'Peso chileno',       '$',  0),
  ('MXN', 'Peso mexicano',      '$',  2),
  ('USD', 'Dólar estadounidense','$', 2),
  ('EUR', 'Euro',               '€',  2);

CREATE TABLE IF NOT EXISTS tipo_cambio_historico (
  id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  empresa_id      BIGINT       NOT NULL,
  moneda_origen   CHAR(3)      NOT NULL,
  moneda_destino  CHAR(3)      NOT NULL,
  tasa            DECIMAL(18,8) NOT NULL,
  vigente_desde   DATETIME     NOT NULL,
  vigente_hasta   DATETIME     NULL,
  documento_tipo  VARCHAR(50)  NULL COMMENT 'ORDEN_COMPRA, ORDEN_VENTA, etc.',
  documento_id    BIGINT       NULL,
  creado_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tc_empresa_vigencia (empresa_id, moneda_origen, moneda_destino, vigente_desde),
  CONSTRAINT fk_tc_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id)
);
