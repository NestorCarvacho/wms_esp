-- =============================================================================
-- 16_empresa_campos.sql
-- Amplía la tabla empresa con campos legales y de contacto.
-- Renombra 'nombre' → 'razon_social' y agrega nuevas columnas.
-- =============================================================================

-- Renombrar 'nombre' a 'razon_social'
ALTER TABLE empresa
  CHANGE COLUMN nombre razon_social VARCHAR(255) NOT NULL;

-- Agregar nuevas columnas
ALTER TABLE empresa
  ADD COLUMN nombre_fantasia VARCHAR(255) NULL AFTER razon_social,
  ADD COLUMN giro            VARCHAR(255) NULL AFTER nombre_fantasia,
  ADD COLUMN telefono        VARCHAR(30)  NULL AFTER giro,
  ADD COLUMN correo          VARCHAR(255) NULL AFTER telefono,
  ADD COLUMN sitio_web       VARCHAR(255) NULL AFTER correo;
