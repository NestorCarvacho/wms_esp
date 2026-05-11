# Ejemplos de uso de la API WMS

## 🔐 Autenticación

### Login
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "admin@wmscode.cl",
    "contrasena": "Test1234"
  }'
```

**Respuesta exitosa (200):**
```json
{
  "exito": true,
  "datos": {
    "access_token": "eyJhbGc...",
    "token_type": "bearer",
    "usuario": {
      "id": 1,
      "empresa_id": 1,
      "correo": "admin@wmscode.cl",
      "nombre": "Admin",
      "apellido": "Sistema",
      "rut": "11.111.111-1",
      "activo": true,
      "fecha_creacion": "2026-05-10T..."
    }
  },
  "mensaje": "Login exitoso"
}
```

### Registrar Usuario
```bash
curl -X POST "http://localhost:8000/api/v1/auth/registrar" \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "nuevo@empresa.cl",
    "contrasena": "Password123",
    "nombre": "Carlos",
    "apellido": "López",
    "rut": "15.555.555-5"
  }'
```

**Respuesta exitosa (200):**
```json
{
  "exito": true,
  "datos": {
    "id": 3,
    "empresa_id": 1,
    "correo": "nuevo@empresa.cl",
    "nombre": "Carlos",
    "apellido": "López",
    "rut": "15.555.555-5",
    "activo": true,
    "fecha_creacion": "2026-05-10T..."
  },
  "mensaje": "Usuario registrado exitosamente"
}
```

## 🔓 Usar el Token

El token debe enviarse en el header `Authorization` con el formato `Bearer <token>`:

```bash
curl -X GET "http://localhost:8000/api/v1/usuarios/" \
  -H "Authorization: Bearer eyJhbGc..."
```

## 📊 Estructura de Respuestas

Todas las respuestas siguen el formato unificado:

```json
{
  "exito": boolean,
  "datos": object | null,
  "mensaje": string,
  "errores": [string] | null
}
```

## ⚠️ Códigos de Error

- `400 Bad Request` - Validación fallida
- `401 Unauthorized` - Credenciales inválidas o token expirado
- `403 Forbidden` - Permisos insuficientes
- `404 Not Found` - Recurso no existe
- `500 Internal Server Error` - Error del servidor

## 📝 Contraseñas de Prueba

- **Usuario:** admin@wmscode.cl
- **Contraseña:** Test1234
- **Empresa:** WMS CORE (ID: 1)

---

- **Usuario:** usuario@prueba.cl
- **Contraseña:** Test1234
- **Empresa:** Empresa de Prueba Ltda. (ID: 2)

**Nota:** Los usuarios con la misma empresa_id están aislados entre sí según la regla de multi-tenancy.
