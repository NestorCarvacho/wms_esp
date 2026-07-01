-- Railway Query: ejecutar UNA sentencia a la vez, en orden (01 → 06).

-- 01
ALTER TABLE empresa ADD COLUMN locale VARCHAR(10) NOT NULL DEFAULT 'es-CL' AFTER comuna_id;

-- 02
ALTER TABLE empresa ADD COLUMN timezone VARCHAR(64) NOT NULL DEFAULT 'America/Santiago' AFTER locale;

-- 03
ALTER TABLE empresa ADD COLUMN moneda_codigo CHAR(3) NOT NULL DEFAULT 'CLP' AFTER timezone;

-- 04
ALTER TABLE perfil_usuario ADD COLUMN locale_override VARCHAR(10) NULL AFTER pais;

-- 05
ALTER TABLE perfil_usuario ADD COLUMN timezone_override VARCHAR(64) NULL AFTER locale_override;

-- 06 (tablas + seed — pegar el bloque CREATE/INSERT de 19_locale_currency.sql si el script Python no está disponible)
