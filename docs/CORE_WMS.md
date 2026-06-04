# Núcleo WMS — inventario operativo

## Estado (MVP implementado)

| Capacidad | API | UI |
|-----------|-----|-----|
| Stock por zona (`stock_zona`) | `GET /api/v1/inventario/stock` | Pestaña *Stock por ubicación* |
| Recepción | `POST /api/v1/inventario/recepcion` | Pestaña *Operaciones* |
| Traslado (misma bodega) | `POST /api/v1/inventario/traslado` | Pestaña *Operaciones* |
| Despacho | `POST /api/v1/inventario/despacho` | Pestaña *Operaciones* |
| Historial auditado | `GET /api/v1/inventario/movimientos` | Pestaña *Historial* |
| Escaneo (pistola) | SKU = `producto.sku` | Recepción / Traslado / Despacho: lista lateral + lote |
| Zona recepción por bodega | `GET/PUT .../bodegas/{id}/configuracion` | Pestaña *Recepción por bodega* |

Migración: `mysql-init/12_inventario_operativo.sql` (tablas + permisos `inventario.*`).

## Modelo

- **Stock** en unidades base del producto (`producto.unidad_medida_id`).
- **Presentaciones** opcionales en operaciones; conversión vía `InventarioPresentacionService`.
- **Movimientos**: `RECEPCION`, `TRASLADO`, `DESPACHO` en `movimiento_inventario`.
- Las tablas legacy `inventario` / `movimiento_stock` de `01_setup.sql` no se usan en este flujo.

## Permisos

- `inventario.leer` — consultas
- `inventario.recepcionar` / `inventario.trasladar` / `inventario.despachar` — operaciones
- `inventario.configurar` — zona de recepción por defecto

## Despliegue local

1. Aplicar SQL: `mysql-init/12_inventario_operativo.sql` y, si la matriz de permisos muestra filas vacías `recepcion`/`reportes`, también `mysql-init/13_fix_permiso_inventario_codigos.sql`.
2. Reiniciar API (`uvicorn`) y frontend (`npm run dev`).
3. Asignar permisos `inventario.*` al rol del usuario (o usar rol Admin empresa 1).

## Próximos pasos sugeridos

- Filtros en UI (bodega/producto en stock y movimientos).
- Validación de tipo de zona (solo recepción en recepción, etc.).
- Órdenes de compra/venta enlazadas a movimientos.
- Reportes y conteos cíclicos.
