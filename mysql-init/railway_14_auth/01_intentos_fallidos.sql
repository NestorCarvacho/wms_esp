-- Railway Query: copiar y ejecutar SOLO la linea ALTER (sin comentarios).
-- Si "Duplicate column name", esa columna ya existe: siga con 02.

ALTER TABLE usuario ADD COLUMN intentos_fallidos INT NOT NULL DEFAULT 0;
