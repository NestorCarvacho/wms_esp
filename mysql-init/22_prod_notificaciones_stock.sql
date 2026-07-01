-- Fixes post-deploy: stock_minimo + permiso notificaciones en roles existentes.
-- Idempotente (ignorar "Duplicate column" / "Duplicate entry").

-- === BLOQUE 1 ===
ALTER TABLE producto ADD COLUMN stock_minimo DECIMAL(18, 6) NULL;

-- === BLOQUE 2 ===
INSERT INTO permiso (empresa_id, codigo, descripcion, activo)
SELECT e.id, 'notificaciones.leer', 'Ver bandeja de notificaciones', 1
FROM empresa e
WHERE e.activo = 1
  AND NOT EXISTS (
    SELECT 1 FROM permiso p WHERE p.empresa_id = e.id AND p.codigo = 'notificaciones.leer'
  );

-- === BLOQUE 3 ===
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT r.id, p.id, 1
FROM rol r
JOIN permiso p ON p.empresa_id = r.empresa_id AND p.codigo = 'notificaciones.leer' AND p.activo = 1
WHERE r.activo = 1;
