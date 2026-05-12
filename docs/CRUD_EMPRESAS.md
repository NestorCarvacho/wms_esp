# CRUD de Empresas - Documentación

## Descripción General
El CRUD de empresas proporciona endpoints para gestionar las empresas (tenants) en el sistema WMS multi-tenant. Solo accesible por super admin.

## Arquitectura

### Capas Implementadas

1. **Capa de Datos** (`app/infrastructure/repositories/empresa_crud_repository.py`)
   - `EmpresaCRUDRepository`: Acceso directo a la base de datos
   - Métodos: listar, obtener_por_id, obtener_por_codigo, crear, actualizar, eliminar

2. **Capa de Negocio** (`app/domain/services/empresa_service.py`)
   - `EmpresaService`: Lógica de negocio y validaciones
   - Orquestación de operaciones CRUD

3. **Capa de Presentación** (`app/api/v1/endpoints/empresas.py`)
   - 5 endpoints REST: GET (listar), GET (detalle), POST (crear), PUT (actualizar), DELETE (eliminar)
   - Validación de autenticación y autorización (super admin)

4. **Schemas** (`app/schemas/empresa.py`)
   - DTOs Pydantic para validación automática
   - EmpresaCrearDTO, EmpresaActualizarDTO, EmpresaRespuestaDTO, EmpresaListaDTO

## Endpoints

### 1. GET - Listar Empresas
```
GET /api/v1/empresas?pagina=1&por_pagina=10&solo_activas=false
```

**Headers:**
- `Authorization: Bearer <token_jwt>`

**Query Parameters:**
- `pagina`: Número de página (default: 1)
- `por_pagina`: Empresas por página (default: 10)
- `solo_activas`: Si True, solo lista empresas activas (default: false)

**Response (200):**
```json
{
  "exito": true,
  "datos": {
    "total": 5,
    "pagina": 1,
    "por_pagina": 10,
    "empresas": [
      {
        "id": 1,
        "codigo": "EMP001",
        "nombre": "Almacén Central S.A.",
        "rut": "76.555.555-5",
        "esta_activa": true,
        "creado_at": "2026-05-12T10:30:00"
      }
    ]
  },
  "mensaje": "Se encontraron 5 empresas"
}
```

**Permisos:**
- Requiere token JWT válido
- Solo super admin puede listar

---

### 2. GET - Obtener Empresa por ID
```
GET /api/v1/empresas/{id}
```

**Headers:**
- `Authorization: Bearer <token_jwt>`

**Path Parameters:**
- `id`: ID de la empresa

**Response (200):**
```json
{
  "exito": true,
  "datos": {
    "id": 1,
    "codigo": "EMP001",
    "nombre": "Almacén Central S.A.",
    "rut": "76.555.555-5",
    "esta_activa": true,
    "creado_at": "2026-05-12T10:30:00"
  },
  "mensaje": "Empresa obtenida exitosamente"
}
```

**Errores:**
- 404: Empresa no encontrada
- 403: No autorizado (no es super admin)

---

### 3. POST - Crear Empresa
```
POST /api/v1/empresas
```

**Headers:**
- `Authorization: Bearer <token_jwt>`
- `Content-Type: application/json`

**Body:**
```json
{
  "codigo": "EMP002",
  "nombre": "Almacén Sucursal Norte",
  "rut": "77.666.666-6"
}
```

**Response (201):**
```json
{
  "exito": true,
  "datos": {
    "id": 2,
    "codigo": "EMP002",
    "nombre": "Almacén Sucursal Norte",
    "rut": "77.666.666-6",
    "esta_activa": true,
    "creado_at": "2026-05-12T11:45:00"
  },
  "mensaje": "Empresa creada exitosamente"
}
```

**Validaciones:**
- `codigo`: Requerido, máximo 50 caracteres, debe ser único
- `nombre`: Requerido, máximo 255 caracteres
- `rut`: Opcional, máximo 50 caracteres

**Errores:**
- 400: Código ya existe
- 422: Datos inválidos
- 403: No autorizado (no es super admin)

---

### 4. PUT - Actualizar Empresa
```
PUT /api/v1/empresas/{id}
```

**Headers:**
- `Authorization: Bearer <token_jwt>`
- `Content-Type: application/json`

**Path Parameters:**
- `id`: ID de la empresa

**Body:**
```json
{
  "nombre": "Almacén Sucursal Norte - Actualizado",
  "rut": "77.666.666-6",
  "esta_activa": true
}
```

