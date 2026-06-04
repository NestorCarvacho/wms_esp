-- Asignación directa de roles al usuario (cargo queda solo como dato organizacional).
-- Ejecutar DESPUÉS de 05_rbac_seed_empresa_1.sql y 07_producto_tipo_presentacion.sql

CREATE TABLE IF NOT EXISTS usuario_rol (
  usuario_id BIGINT NOT NULL,
  rol_id BIGINT NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (usuario_id, rol_id),
  FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
  FOREIGN KEY (rol_id) REFERENCES rol(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Migrar roles que tenían los cargos → cada usuario hereda los roles de su cargo actual
INSERT IGNORE INTO usuario_rol (usuario_id, rol_id, activo)
SELECT u.id, pc.rol_id, pc.activo
FROM usuario u
INNER JOIN permisos_cargo pc ON pc.cargo_id = u.cargo_id AND pc.activo = 1
WHERE u.cargo_id IS NOT NULL;

-- Usuarios sin cargo ni roles: asignar Administrador si existen en empresa 1 (bootstrap)
INSERT IGNORE INTO usuario_rol (usuario_id, rol_id, activo)
SELECT u.id, r.id, 1
FROM usuario u
INNER JOIN rol r ON r.empresa_id = u.empresa_id AND r.nombre = 'Administrador' AND r.activo = 1
WHERE u.activo = 1
  AND NOT EXISTS (SELECT 1 FROM usuario_rol ur WHERE ur.usuario_id = u.id);

SET @empresa_id = 1;

-- Roles operativos de ejemplo (Recepción, Despacho, Consulta Inventario)
INSERT INTO rol (empresa_id, nombre, descripcion, activo)
SELECT @empresa_id, 'Recepción', 'Operaciones de recepción en bodega', 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM rol WHERE empresa_id = @empresa_id AND nombre = 'Recepción');

INSERT INTO rol (empresa_id, nombre, descripcion, activo)
SELECT @empresa_id, 'Despacho', 'Operaciones de despacho en bodega', 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM rol WHERE empresa_id = @empresa_id AND nombre = 'Despacho');

INSERT INTO rol (empresa_id, nombre, descripcion, activo)
SELECT @empresa_id, 'Consulta Inventario', 'Solo lectura de catálogo e inventario', 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM rol WHERE empresa_id = @empresa_id AND nombre = 'Consulta Inventario');

INSERT INTO rol (empresa_id, nombre, descripcion, activo)
SELECT @empresa_id, 'Inventario Completo', 'Gestión completa de catálogo e inventario', 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM rol WHERE empresa_id = @empresa_id AND nombre = 'Inventario Completo');

-- Recepción: bodegas y zonas (sin productos)
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT r.id, p.id, 1
FROM rol r
INNER JOIN permiso p ON p.empresa_id = r.empresa_id
WHERE r.empresa_id = @empresa_id AND r.nombre = 'Recepción'
  AND p.codigo IN (
    'bodegas.leer', 'zonas_bodega.leer', 'tipos_zona.leer',
    'productos.leer', 'inventario.leer', 'inventario.recepcionar', 'inventario.configurar'
  );

-- Despacho: bodegas y zonas
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT r.id, p.id, 1
FROM rol r
INNER JOIN permiso p ON p.empresa_id = r.empresa_id
WHERE r.empresa_id = @empresa_id AND r.nombre = 'Despacho'
  AND p.codigo IN (
    'bodegas.leer', 'zonas_bodega.leer', 'tipos_zona.leer',
    'productos.leer', 'inventario.leer', 'inventario.despachar'
  );

-- Consulta Inventario: solo lectura catálogo
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT r.id, p.id, 1
FROM rol r
INNER JOIN permiso p ON p.empresa_id = r.empresa_id
WHERE r.empresa_id = @empresa_id AND r.nombre = 'Consulta Inventario'
  AND p.codigo IN (
    'productos.leer', 'unidades_medida.leer', 'tipos_producto.leer',
    'producto_presentacion.leer', 'bodegas.leer', 'tipos_zona.leer', 'zonas_bodega.leer',
    'inventario.leer'
  );

-- Inventario Completo: CRUD catálogo (sin administración)
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT r.id, p.id, 1
FROM rol r
INNER JOIN permiso p ON p.empresa_id = r.empresa_id
WHERE r.empresa_id = @empresa_id AND r.nombre = 'Inventario Completo'
  AND p.codigo IN (
    'productos.leer', 'productos.crear', 'productos.editar', 'productos.eliminar', 'productos.importar',
    'unidades_medida.leer', 'unidades_medida.crear', 'unidades_medida.editar', 'unidades_medida.eliminar',
    'tipos_producto.leer', 'tipos_producto.crear', 'tipos_producto.editar', 'tipos_producto.eliminar',
    'producto_presentacion.leer', 'producto_presentacion.crear', 'producto_presentacion.editar', 'producto_presentacion.eliminar',
    'bodegas.leer', 'bodegas.crear', 'bodegas.editar', 'bodegas.eliminar',
    'tipos_zona.leer', 'tipos_zona.crear', 'tipos_zona.editar', 'tipos_zona.eliminar',
    'zonas_bodega.leer', 'zonas_bodega.crear', 'zonas_bodega.editar', 'zonas_bodega.eliminar',
    'inventario.leer', 'inventario.recepcionar', 'inventario.trasladar',
    'inventario.despachar', 'inventario.configurar'
  );

-- Vincular permisos de tipos_producto al rol Administrador
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT r.id, p.id, 1
FROM rol r
INNER JOIN permiso p ON p.empresa_id = r.empresa_id
WHERE r.empresa_id = @empresa_id AND r.nombre = 'Administrador'
  AND (p.codigo LIKE 'tipos_producto.%' OR p.codigo LIKE 'producto_presentacion.%');
