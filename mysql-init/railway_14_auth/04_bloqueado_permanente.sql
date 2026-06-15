-- Railway Query: copiar y ejecutar SOLO la linea ALTER (sin comentarios).
-- Si "Duplicate column name", siga con 05.

ALTER TABLE usuario ADD COLUMN bloqueado_permanente TINYINT(1) NOT NULL DEFAULT 0;
