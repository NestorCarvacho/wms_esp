-- ============================================================================
-- Provisionar RBAC en empresas hijas (copia desde empresa plantilla id=1)
-- Railway Query: ejecutar UN bloque a la vez (Run selection).
--
-- ANTES: empresa 1 debe tener permisos y roles (scripts 05, 08, 09).
-- DESPUES: en /asignar-permisos elegir empresa concreta (no "Todas").
-- Idempotente: se puede re-ejecutar; solo agrega lo faltante.
-- ============================================================================

-- === BLOQUE 0a: verificar plantilla (debe ser > 0) ===
-- SELECT COUNT(*) AS permisos_empresa_1 FROM permiso WHERE empresa_id = 1 AND activo = 1;

-- === BLOQUE 0b: empresas que recibiran la copia ===
-- SELECT id, razon_social, esta_activa FROM empresa WHERE id <> 1 AND COALESCE(esta_activa, 1) = 1;

-- === BLOQUE 1: copiar permisos de empresa 1 a cada empresa hija ===
INSERT INTO permiso (empresa_id, codigo, descripcion, activo)
SELECT e.id, p.codigo, p.descripcion, 1
FROM empresa e
INNER JOIN permiso p ON p.empresa_id = 1 AND p.activo = 1
LEFT JOIN permiso px ON px.empresa_id = e.id AND px.codigo = p.codigo
WHERE e.id <> 1
  AND COALESCE(e.esta_activa, 1) = 1
  AND px.id IS NULL;

-- === BLOQUE 2: reactivar permisos desactivados en empresas hijas ===
UPDATE permiso pd
INNER JOIN permiso pp ON pp.empresa_id = 1 AND pp.codigo = pd.codigo AND pp.activo = 1
SET pd.activo = 1, pd.descripcion = pp.descripcion
WHERE pd.empresa_id <> 1 AND pd.activo = 0;

-- === BLOQUE 3: copiar roles (por nombre) de empresa 1 a hijas ===
INSERT INTO rol (empresa_id, nombre, descripcion, activo)
SELECT e.id, r.nombre, r.descripcion, 1
FROM empresa e
INNER JOIN rol r ON r.empresa_id = 1 AND r.activo = 1
LEFT JOIN rol rx ON rx.empresa_id = e.id AND rx.nombre = r.nombre
WHERE e.id <> 1
  AND COALESCE(e.esta_activa, 1) = 1
  AND rx.id IS NULL;

-- === BLOQUE 4: copiar asignaciones rol_permiso (mapeo por codigo de permiso) ===
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT rd.id, pd.id, 1
FROM rol rp
INNER JOIN rol_permiso rpp ON rpp.rol_id = rp.id AND rpp.activo = 1
INNER JOIN permiso pp ON pp.id = rpp.permiso_id AND pp.empresa_id = 1 AND pp.activo = 1
INNER JOIN rol rd ON rd.empresa_id <> 1 AND rd.nombre = rp.nombre AND rd.activo = 1
INNER JOIN permiso pd ON pd.empresa_id = rd.empresa_id AND pd.codigo = pp.codigo AND pd.activo = 1
WHERE rp.empresa_id = 1 AND rp.activo = 1;

-- === BLOQUE 5: verificar permisos por empresa ===
-- SELECT e.id, e.razon_social, COUNT(p.id) AS total_permisos FROM empresa e ...

-- === BLOQUE 6: verificar roles y permisos por rol (opcional) ===
-- SELECT e.id AS empresa_id, e.razon_social AS empresa, r.nombre AS rol ...
