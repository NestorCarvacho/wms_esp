# Capa de Negocio (Handlers / Dominio)

## Responsabilidades

- Implementar casos de uso en `app/modules/<contexto>/application/handlers/`.
- Validar reglas de dominio (stock suficiente, zonas válidas, permisos de negocio).
- Orquestar persistencia a través de **puertos** (`domain/ports.py`), no de SQL directo.

## Reglas de implementación

- **Handlers delgados:** reciben un comando o query, delegan en servicios de dominio o repositorios vía puerto.
- **Transaccionalidad:** una operación de inventario debe actualizar stock y registrar movimiento en la misma unidad de trabajo.
- **Excepciones:** lanzar excepciones de dominio claras (`StockInsuficienteError`, etc.) para mapearlas a HTTP en la capa API.
- **Sin FastAPI:** los handlers no importan `Request`, `Depends` ni routers.

## Ejemplo de flujo

```
RecepcionHandler
  → InventarioOperacionPolicy (domain/services)
  → IInventarioRepository (port)
  → SqlAlchemyInventarioRepository (infrastructure)
```

Ver [ARCHITECTURE.md](../ARCHITECTURE.md) para la estructura completa por módulo.
