-- Quitar cargo_id de rol (esquema legacy). Obligatorio antes de crear roles nuevos.
-- Railway Query: ejecutar bloque por bloque. Ignorar "Can't DROP" si ya se aplico.

-- === BLOQUE 0: ver si cargo_id existe ===
SHOW COLUMNS FROM rol LIKE 'cargo_id';

-- === BLOQUE 1: nombre de la foreign key (copiar CONSTRAINT_NAME del resultado) ===
SELECT CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'rol'
  AND COLUMN_NAME = 'cargo_id'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- === BLOQUE 2: quitar FK (reemplaza rol_ibfk_2 por el nombre del bloque 1) ===
ALTER TABLE rol DROP FOREIGN KEY rol_ibfk_2;

-- Si falla, prueba: ALTER TABLE rol DROP FOREIGN KEY rol_ibfk_1;

-- === BLOQUE 3: quitar indice legacy (ignorar error si no existe) ===
ALTER TABLE rol DROP INDEX uk_rol_cargo_empresa;

-- === BLOQUE 4: quitar columna cargo_id ===
ALTER TABLE rol DROP COLUMN cargo_id;

-- === BLOQUE 5: indice correcto por empresa + nombre (ignorar Duplicate key name) ===
ALTER TABLE rol ADD UNIQUE KEY uk_rol_empresa (nombre, empresa_id);

-- === BLOQUE 6: verificar ===
SHOW COLUMNS FROM rol;
