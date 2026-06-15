-- Railway Query: copiar y ejecutar SOLO la linea ALTER (sin comentarios).
-- Si "Duplicate column name", siga con 04.

ALTER TABLE usuario ADD COLUMN bloqueos_temporales INT NOT NULL DEFAULT 0;
