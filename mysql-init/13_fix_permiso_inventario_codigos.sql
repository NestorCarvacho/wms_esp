-- Corrige permisos mal nombrados en catálogos existentes.
-- Ejecutar después de 12_inventario_operativo.sql en BD ya creada.

-- Desactivar alias incorrectos (la API usa inventario.*)
UPDATE permiso SET activo = 0
WHERE activo = 1
  AND (
    codigo LIKE 'recepcion.%'
    OR codigo LIKE 'despacho.%'
    OR codigo LIKE 'traslado.%'
    OR codigo LIKE 'reportes.%'
  );

-- Asegurar inventario.* en empresa 1 (por si 12 no se aplicó)
INSERT IGNORE INTO permiso (empresa_id, codigo, descripcion, activo) VALUES
(1, 'inventario.leer', 'Ver stock y movimientos de inventario', 1),
(1, 'inventario.recepcionar', 'Registrar recepciones de mercancía', 1),
(1, 'inventario.trasladar', 'Trasladar stock entre ubicaciones', 1),
(1, 'inventario.despachar', 'Registrar despachos de mercancía', 1),
(1, 'inventario.configurar', 'Configurar zona de recepción por bodega', 1);

INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT r.id, p.id, 1
FROM rol r
JOIN permiso p ON p.empresa_id = r.empresa_id AND p.codigo LIKE 'inventario.%' AND p.activo = 1
WHERE r.empresa_id = 1
  AND r.nombre IN ('Administrador', 'Admin', 'Inventario Completo', 'Recepción', 'Despacho', 'Consulta Inventario');
