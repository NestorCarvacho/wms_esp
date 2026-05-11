# Capa de Negocio (Services / Domain)

## Responsabilidades
- Implementar las reglas de flujo de inventario.
- Validar si un producto puede cambiar de estado (ej: de "Disponible" a "Merma").
- Orquestar la trazabilidad: al mover stock, se debe invocar la creación del log en `movimientos_stock`.

## Reglas de Implementación
- **Validaciones Críticas:**
  - Verificar existencia de stock suficiente antes de reservar.
  - Asegurar que el `estado_id` de destino pertenezca a la misma `empresa_id`.
- **Transaccionalidad:** Asegurar que si falla la actualización de inventario, no se guarde el movimiento de stock (Atomicidad).
- **Excepciones:** Lanzar excepciones de dominio claras (ej: `StockInsuficienteException`) para que la capa de presentación las capture.