**Response (200):**
```json
{
  "exito": true,
  "datos": {
    "id": 2,
    "codigo": "EMP002",
    "nombre": "Almacén Sucursal Norte - Actualizado",
    "rut": "77.666.666-6",
    "esta_activa": true,
    "creado_at": "2026-05-12T11:45:00"
  },
  "mensaje": "Empresa actualizada exitosamente"
}
```

**Validaciones:**
- Todos los campos son opcionales
- Solo se actualizan los campos proporcionados
- No se puede cambiar el código

**Errores:**
- 404: Empresa no encontrada
- 422: Datos inválidos
- 403: No autorizado (no es super admin)

---

### 5. DELETE - Eliminar Empresa
```
DELETE /api/v1/empresas/{id}
```

**Headers:**
- `Authorization: Bearer <token_jwt>`

**Path Parameters:**
- `id`: ID de la empresa

**Response (200):**
```json
{
  "exito": true,
  "datos": {
    "mensaje": "Empresa con ID 2 eliminada correctamente"
  },
  "mensaje": "Empresa eliminada exitosamente"
}
```

**Comportamiento:**
- Implementa soft delete (desactiva en lugar de eliminar)
- No elimina registros relacionados

**Errores:**
- 404: Empresa no encontrada
- 403: No autorizado (no es super admin)

---

## Flujo Multi-Tenant

### Aislamiento de Datos
- El CRUD de empresas **NO filtra por empresa_id** (acceso global solo para super admin)
- Las relaciones entre usuarios, productos, etc., están aisladas por empresa_id
- Los super admins pueden ver y gestionar TODAS las empresas

### Validaciones de Seguridad
1. Token JWT válido (autenticación)
2. Usuario debe ser super admin (autorización)
3. Código de empresa debe ser único
4. No se permite cruzar datos entre empresas

## Modelos de Datos

### Tabla `empresas`
```sql
CREATE TABLE empresas (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rut VARCHAR(50),
    esta_activa BOOLEAN DEFAULT TRUE,
    creado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### ORM (SQLAlchemy)
```python
class Empresa(Base):
    __tablename__ = "empresas"
    
    id = Column(BigInteger, primary_key=True, index=True)
    codigo = Column(String(50), unique=True, nullable=False, index=True)
    nombre = Column(String(255), nullable=False)
    rut = Column(String(50), nullable=True)
    esta_activa = Column(Boolean, default=True)
    creado_at = Column(DateTime, default=datetime.utcnow)
    
    usuarios = relationship("Usuario", back_populates="empresa")
```

## Archivos Creados

1. **Schemas:** `app/schemas/empresa.py`
   - DTOs Pydantic para validación

2. **Repository:** `app/infrastructure/repositories/empresa_crud_repository.py`
   - Acceso a datos

3. **Service:** `app/domain/services/empresa_service.py`
   - Lógica de negocio

4. **Endpoints:** `app/api/v1/endpoints/empresas.py`
   - 5 endpoints REST

5. **Modificado:** `app/main.py`
   - Registro del router de empresas

6. **Modificado:** `app/api/v1/endpoints/__init__.py`
   - Exportación del módulo empresas

## Ejemplo de Uso con cURL

### Crear empresa
```bash
curl -X POST http://localhost:8000/api/v1/empresas \
  -H "Authorization: Bearer <token_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "EMP001",
    "nombre": "Almacén Central S.A.",
    "rut": "76.555.555-5"
  }'
```

### Listar empresas
```bash
curl -X GET "http://localhost:8000/api/v1/empresas?pagina=1&por_pagina=10" \
  -H "Authorization: Bearer <token_jwt>"
```

### Obtener empresa por ID
```bash
curl -X GET http://localhost:8000/api/v1/empresas/1 \
  -H "Authorization: Bearer <token_jwt>"
```

### Actualizar empresa
```bash
curl -X PUT http://localhost:8000/api/v1/empresas/1 \
  -H "Authorization: Bearer <token_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Almacén Central S.A. - Actualizado"
  }'
```

### Eliminar empresa
```bash
curl -X DELETE http://localhost:8000/api/v1/empresas/1 \
  -H "Authorization: Bearer <token_jwt>"
```

## Notas Importantes

- Solo super admin (empresa_id = 1) puede acceder a estos endpoints
- El soft delete mantiene integridad referencial
- El código de empresa debe ser único en todo el sistema
- Todos los campos de respuesta incluyen timestamps para auditoría
- Los errores siguen el estándar HTTP y retornan mensajes descriptivos
