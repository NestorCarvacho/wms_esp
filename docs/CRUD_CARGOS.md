# CRUD de Cargos - Documentación

## Descripción General
El CRUD de cargos proporciona endpoints para gestionar los puestos de trabajo dentro de cada empresa. Un cargo pertenece a una empresa y puede tener múltiples usuarios asociados. Sistema multi-tenant que permite a cada empresa administrar sus propios cargos.

## Arquitectura

### Capas Implementadas

1. **Capa de Datos** (`app/infrastructure/repositories/cargo_crud_repository.py`)
   - `CargoCRUDRepository`: Acceso directo a la base de datos
   - Métodos: listar, obtener_por_id, obtener_por_nombre, crear, actualizar, eliminar
   - Filtrado automático por empresa_id (multi-tenant)

2. **Capa de Negocio** (`app/domain/services/cargo_service.py`)
   - `CargoService`: Lógica de negocio y validaciones
   - Orquestación de operaciones CRUD
   - Validación de nombre único por empresa
   - Manejo de errores de negocio

3. **Capa de Presentación** (`app/api/v1/endpoints/cargos.py`)
   - 5 endpoints REST: GET (listar), GET (detalle), POST (crear), PUT (actualizar), DELETE (eliminar)
   - Validación de autenticación y autorización (multi-tenant)
   - Respuestas estandarizadas

4. **Schemas** (`app/schemas/cargo.py`)
   - DTOs Pydantic para validación automática
   - CargoCrearDTO, CargoActualizarDTO, CargoRespuestaDTO, CargoListaDTO

### Modelo de Datos
```
Tabla: cargos
├── id (BIGINT, PK, AUTO_INCREMENT)
├── empresa_id (BIGINT, FK → empresas.id)
├── nombre (VARCHAR(255), NOT NULL)
└── UNIQUE KEY: (nombre, empresa_id)
```

## Permisos y Validaciones

### Autenticación
- Todos los endpoints requieren JWT válido

### Autorización Multi-tenant
| Acción | Super Admin | Usuario Normal |
|--------|------------|----------------|
| Listar cargos | TODOS | Solo su empresa |
| Ver detalle | TODOS | Solo su empresa |
| Crear cargo | TODOS | Solo su empresa |
| Actualizar | TODOS | Solo su empresa |
| Eliminar | TODOS | Solo su empresa |

### Validaciones de Negocio
1. **Nombre único por empresa** - No pueden haber dos cargos con mismo nombre en una empresa
2. **Nombre no vacío** - 1-100 caracteres
3. **Empresa válida** - El cargo debe pertenecer a una empresa existente
4. **Integridad referencial** - Al crear usuario con cargo_id, validar que exista

---

## Endpoints

### 1. GET - Listar Cargos
```
GET /api/v1/cargos?pagina=1&por_pagina=10
```

**Headers:**
- `Authorization: Bearer <token_jwt>`

**Query Parameters:**
- `pagina`: Número de página (default: 1)
- `por_pagina`: Cargos por página (default: 10)

**Response (200):**
```json
{
  "exito": true,
  "datos": {
    "total": 5,
    "pagina": 1,
    "por_pagina": 10,
    "cargos": [
      {
        "id": 1,
        "nombre": "Administrador",
        "empresa_id": 1
      },
      {
        "id": 2,
        "nombre": "Operario de Bodega",
        "empresa_id": 1
      }
    ]
  },
  "mensaje": "Se encontraron 5 cargos"
}
```

**Comportamiento Multi-tenant:**
- Super admin (empresa_id=1): Ve todos los cargos
- Usuario normal: Ve solo cargos de su empresa

**Permisos:**
- Requiere autenticación JWT

---

### 2. GET - Obtener Cargo por ID
```
GET /api/v1/cargos/{id}
```

**Headers:**
- `Authorization: Bearer <token_jwt>`

**Path Parameters:**
- `id`: ID del cargo

**Response (200):**
```json
{
  "exito": true,
  "datos": {
    "id": 1,
    "nombre": "Administrador",
    "empresa_id": 1
  },
  "mensaje": "Cargo recuperado exitosamente"
}
```

**Errores:**
- **404 Not Found**: Cargo no encontrado o no pertenece a la empresa del usuario
- **403 Forbidden**: Usuario no autorizado para acceder a cargos de otra empresa

**Permisos:**
- Requiere autenticación JWT
- Usuario normal solo puede ver cargos de su empresa
- Super admin puede ver cualquier cargo

---

### 3. POST - Crear Cargo
```
POST /api/v1/cargos
```

**Headers:**
- `Authorization: Bearer <token_jwt>`
- `Content-Type: application/json`

**Body:**
```json
{
  "nombre": "Operario de Bodega"
}
```

**Response (201 Created):**
```json
{
  "exito": true,
  "datos": {
    "id": 3,
    "nombre": "Operario de Bodega",
    "empresa_id": 1
  },
  "mensaje": "Cargo creado exitosamente"
}
```

**Errores:**
- **400 Bad Request**: 
  - Nombre vacío o duplicado en la empresa
  - Datos inválidos
- **422 Unprocessable Entity**: Validación de Pydantic falló

**Validaciones:**
- Nombre requerido (1-100 caracteres)
- Nombre único por empresa
- Usuario normal solo puede crear en su empresa

**Permisos:**
- Requiere autenticación JWT
- Usuario normal solo crea en su empresa
- Super admin puede crear en cualquier empresa

