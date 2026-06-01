-- Permisos iniciales para empresa maestra (empresa_id = 1).
-- Ejecutar DESPUÉS de 04_rbac_missing_tables.sql
-- Idempotente: se puede correr más de una vez sin duplicar.

SET @empresa_id = 1;

-- ---------------------------------------------------------------------------
-- 1) Catálogo de permisos
-- ---------------------------------------------------------------------------
INSERT INTO permiso (empresa_id, codigo, descripcion, activo) VALUES
(@empresa_id, 'usuarios.leer',           'Ver usuarios', 1),
(@empresa_id, 'usuarios.crear',          'Crear usuarios', 1),
(@empresa_id, 'usuarios.editar',         'Editar usuarios', 1),
(@empresa_id, 'usuarios.eliminar',       'Eliminar usuarios', 1),
(@empresa_id, 'empresas.leer',           'Ver empresas', 1),
(@empresa_id, 'empresas.crear',          'Crear empresas', 1),
(@empresa_id, 'empresas.editar',         'Editar empresas', 1),
(@empresa_id, 'empresas.eliminar',       'Eliminar empresas', 1),
(@empresa_id, 'cargos.leer',             'Ver cargos', 1),
(@empresa_id, 'cargos.crear',            'Crear cargos', 1),
(@empresa_id, 'cargos.editar',           'Editar cargos', 1),
(@empresa_id, 'cargos.eliminar',         'Eliminar cargos', 1),
(@empresa_id, 'roles.leer',              'Ver roles', 1),
(@empresa_id, 'roles.crear',             'Crear roles', 1),
(@empresa_id, 'roles.editar',            'Editar roles', 1),
(@empresa_id, 'roles.eliminar',          'Eliminar roles', 1),
(@empresa_id, 'permisos.leer',           'Ver permisos', 1),
(@empresa_id, 'permisos.crear',          'Crear permisos', 1),
(@empresa_id, 'permisos.editar',         'Editar permisos', 1),
(@empresa_id, 'permisos.eliminar',       'Eliminar permisos', 1),
(@empresa_id, 'bodegas.leer',            'Ver bodegas', 1),
(@empresa_id, 'bodegas.crear',           'Crear bodegas', 1),
(@empresa_id, 'bodegas.editar',          'Editar bodegas', 1),
(@empresa_id, 'bodegas.eliminar',        'Eliminar bodegas', 1),
(@empresa_id, 'productos.leer',          'Ver productos', 1),
(@empresa_id, 'productos.crear',         'Crear productos', 1),
(@empresa_id, 'productos.editar',        'Editar productos', 1),
(@empresa_id, 'productos.eliminar',      'Eliminar productos', 1),
(@empresa_id, 'productos.importar',      'Importar productos desde Excel', 1),
(@empresa_id, 'unidades_medida.leer',    'Ver unidades de medida', 1),
(@empresa_id, 'unidades_medida.crear',   'Crear unidades de medida', 1),
(@empresa_id, 'unidades_medida.editar',  'Editar unidades de medida', 1),
(@empresa_id, 'unidades_medida.eliminar','Eliminar unidades de medida', 1),
(@empresa_id, 'tipos_zona.leer',         'Ver tipos de zona', 1),
(@empresa_id, 'tipos_zona.crear',        'Crear tipos de zona', 1),
(@empresa_id, 'tipos_zona.editar',       'Editar tipos de zona', 1),
(@empresa_id, 'tipos_zona.eliminar',     'Eliminar tipos de zona', 1),
(@empresa_id, 'zonas_bodega.leer',       'Ver zonas de bodega', 1),
(@empresa_id, 'zonas_bodega.crear',      'Crear zonas de bodega', 1),
(@empresa_id, 'zonas_bodega.editar',     'Editar zonas de bodega', 1),
(@empresa_id, 'zonas_bodega.eliminar',   'Eliminar zonas de bodega', 1)
ON DUPLICATE KEY UPDATE
  descripcion = VALUES(descripcion),
  activo = 1;

-- ---------------------------------------------------------------------------
-- 2) Rol Administrador (si no existe)
-- ---------------------------------------------------------------------------
INSERT INTO rol (empresa_id, nombre, descripcion, activo)
SELECT @empresa_id, 'Administrador', 'Acceso completo al WMS', 1
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM rol WHERE empresa_id = @empresa_id AND nombre = 'Administrador'
);

-- ---------------------------------------------------------------------------
-- 3) Rol Administrador → todos los permisos de la empresa
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT r.id, p.id, 1
FROM rol r
INNER JOIN permiso p ON p.empresa_id = r.empresa_id AND p.activo = 1
WHERE r.empresa_id = @empresa_id
  AND r.nombre = 'Administrador'
  AND r.activo = 1;

-- ---------------------------------------------------------------------------
-- 4) Cargo(s) de la empresa → rol Administrador
--    (todos los cargos de empresa 1; ajusta el WHERE si solo quieres cargo_id = 1)
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO permisos_cargo (cargo_id, rol_id, activo)
SELECT c.id, r.id, 1
FROM cargo c
INNER JOIN rol r ON r.empresa_id = c.empresa_id AND r.nombre = 'Administrador' AND r.activo = 1
WHERE c.empresa_id = @empresa_id
  AND c.activo = 1;

-- ---------------------------------------------------------------------------
-- Verificación (opcional)
-- ---------------------------------------------------------------------------
-- SELECT p.codigo FROM permiso p WHERE p.empresa_id = 1 ORDER BY p.codigo;
-- SELECT r.nombre, COUNT(rp.permiso_id) AS permisos
-- FROM rol r LEFT JOIN rol_permiso rp ON rp.rol_id = r.id
-- WHERE r.empresa_id = 1 GROUP BY r.id, r.nombre;
