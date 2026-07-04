# Capa de Seguridad (Identity & Infraestructura)

## Responsabilidades

- Emisión y validación de JWT (`app/infrastructure/security/`).
- Cifrado de contraseñas (BCrypt).
- Middleware de locale y errores globales.
- RBAC: permisos en token + verificación en endpoints.

## RBAC efectivo

Cadena de autorización:

```
Usuario → usuario_rol → Rol → rol_permiso → Permiso
```

- Los permisos se aplanan en el JWT al hacer login (`permisos[]`).
- Formato: `recurso.accion` (ej. `inventario.recepcionar`).
- Los cargos pueden vincular roles que se heredan al crear/actualizar usuarios.

## Empresa maestra

- Claim `es_empresa_maestra=true` en JWT para usuarios de la plataforma SaaS.
- Permite listar y administrar empresas clientes con filtro `?empresa_id=`.

## Dependencias comunes

```python
Depends(obtener_usuario_autenticado)
Depends(requiere_permiso("codigo"))
Depends(contexto_requiere_permiso("productos.leer"))
```

## Fuera de alcance actual

- Recuperación de contraseña por email
- Notificaciones push / WebSocket de inventario
