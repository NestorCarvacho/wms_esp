# Núcleo WMS — inventario operativo

> Manual de uso para operadores: [MANUAL_USUARIO.md § Inventario operativo](./MANUAL_USUARIO.md#6-inventario-operativo)  
> Índice general: [INDEX.md](./INDEX.md)

## Estado (MVP implementado)

| Capacidad | API | UI |
|-----------|-----|-----|
| Stock por zona (`stock_zona`) | `GET /api/v1/inventario/stock` | *Stock por ubicación* |
| Recepción | `POST /api/v1/inventario/recepcion` | *Recepción* |
| Traslado (misma bodega) | `POST /api/v1/inventario/traslado` | *Traslado* |
| Despacho | `POST /api/v1/inventario/despacho` | *Despacho* |
| Historial auditado | `GET /api/v1/inventario/movimientos` | *Historial de movimientos* |
| Escaneo (pistola) | SKU = `producto.sku` | Recepción / Traslado / Despacho |
| Zona recepción por bodega | `GET/PUT .../bodegas/{id}/configuracion` | *Zona de recepción* |

> El dashboard operativo fue retirado del alcance. La ruta `/app/inventario/dashboard` redirige a stock.

Migración: `mysql-init/12_inventario_operativo.sql` (tablas + permisos `inventario.*`).  
Regionalización: `mysql-init/19_locale_currency.sql` (locale, timezone, moneda por empresa).

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

## Reportes exportables

| Reporte | API | Formatos | UI |
|---------|-----|----------|-----|
| Stock por ubicación (producto + bodega + zona) | `GET /api/v1/inventario/stock/export?formato=xlsx\|pdf` | Excel, PDF | Stock por ubicación |
| Historial de movimientos | `GET /api/v1/inventario/movimientos/export?formato=xlsx\|pdf` | Excel, PDF | Historial |

Hasta 50.000 filas por exportación; respeta filtro de empresa y orden de la tabla.

## Próximos pasos sugeridos

- Filtros en UI (bodega/producto en stock y movimientos).
- Validación de tipo de zona (solo recepción en recepción, etc.).
- Órdenes de compra/venta enlazadas a movimientos.
- Reportes y conteos cíclicos.
