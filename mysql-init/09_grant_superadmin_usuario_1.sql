-- ============================================================================
-- Superadmin: acceso completo (empresa maestra)
-- Railway Query: ejecutar UN bloque a la vez (Run selection).
--
-- ANTES: haber corrido 04, 05, 06 (columna es_empresa_maestra), 07, 08.
-- CAMBIAR el email en cada bloque si no es nestor.carvacho@wms.com
-- DESPUES: cerrar sesion en la app y volver a entrar (JWT).
-- ============================================================================

-- === BLOQUE 1: verificar usuario (debe devolver 1 fila) ===
SELECT id, empresa_id, email, activo
FROM usuario
WHERE email = 'nestor.carvacho@wms.com';

-- === BLOQUE 2: marcar su empresa como maestra ===
-- Si el paso 1 mostro empresa_id distinto de 1, cambia "WHERE id = 1" por ese id.
UPDATE empresa
SET es_empresa_maestra = 1, activo = 1, esta_activa = 1
WHERE id = 1;

-- === BLOQUE 3: tabla usuario_rol (si 08 no se aplico) ===
CREATE TABLE IF NOT EXISTS usuario_rol (
  usuario_id BIGINT NOT NULL,
  rol_id BIGINT NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (usuario_id, rol_id),
  FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
  FOREIGN KEY (rol_id) REFERENCES rol(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- === BLOQUE 4: permisos en empresa 1 (idempotente) ===
INSERT INTO permiso (empresa_id, codigo, descripcion, activo) VALUES
(1, 'usuarios.leer',           'Ver usuarios', 1),
(1, 'usuarios.crear',          'Crear usuarios', 1),
(1, 'usuarios.editar',         'Editar usuarios', 1),
(1, 'usuarios.eliminar',       'Eliminar usuarios', 1),
(1, 'empresas.leer',           'Ver empresas', 1),
(1, 'empresas.crear',          'Crear empresas', 1),
(1, 'empresas.editar',         'Editar empresas', 1),
(1, 'empresas.eliminar',       'Eliminar empresas', 1),
(1, 'cargos.leer',             'Ver cargos', 1),
(1, 'cargos.crear',            'Crear cargos', 1),
(1, 'cargos.editar',           'Editar cargos', 1),
(1, 'cargos.eliminar',         'Eliminar cargos', 1),
(1, 'roles.leer',              'Ver roles', 1),
(1, 'roles.crear',             'Crear roles', 1),
(1, 'roles.editar',            'Editar roles', 1),
(1, 'roles.eliminar',          'Eliminar roles', 1),
(1, 'permisos.leer',           'Ver permisos', 1),
(1, 'permisos.crear',          'Crear permisos', 1),
(1, 'permisos.editar',         'Editar permisos', 1),
(1, 'permisos.eliminar',       'Eliminar permisos', 1),
(1, 'bodegas.leer',            'Ver bodegas', 1),
(1, 'bodegas.crear',           'Crear bodegas', 1),
(1, 'bodegas.editar',          'Editar bodegas', 1),
(1, 'bodegas.eliminar',        'Eliminar bodegas', 1),
(1, 'productos.leer',          'Ver productos', 1),
(1, 'productos.crear',         'Crear productos', 1),
(1, 'productos.editar',        'Editar productos', 1),
(1, 'productos.eliminar',      'Eliminar productos', 1),
(1, 'productos.importar',      'Importar productos desde Excel', 1),
(1, 'unidades_medida.leer',    'Ver unidades de medida', 1),
(1, 'unidades_medida.crear',   'Crear unidades de medida', 1),
(1, 'unidades_medida.editar',  'Editar unidades de medida', 1),
(1, 'unidades_medida.eliminar','Eliminar unidades de medida', 1),
(1, 'tipos_zona.leer',         'Ver tipos de zona', 1),
(1, 'tipos_zona.crear',        'Crear tipos de zona', 1),
(1, 'tipos_zona.editar',       'Editar tipos de zona', 1),
(1, 'tipos_zona.eliminar',     'Eliminar tipos de zona', 1),
(1, 'zonas_bodega.leer',       'Ver zonas de bodega', 1),
(1, 'zonas_bodega.crear',      'Crear zonas de bodega', 1),
(1, 'zonas_bodega.editar',     'Editar zonas de bodega', 1),
(1, 'zonas_bodega.eliminar',   'Eliminar zonas de bodega', 1),
(1, 'tipos_producto.leer',     'Ver tipos de producto', 1),
(1, 'tipos_producto.crear',    'Crear tipos de producto', 1),
(1, 'tipos_producto.editar',   'Editar tipos de producto', 1),
(1, 'tipos_producto.eliminar', 'Eliminar tipos de producto', 1),
(1, 'producto_presentacion.leer',     'Ver presentaciones de producto', 1),
(1, 'producto_presentacion.crear',    'Crear presentaciones de producto', 1),
(1, 'producto_presentacion.editar',   'Editar presentaciones de producto', 1),
(1, 'producto_presentacion.eliminar', 'Eliminar presentaciones de producto', 1)
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion), activo = 1;

-- === BLOQUE 5: rol Administrador (si no existe) ===
INSERT INTO rol (empresa_id, nombre, descripcion, activo)
SELECT 1, 'Administrador', 'Acceso completo al WMS', 1
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM rol WHERE empresa_id = 1 AND nombre = 'Administrador'
);

-- === BLOQUE 6: Administrador -> todos los permisos de empresa 1 ===
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT r.id, p.id, 1
FROM rol r
INNER JOIN permiso p ON p.empresa_id = r.empresa_id AND p.activo = 1
WHERE r.empresa_id = 1
  AND r.nombre = 'Administrador'
  AND r.activo = 1;

-- === BLOQUE 7: reactivar vinculos rol_permiso inactivos ===
UPDATE rol_permiso rp
INNER JOIN rol r ON r.id = rp.rol_id AND r.empresa_id = 1 AND r.nombre = 'Administrador'
INNER JOIN permiso p ON p.id = rp.permiso_id AND p.empresa_id = 1
SET rp.activo = 1;

-- === BLOQUE 8: quitar roles previos del superadmin ===
DELETE ur FROM usuario_rol ur
INNER JOIN usuario u ON u.id = ur.usuario_id
WHERE u.email = 'nestor.carvacho@wms.com';

-- === BLOQUE 9: asignar rol Administrador al superadmin ===
INSERT INTO usuario_rol (usuario_id, rol_id, activo)
SELECT u.id, r.id, 1
FROM usuario u
INNER JOIN rol r ON r.empresa_id = u.empresa_id AND r.nombre = 'Administrador' AND r.activo = 1
WHERE u.email = 'nestor.carvacho@wms.com';

-- === BLOQUE 10: verificar (permisos_efectivos debe ser ~44+) ===
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
WHERE u.email = 'nestor.carvacho@wms.com'
GROUP BY u.id, u.email, u.empresa_id, e.es_empresa_maestra, r.nombre;