---

### 4. PUT - Actualizar Cargo
```
PUT /api/v1/cargos/{id}
```

**Headers:**
- `Authorization: Bearer <token_jwt>`
- `Content-Type: application/json`

**Path Parameters:**
- `id`: ID del cargo a actualizar

**Body:**
```json
{
  "nombre": "Operario Senior"
}
```

**Response (200):**
```json
{
  "exito": true,
  "datos": {
    "id": 3,
    "nombre": "Operario Senior",
    "empresa_id": 1
  },
  "mensaje": "Cargo actualizado exitosamente"
}
```

**Errores:**
- **404 Not Found**: Cargo no encontrado
- **400 Bad Request**: 
  - Nombre duplicado en la empresa
  - Datos inválidos
- **403 Forbidden**: Usuario no autorizado (cargo de otra empresa)

**Validaciones:**
- Validar nombre único si se actualiza
- Cargo debe existir
- Cargo debe pertenecer a la empresa del usuario (multi-tenant)

**Permisos:**
- Requiere autenticación JWT
- Usuario normal solo actualiza en su empresa
- Super admin puede actualizar en cualquier empresa

---

### 5. DELETE - Eliminar Cargo
```
DELETE /api/v1/cargos/{id}
```

**Headers:**
- `Authorization: Bearer <token_jwt>`

**Path Parameters:**
- `id`: ID del cargo a eliminar

**Response (200):**
```json
{
  "exito": true,
  "datos": {
    "mensaje": "Cargo 'Operario de Bodega' eliminado exitosamente"
  },
  "mensaje": "Cargo eliminado exitosamente"
}
```

**Errores:**
- **404 Not Found**: Cargo no encontrado
- **403 Forbidden**: Usuario no autorizado (cargo de otra empresa)

**Validaciones:**
- Cargo debe existir
- Cargo debe pertenecer a la empresa del usuario (multi-tenant)
- **Nota**: Los usuarios asociados al cargo tendrán cargo_id = NULL (SET NULL en FK)

**Permisos:**
- Requiere autenticación JWT
- Usuario normal solo elimina en su empresa
- Super admin puede eliminar en cualquier empresa

---

## Ejemplos de Uso

### Crear cargo
```bash
curl -X POST http://localhost:8000/api/v1/cargos \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Operario de Bodega"
  }'
```

### Listar cargos
```bash
curl -X GET "http://localhost:8000/api/v1/cargos?pagina=1&por_pagina=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Obtener cargo específico
```bash
curl -X GET http://localhost:8000/api/v1/cargos/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Actualizar cargo
```bash
curl -X PUT http://localhost:8000/api/v1/cargos/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Operario Senior"
  }'
```

### Eliminar cargo
```bash
curl -X DELETE http://localhost:8000/api/v1/cargos/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Respuestas de Error

### Error 400 - Nombre Duplicado
```json
{
  "exito": false,
  "mensaje": "Ya existe un cargo con el nombre 'Operario de Bodega' en esta empresa"
}
```

### Error 404 - Cargo No Encontrado
```json
{
  "exito": false,
  "mensaje": "Cargo no encontrado"
}
```

### Error 403 - No Autorizado
```json
{
  "exito": false,
  "mensaje": "No tiene permiso para acceder a cargos de otras empresas"
}
```

---

## Estructura de Directorio

```
app/
├── schemas/
│   └── cargo.py
├── infrastructure/
│   ├── models/
│   │   └── usuario.py (contiene modelo Cargo)
│   └── repositories/
│       └── cargo_crud_repository.py
├── domain/
│   └── services/
│       └── cargo_service.py
└── api/
    └── v1/
        └── endpoints/
            └── cargos.py
```

---

## Relaciones con Otros Modelos

### Cargos ↔ Usuarios
- Un cargo puede tener múltiples usuarios
- Un usuario puede tener un cargo (opcional)
- Al eliminar un cargo, los usuarios quedan sin cargo (SET NULL en FK)

### Cargos ↔ Roles (Futuro)
- Relación N:N entre cargos y roles
- Tabla intermedia: permisos_cargo
- Permitirá asignar múltiples roles a un cargo

---

## Características Implementadas

✅ Multi-tenant seguro (filtrado por empresa_id)
✅ Paginación en listados
✅ Validaciones robustas
✅ Manejo de errores HTTP estándar
✅ DTOs Pydantic con validación automática
✅ Endpoints RESTful siguiendo estándares
✅ Documentación en docstrings
✅ Aislamiento de datos por empresa
✅ Respuestas estandarizadas

---

## Integración con Usuarios

Cuando se crea un usuario, se puede asignar un cargo:

```bash
POST /api/v1/usuarios
{
  "email": "juan@empresa.cl",
  "contrasena": "Password123",
  "nombre_completo": "Juan Pérez",
  "cargo_id": 5
}
```

El sistema validará que:
- El cargo existe
- El cargo pertenece a la misma empresa del usuario

---

## Próximos Pasos

- [ ] Implementar asignación de roles a cargos
- [ ] Implementar endpoint para listar usuarios por cargo
- [ ] Crear endpoint para validar disponibilidad de cargo
- [ ] Implementar soft delete (cambiar estado en lugar de eliminar físicamente)
- [ ] Agregar campos adicionales: descripción, salario base, beneficios, etc.
