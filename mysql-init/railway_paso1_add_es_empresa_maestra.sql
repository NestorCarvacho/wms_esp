-- PASO 1 (ejecutar SOLO esta linea primero en Railway Query)
-- Si dice "Duplicate column name", la columna ya existe: pasa al PASO 2.

ALTER TABLE empresa ADD COLUMN es_empresa_maestra TINYINT(1) NOT NULL DEFAULT 0;
