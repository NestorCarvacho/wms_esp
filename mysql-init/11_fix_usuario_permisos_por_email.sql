-- ============================================================================
-- Diagnosticar y corregir permisos de un usuario (por email)
-- Railway Query: UN bloque a la vez. Cambiar el email en todos los bloques.
--
-- IMPORTANTE:
--   - "Asignar permisos" configura el ROL, no la persona.
--   - El usuario necesita el rol en usuario_rol + re-login.
-- ============================================================================

-- Email del usuario que no puede entrar (ej. empresa 2):
-- 'nestor.carvacho@logiavan.com'

-- === BLOQUE 1: datos del usuario ===
SELECT u.id, u.email, u.empresa_id, e.nombre AS empresa
FROM usuario u
INNER JOIN empresa e ON e.id = u.empresa_id
WHERE u.email = 'nestor.carvacho@logiavan.com';

-- === BLOQUE 2: roles asignados al usuario (si vacio = problema) ===
SELECT u.email, r.id AS rol_id, r.nombre AS rol
FROM usuario u
LEFT JOIN usuario_rol ur ON ur.usuario_id = u.id AND ur.activo = 1
LEFT JOIN rol r ON r.id = ur.rol_id AND r.activo = 1
WHERE u.email = 'nestor.carvacho@logiavan.com';

-- === BLOQUE 3: permisos efectivos actuales (cuenta debe ser ~44+) ===
SELECT u.email, COUNT(DISTINCT p.codigo) AS permisos_efectivos
FROM usuario u
LEFT JOIN usuario_rol ur ON ur.usuario_id = u.id AND ur.activo = 1
LEFT JOIN rol_permiso rp ON rp.rol_id = ur.rol_id AND rp.activo = 1
LEFT JOIN permiso p ON p.id = rp.permiso_id AND p.activo = 1
  AND p.empresa_id = u.empresa_id
WHERE u.email = 'nestor.carvacho@logiavan.com'
GROUP BY u.email;

-- === BLOQUE 4: permisos del rol Administrador en SU empresa ===
SELECT r.empresa_id, r.nombre, COUNT(rp.permiso_id) AS permisos_rol
FROM rol r
LEFT JOIN rol_permiso rp ON rp.rol_id = r.id AND rp.activo = 1
WHERE r.nombre = 'Administrador' AND r.activo = 1
GROUP BY r.empresa_id, r.nombre;

-- === BLOQUE 5: asegurar rol Administrador en la empresa del usuario ===
INSERT INTO rol (empresa_id, nombre, descripcion, activo)
SELECT u.empresa_id, 'Administrador', 'Acceso completo al WMS', 1
FROM usuario u
WHERE u.email = 'nestor.carvacho@logiavan.com'
  AND NOT EXISTS (
    SELECT 1 FROM rol r
    WHERE r.empresa_id = u.empresa_id AND r.nombre = 'Administrador'
  );

-- === BLOQUE 6: Administrador -> TODOS los permisos de su empresa ===
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT r.id, p.id, 1
FROM usuario u
INNER JOIN rol r ON r.empresa_id = u.empresa_id AND r.nombre = 'Administrador' AND r.activo = 1
INNER JOIN permiso p ON p.empresa_id = u.empresa_id AND p.activo = 1
WHERE u.email = 'nestor.carvacho@logiavan.com';

UPDATE rol_permiso rp
INNER JOIN usuario u ON u.email = 'nestor.carvacho@logiavan.com'
INNER JOIN rol r ON r.empresa_id = u.empresa_id AND r.nombre = 'Administrador' AND r.id = rp.rol_id
INNER JOIN permiso p ON p.id = rp.permiso_id AND p.empresa_id = u.empresa_id
SET rp.activo = 1;

-- === BLOQUE 7: asignar rol Administrador AL USUARIO ===
DELETE ur FROM usuario_rol ur
INNER JOIN usuario u ON u.id = ur.usuario_id
WHERE u.email = 'nestor.carvacho@logiavan.com';

INSERT INTO usuario_rol (usuario_id, rol_id, activo)
SELECT u.id, r.id, 1
FROM usuario u
INNER JOIN rol r ON r.empresa_id = u.empresa_id AND r.nombre = 'Administrador' AND r.activo = 1
WHERE u.email = 'nestor.carvacho@logiavan.com';

-- === BLOQUE 8: verificar (permisos_efectivos > 0) ===
SELECT
  u.email,
  u.empresa_id,
  r.nombre AS rol,
  COUNT(DISTINCT p.codigo) AS permisos_efectivos
FROM usuario u
INNER JOIN usuario_rol ur ON ur.usuario_id = u.id AND ur.activo = 1
INNER JOIN rol r ON r.id = ur.rol_id
INNER JOIN rol_permiso rp ON rp.rol_id = r.id AND rp.activo = 1
INNER JOIN permiso p ON p.id = rp.permiso_id AND p.activo = 1 AND p.empresa_id = u.empresa_id
WHERE u.email = 'nestor.carvacho@logiavan.com'
GROUP BY u.email, u.empresa_id, r.nombre;

-- Si permisos_efectivos = 0: ejecutar script 10_provision_rbac_empresas.sql para esa empresa.
