-- ============================================================================
-- Grant acceso completo al superadmin (usuario id=1, empresa maestra id=1)
-- Usuario: nestor.carvacho@wms.com
--
-- Ejecutar DESPUÉS de:
--   05_rbac_seed_empresa_1.sql
--   07_producto_tipo_presentacion.sql
--   08_usuario_rol.sql
--
-- Idempotente: se puede ejecutar varias veces.
-- IMPORTANTE: Tras ejecutar, el usuario debe CERRAR SESIÓN y volver a entrar
--             para que el JWT cargue los permisos actualizados.
-- ============================================================================

SET @usuario_id   = 1;
SET @empresa_id   = 1;
SET @usuario_email = 'nestor.carvacho@wms.com';

-- ---------------------------------------------------------------------------
-- 1) Verificar que el usuario existe
-- ---------------------------------------------------------------------------
SELECT id, empresa_id, email, activo
FROM usuario
WHERE id = @usuario_id AND email = @usuario_email;

-- ---------------------------------------------------------------------------
-- 2) Empresa maestra (flag multiempresa)
-- ---------------------------------------------------------------------------
UPDATE empresa
SET es_empresa_maestra = 1, activo = 1, esta_activa = 1
WHERE id = @empresa_id;

-- ---------------------------------------------------------------------------
-- 3) Asegurar tabla usuario_rol (por si 08 no se aplicó)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuario_rol (
  usuario_id BIGINT NOT NULL,
  rol_id BIGINT NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (usuario_id, rol_id),
  FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
  FOREIGN KEY (rol_id) REFERENCES rol(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- 4) Permisos faltantes (catálogo base + tipos/presentaciones)
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
(@empresa_id, 'zonas_bodega.eliminar',   'Eliminar zonas de bodega', 1),
(@empresa_id, 'tipos_producto.leer',     'Ver tipos de producto', 1),
(@empresa_id, 'tipos_producto.crear',    'Crear tipos de producto', 1),
(@empresa_id, 'tipos_producto.editar',   'Editar tipos de producto', 1),
(@empresa_id, 'tipos_producto.eliminar', 'Eliminar tipos de producto', 1),
(@empresa_id, 'producto_presentacion.leer',     'Ver presentaciones de producto', 1),
(@empresa_id, 'producto_presentacion.crear',    'Crear presentaciones de producto', 1),
(@empresa_id, 'producto_presentacion.editar',   'Editar presentaciones de producto', 1),
(@empresa_id, 'producto_presentacion.eliminar', 'Eliminar presentaciones de producto', 1)
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion), activo = 1;

-- ---------------------------------------------------------------------------
-- 5) Rol Administrador con TODOS los permisos activos de la empresa
-- ---------------------------------------------------------------------------
INSERT INTO rol (empresa_id, nombre, descripcion, activo)
SELECT @empresa_id, 'Administrador', 'Acceso completo al WMS', 1
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM rol WHERE empresa_id = @empresa_id AND nombre = 'Administrador'
);

SET @rol_admin_id = (
  SELECT id FROM rol
  WHERE empresa_id = @empresa_id AND nombre = 'Administrador' AND activo = 1
  LIMIT 1
);

INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT @rol_admin_id, p.id, 1
FROM permiso p
WHERE p.empresa_id = @empresa_id AND p.activo = 1;

-- Reactivar vínculos existentes por si quedaron inactivos
UPDATE rol_permiso rp
INNER JOIN permiso p ON p.id = rp.permiso_id AND p.empresa_id = @empresa_id
SET rp.activo = 1
WHERE rp.rol_id = @rol_admin_id;

-- ---------------------------------------------------------------------------
-- 6) Asignar rol Administrador al usuario (reemplaza roles previos)
-- ---------------------------------------------------------------------------
DELETE FROM usuario_rol WHERE usuario_id = @usuario_id;

INSERT INTO usuario_rol (usuario_id, rol_id, activo)
VALUES (@usuario_id, @rol_admin_id, 1);

-- ---------------------------------------------------------------------------
-- 7) Verificación
-- ---------------------------------------------------------------------------
SELECT
  u.id AS usuario_id,
  u.email,
  u.empresa_id,
  e.es_empresa_maestra,
  r.nombre AS rol,
  COUNT(DISTINCT p.codigo) AS permisos_efectivos
FROM usuario u
INNER JOIN empresa e ON e.id = u.empresa_id
INNER JOIN usuario_rol ur ON ur.usuario_id = u.id AND ur.activo = 1
INNER JOIN rol r ON r.id = ur.rol_id AND r.activo = 1
INNER JOIN rol_permiso rp ON rp.rol_id = r.id AND rp.activo = 1
INNER JOIN permiso p ON p.id = rp.permiso_id AND p.activo = 1
WHERE u.id = @usuario_id
GROUP BY u.id, u.email, u.empresa_id, e.es_empresa_maestra, r.nombre;

-- Listado de códigos (opcional, descomentar):
-- SELECT p.codigo
-- FROM usuario u
-- INNER JOIN usuario_rol ur ON ur.usuario_id = u.id AND ur.activo = 1
-- INNER JOIN rol_permiso rp ON rp.rol_id = ur.rol_id AND rp.activo = 1
-- INNER JOIN permiso p ON p.id = rp.permiso_id AND p.activo = 1
-- WHERE u.id = @usuario_id
-- ORDER BY p.codigo;
