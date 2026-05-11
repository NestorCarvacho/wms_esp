# Capa de Presentación (Controllers & DTOs)

## Responsabilidades
- Gestionar peticiones HTTP y respuestas.
- Validar esquemas de entrada mediante DTOs (Data Transfer Objects).
- Extraer claims del JWT (id, empresa_id) y pasarlos a la capa de negocio.

## Reglas de Implementación
- **Validación:** Validar formatos de RUT, correos y campos obligatorios antes de procesar.
- **Formato de Respuesta Unificado:**
  ```json
  {
    "exito": true,
    "datos": {},
    "mensaje": "Descripción de la operación",
    "errores": null
  }
  ```

## DTOs (Data Transfer Objects)
- Crear DTOs específicos para cada endpoint (CrearProductoDTO, ActualizarProductoDTO, etc.).
- Los DTOs deben validar datos de entrada y mapear hacia entidades de dominio.
- Nunca exponer entidades de BD directamente; serializar a través de DTOs.

## Manejo de Errores
- Capturar excepciones de la capa de negocio.
- Retornar errores con códigos HTTP apropiados (400, 401, 403, 404, 500).
- Registrar errores en logs para auditoría.

## Prohibición
No debe contener lógica de base de datos ni cálculos de negocio.