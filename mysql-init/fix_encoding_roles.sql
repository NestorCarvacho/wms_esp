-- Corrige nombres y descripciones con encoding corrupto en tabla rol
SET NAMES utf8mb4;

UPDATE rol SET
  nombre      = 'Recepción',
  descripcion = 'Operaciones de recepción en bodega'
WHERE nombre LIKE 'Recepci%n' OR nombre = 'Recepción';

UPDATE rol SET
  nombre      = 'Consulta Inventario',
  descripcion = 'Solo lectura de catálogo e inventario'
WHERE nombre LIKE 'Consulta%' AND (descripcion LIKE '%cat%logo%' OR descripcion LIKE '%cat??logo%');

UPDATE rol SET
  nombre      = 'Inventario Completo',
  descripcion = 'Gestión completa de catálogo e inventario'
WHERE nombre LIKE 'Inventario Completo%';

-- Verificar resultado
SELECT id, nombre, descripcion FROM rol ORDER BY id;
