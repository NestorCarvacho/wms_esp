# 📚 Documentación de Swagger - WMS Multi-Tenant API

## 🎯 Acceso a la Documentación Interactiva

### Swagger UI (Recomendado)
```
http://localhost:8000/docs
```
- Interfaz interactiva completa
- Permite probar los endpoints directamente
- Muestra esquemas de request/response

### ReDoc (Documentación de referencia)
```
http://localhost:8000/redoc
```
- Documentación limpia y legible
- Mejor para lectura offline
- Organizacion jerárquica

### JSON OpenAPI
```
http://localhost:8000/openapi.json
```
- Schema OpenAPI 3.0 en JSON
- Puede importarse en Postman/Insomnia

---

## 📋 Estructura de las Respuestas

Todos los endpoints devuelven el mismo formato unificado:

```json
{
  "exito": boolean,
  "datos": object | null,
  "mensaje": string,
  "errores": [string] | null
}
```

### Ejemplo de Respuesta Exitosa (200 OK):
```json
{
  "exito": true,
  "datos": {
    "id": 1,
    "access_token": "eyJhbGc...",
    "token_type": "bearer"
  },
  "mensaje": "Login exitoso",
  "errores": null
}
```

### Ejemplo de Respuesta Fallida (400 Bad Request):
```json
{
  "exito": false,
  "datos": null,
  "mensaje": "Validación fallida",
  "errores": [
    "La contraseña debe contener al menos una mayúscula",
    "La contraseña debe contener al menos un número"
  ]
}
```

---

## 🔐 Autenticación en Swagger

### Pasos para probar endpoints protegidos:

1. **Ejecutar `/api/v1/auth/login`**
   - Email: `admin@wmscode.cl`
   - Contraseña: `Test1234`

2. **Copiar el `access_token` de la respuesta**

3. **Hacer clic en "Authorize" (botón arriba a la derecha)**

4. **Pegar el token en el formato:**
   ```
   Bearer <tu_token_aqui>
   ```

5. **Confirmar con "Authorize"**

6. **Ahora todos los endpoints usarán el token automáticamente**

---

## 📝 Endpoints Documentados

### POST `/api/v1/auth/login`
**Descripción:** Autentica un usuario con email y contraseña

**Request Body:**
```json
{
  "correo": "admin@wmscode.cl",
  "contrasena": "Test1234"
}
```

**Response (200 OK):**
```json
{
  "exito": true,
  "datos": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "usuario": {
      "id": 1,
      "empresa_id": 1,
      "correo": "admin@wmscode.cl",
      "nombre": "Admin",
      "apellido": "Sistema",
      "activo": true
    }
  },
  "mensaje": "Login exitoso",
  "errores": null
}
```

**Posibles Errores:**
- `401 Unauthorized`: Correo o contraseña incorrectos
- `400 Bad Request`: Email inválido

---

### POST `/api/v1/auth/registrar`
**Descripción:** Registra un nuevo usuario en la empresa

**Request Body:**
```json
{
  "correo": "nuevo@empresa.cl",
  "contrasena": "Password123",
  "nombre": "Juan",
  "apellido": "Pérez",
  "rut": "15.555.555-5"
}
```

**Response (201 Created):**
```json
{
  "exito": true,
  "datos": {
    "id": 3,
    "empresa_id": 1,
    "correo": "nuevo@empresa.cl",
    "nombre": "Juan",
    "apellido": "Pérez",
    "rut": "15.555.555-5",
    "activo": true,
    "fecha_creacion": "2026-05-10T14:45:00"
  },
  "mensaje": "Usuario registrado exitosamente",
  "errores": null
}
```

**Validaciones:**
- Contraseña mínimo 8 caracteres
- Contraseña debe incluir mayúscula y número
- Correo único por empresa
- Email válido

**Posibles Errores:**
- `400 Bad Request`: Validación fallida
- `401 Unauthorized`: Empresa no existe

---

## 🎓 Características de la Documentación

### ✅ Información por Endpoint
- Descripción completa del funcionamiento
- Request examples (ejemplos de solicitud)
- Response examples (ejemplos de respuesta)
- Status codes posibles
- Validaciones automáticas

### ✅ Schemas Automáticos
- Definición de tipos de datos
- Campos requeridos vs opcionales
- Validaciones (min_length, max_length, etc.)
- Valores por defecto

### ✅ Try It Out (Probar)
En Swagger UI, cada endpoint tiene un botón **"Try it out"** que permite:
1. Modificar los parámetros
2. Ejecutar la solicitud
3. Ver la respuesta real
4. Copiar el comando CURL

### ✅ Ejemplos Inline
Todos los DTOs incluyen ejemplos que se muestran en la documentación

---

## 🔍 Inspeccionar Requests/Responses

En Swagger UI, después de ejecutar un endpoint, puedes ver:

1. **Request URL:** Exactamente dónde se envió
2. **Request Body:** Datos que se enviaron
3. **Response Body:** Respuesta del servidor
4. **Response Headers:** Metadatos de la respuesta
5. **cURL:** Comando equivalente para terminal

---

## 📲 Integración con Herramientas

### Postman
1. Ir a `http://localhost:8000/openapi.json`
2. Copiar el contenido JSON
3. En Postman: `File > Import > Raw text > Pegar`
4. Los endpoints se importarán automáticamente

### Insomnia
1. `Create > Design Document`
2. `Create > Request > Import from URL`
3. URL: `http://localhost:8000/openapi.json`

### VS Code (Thunder Client)
1. Instalar extensión "Thunder Client"
2. `Import > OpenAPI 3.0`
3. URL: `http://localhost:8000/openapi.json`

---

## 🚀 Tips y Trucos

### Copiar cURL desde Swagger
1. Ejecutar un endpoint en Swagger UI
2. Hacer clic en la pestaña **"cURL"**
3. Copiar el comando
4. Ejecutar en terminal

### Guardar Respuestas
En Swagger UI, las respuestas quedan en el historial durante la sesión. Para guardar:
- Copiar manualmente
- Usar herramientas de captura
- Exportar a Postman

### Usar el Token Entre Pestañas
Si cierras el navegador, el token se pierde. Para mantenerlo:
1. Copiar el `access_token`
2. Guardar en un archivo .txt temporal
3. Pegarlo en el siguiente Authorize

---

## 📖 Próxima Documentación

Conforme se agreguen más endpoints, la documentación de Swagger se actualizará automáticamente:

- [ ] `/api/v1/usuarios/*` - CRUD de usuarios
- [ ] `/api/v1/empresas/*` - CRUD de empresas
- [ ] `/api/v1/productos/*` - CRUD de productos
- [ ] `/api/v1/inventario/*` - Movimientos de stock
- [ ] `/api/v1/ordenes/*` - Órdenes de compra/venta

Cada nuevo endpoint incluirá su propia documentación Swagger completa.

---

## 🆘 Troubleshooting

**Problema:** "Swagger UI no carga"
- **Solución:** Verifica que el servidor esté corriendo y visita `http://localhost:8000/docs`

**Problema:** "Token no funciona en otros endpoints"
- **Solución:** El token solo se almacena mientras la sesión esté activa. Vuelve a hacer login.

**Problema:** "No veo ejemplos en la documentación"
- **Solución:** Los ejemplos están definidos en los DTOs con `Config.schema_extra`. Recarga el navegador (Ctrl+F5)

**Problema:** "La contraseña muestra caracteres especiales"
- **Solución:** Es normal - Swagger muestra `•••••••` por seguridad en el UI, pero el valor real se envía correctamente

---

**Última actualización:** 10 de Mayo de 2026
**Versión API:** 1.0.0
