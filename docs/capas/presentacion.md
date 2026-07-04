# Capa de Presentación (Endpoints & DTOs)

## Responsabilidades

- Gestionar peticiones HTTP en `app/api/v1/endpoints/`.
- Validar esquemas de entrada mediante DTOs Pydantic (`app/schemas/`).
- Extraer claims del JWT y construir `ContextoEmpresa` para multi-tenant.
- Inyectar handlers: `Depends(obtener_*_handlers)` desde `app/bootstrap/` o `presentation/http/dependencies.py`.

## Reglas de implementación

- **Router delgado:** validar DTO → armar comando → `await handler.handle(...)` → mapear respuesta.
- **Permisos:** `contexto_requiere_permiso("recurso.accion")` en endpoints que lo requieran.
- **Formato de respuesta unificado:**

  ```json
  {
    "exito": true,
    "datos": {},
    "mensaje": "Descripción de la operación",
    "errores": null
  }
  ```

## DTOs

- Un archivo por recurso en `app/schemas/`.
- Los DTOs validan entrada; los handlers devuelven dicts o entidades mapeadas en `application/*_mappers.py`.
- No exponer modelos ORM directamente en respuestas.

## Prohibiciones

- No importar SQLAlchemy ni repositorios concretos en endpoints.
- No implementar reglas de negocio (stock, RBAC efectivo, conversiones de presentación).

Plantilla: [PLANTILLA_ENDPOINT.py](../../PLANTILLA_ENDPOINT.py)
