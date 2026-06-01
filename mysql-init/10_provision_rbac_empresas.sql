-- Provisiona catálogo RBAC (permisos + roles) en empresas distintas de la plantilla (id=1).
-- Idempotente: solo inserta lo que falta.

SET @plantilla_id = 1;

-- 1) Copiar permisos
INSERT INTO permiso (empresa_id, codigo, descripcion, activo)
SELECT e.id, p.codigo, p.descripcion, 1
FROM empresa e
INNER JOIN permiso p ON p.empresa_id = @plantilla_id AND p.activo = 1
WHERE e.id <> @plantilla_id
  AND e.esta_activa = 1
  AND NOT EXISTS (
    SELECT 1 FROM permiso px
    WHERE px.empresa_id = e.id AND px.codigo = p.codigo
  );

-- Reactivar permisos existentes desactivados
UPDATE permiso pd
INNER JOIN permiso pp ON pp.empresa_id = @plantilla_id AND pp.codigo = pd.codigo AND pp.activo = 1
SET pd.activo = 1, pd.descripcion = pp.descripcion
WHERE pd.empresa_id <> @plantilla_id AND pd.activo = 0;

-- 2) Copiar roles (por nombre)
INSERT INTO rol (empresa_id, nombre, descripcion, activo)
SELECT e.id, r.nombre, r.descripcion, 1
FROM empresa e
INNER JOIN rol r ON r.empresa_id = @plantilla_id AND r.activo = 1
WHERE e.id <> @plantilla_id
  AND e.esta_activa = 1
  AND NOT EXISTS (
    SELECT 1 FROM rol rx
    WHERE rx.empresa_id = e.id AND rx.nombre = r.nombre
  );

-- 3) Sincronizar rol_permiso mapeando por código de permiso
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT rd.id, pd.id, 1
FROM rol rp
INNER JOIN rol_permiso rpp ON rpp.rol_id = rp.id AND rpp.activo = 1
INNER JOIN permiso pp ON pp.id = rpp.permiso_id AND pp.empresa_id = @plantilla_id AND pp.activo = 1
INNER JOIN rol rd ON rd.empresa_id <> @plantilla_id AND rd.nombre = rp.nombre AND rd.activo = 1
INNER JOIN permiso pd ON pd.empresa_id = rd.empresa_id AND pd.codigo = pp.codigo AND pd.activo = 1
WHERE rp.empresa_id = @plantilla_id AND rp.activo = 1;
