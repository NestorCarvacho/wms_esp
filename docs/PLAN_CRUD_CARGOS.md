# Plan CRUD de Cargos - WMS Multi-Tenant

## 📋 Descripción General
El CRUD de cargos (roles de trabajo) permite gestionar los puestos de trabajo dentro de cada empresa. Un cargo pertenece a una empresa y puede tener múltiples roles asociados.

---

## 🏗️ Arquitectura

### Modelo de Datos
```
Tabla: cargos
├── id (BIGINT, PK, AUTO_INCREMENT)
├── empresa_id (BIGINT, FK → empresas.id) - Multi-tenant
├── nombre (VARCHAR(100), NOT NULL)
└── UNIQUE KEY: (nombre, empresa_id)

Relación N:N:
permisos_cargo
├── cargo_id (BIGINT, FK → cargos.id)
└── rol_id (BIGINT, FK → roles.id)
```

### Capas a Implementar
1. **Schema (DTOs)** → `app/schemas/cargo.py`
2. **Repository** → `app/infrastructure/repositories/cargo_crud_repository.py`
3. **Service** → `app/domain/services/cargo_service.py`
4. **Endpoints** → `app/api/v1/endpoints/cargos.py`

---

## 📁 Archivos a Crear

### 1. `app/schemas/cargo.py`
**DTOs Pydantic para validación:**

```python
# DTOs necesarios:
- CargoCrearDTO
  - nombre: str (requerido, 1-100 caracteres)
  
- CargoActualizarDTO
  - nombre: str (opcional, 1-100 caracteres)
  
- CargoRespuestaDTO
  - id: int
  - empresa_id: int
  - nombre: str
  - creado_at: datetime (opcional)
  
- CargoListaDTO
  - id: int
  - nombre: str
```

---

### 2. `app/infrastructure/repositories/cargo_crud_repository.py`
**Acceso a datos con filtrado multi-tenant:**

```python
class CargoCRUDRepository:
    
    async def listar(
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 10,
        es_super_admin: bool = False
    ) -> tuple[list[Cargo], int]
    # Filtra por empresa_id si no es super_admin
    
    async def obtener_por_id(
        cargo_id: int,
        empresa_id: int = None
    ) -> Cargo | None
    # Si empresa_id es None, obtiene sin filtrar (super admin)
    
    async def obtener_por_nombre(
        nombre: str,
        empresa_id: int
    ) -> Cargo | None
    # Para validar nombre único por empresa
    
    async def crear(
        empresa_id: int,
        nombre: str
    ) -> Cargo
    # Crear nuevo cargo
    
    async def actualizar(
        cargo_id: int,
        empresa_id: int,
        nombre: str = None
    ) -> Cargo | None
    # Actualizar cargo existente
    
    async def eliminar(
        cargo_id: int,
        empresa_id: int
    ) -> bool
    # Soft delete (cambiar estado si aplica)
```

---

### 3. `app/domain/services/cargo_service.py`
**Lógica de negocio:**

```python
class CargoService:
    
    async def listar_cargos(
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 10,
        es_super_admin: bool = False
    ) -> Dict
    # Retorna: {total, pagina, por_pagina, cargos}
    
    async def obtener_cargo(
        cargo_id: int,
        empresa_id: int = None
    ) -> Dict
    # Retorna datos del cargo
    
    async def crear_cargo(
        empresa_id: int,
        nombre: str
    ) -> Dict
    # Validaciones:
    # - Nombre no vacío
    # - Nombre único por empresa
    # - Retorna cargo creado
    
    async def actualizar_cargo(
        cargo_id: int,
        empresa_id: int,
        nombre: str = None
    ) -> Dict
    # Solo actualizar campos válidos
    
    async def eliminar_cargo(
        cargo_id: int,
        empresa_id: int
    ) -> Dict
    # Retorna confirmación
```

---

### 4. `app/api/v1/endpoints/cargos.py`
**5 Endpoints REST:**

#### A. GET `/api/v1/cargos`
**Listar cargos con paginación**
```
Query Parameters:
- pagina: int = 1
- por_pagina: int = 10

Response:
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
      }
    ]
  },
  "mensaje": "Se encontraron 5 cargos"
}

Comportamiento multi-tenant:
- Super admin (empresa_id=1): Ve todos los cargos
- Usuario normal: Ve solo cargos de su empresa
```

#### B. GET `/api/v1/cargos/{id}`
**Obtener cargo por ID**
```
Response: { exito, datos: CargoRespuestaDTO, mensaje }
Errores: 404 (no encontrado)
```

#### C. POST `/api/v1/cargos`
**Crear cargo**
```
Body:
{
  "nombre": "Operario de Bodega"
}

Response: { exito, datos: CargoRespuestaDTO, mensaje }
Validaciones:
- Nombre requerido (1-100 caracteres)
- Nombre único por empresa
Errores: 400 (nombre duplicado), 422 (datos inválidos)
```

#### D. PUT `/api/v1/cargos/{id}`
**Actualizar cargo**
```
Body:
{
  "nombre": "Operario Senior"
}

Response: { exito, datos: CargoRespuestaDTO, mensaje }
Validaciones:
- Validar nombre único si se actualiza
Errores: 404 (no encontrado), 400 (nombre duplicado)
```

#### E. DELETE `/api/v1/cargos/{id}`
**Eliminar (desactivar) cargo**
```
Response: { exito, datos: {mensaje}, mensaje }
Validaciones:
- Verificar si hay usuarios con este cargo
- (Opcional) Impedir eliminar si hay usuarios asignados
Errores: 404 (no encontrado), 409 (conflicto - usuarios asignados)
```

---

## 🔒 Permisos y Validaciones

### Autenticación
- Todos los endpoints requieren JWT válido

### Autorización Multi-tenant
| Acción | Super Admin | Usuario Normal |
|--------|------------|----------------|
| Listar cargos | TODOS | Solo su empresa |
| Ver detalle | TODOS | Solo su empresa |
| Crear cargo | En cualquier empresa | Solo en su empresa |
| Actualizar | TODOS | Solo su empresa |
| Eliminar | TODOS | Solo su empresa |

### Validaciones de Negocio
1. **Nombre único por empresa** - No pueden haber dos cargos con mismo nombre en una empresa
2. **Nombre no vacío** - 1-100 caracteres
3. **Empresa válida** - El cargo debe pertenecer a una empresa existente
4. **Integridad referencial** - Al crear usuario con cargo_id, validar que exista

---

## 🎯 Caso de Uso: Crear Usuario con Cargo

Cuando se crea un usuario:
```
POST /api/v1/usuarios
{
  "email": "juan@empresa.cl",
  "contrasena": "Password123",
  "nombre_completo": "Juan Pérez",
  "cargo_id": 5  ← Validar que existe y pertenece a la misma empresa
}
```

El servicio de usuario debe validar:
```python
if dto.cargo_id:
    cargo = await cargo_repository.obtener_por_id(dto.cargo_id, empresa_id)
    if not cargo:
        raise ValueError(f"Cargo {dto.cargo_id} no existe en esta empresa")
```

---

## 📊 Estructura de Directorio Final

```
app/
├── schemas/
│   └── cargo.py ← NUEVO
├── infrastructure/
│   └── repositories/
│       └── cargo_crud_repository.py ← NUEVO
├── domain/
│   └── services/
│       └── cargo_service.py ← NUEVO
└── api/
    └── v1/
        └── endpoints/
            └── cargos.py ← NUEVO
```

---

## 🔄 Relación con Otros Modelos

### Cargos → Usuarios
- Un cargo puede tener múltiples usuarios
- Al eliminar cargo, usuarios quedan sin cargo (SET NULL en FK)

### Cargos → Roles
- Un cargo tiene múltiples roles (N:N)
- Tabla intermedia: permisos_cargo

---

## 📝 Orden de Implementación

1. ✅ Crear DTOs (`app/schemas/cargo.py`)
2. ✅ Crear Repositorio (`cargo_crud_repository.py`)
3. ✅ Crear Servicio (`cargo_service.py`)
4. ✅ Crear Endpoints (`endpoints/cargos.py`)
5. ✅ Registrar router en `app/main.py`
6. ✅ Actualizar `__init__.py` de endpoints
7. ✅ Crear documentación en `docs/CRUD_CARGOS.md`

---

## 🧪 Ejemplos de Prueba

### Crear cargo
```bash
curl -X POST http://localhost:8000/api/v1/cargos \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Operario de Bodega"}'
```

### Listar cargos
```bash
curl -X GET "http://localhost:8000/api/v1/cargos?pagina=1&por_pagina=10" \
  -H "Authorization: Bearer <token>"
```

### Obtener cargo específico
```bash
curl -X GET http://localhost:8000/api/v1/cargos/1 \
  -H "Authorization: Bearer <token>"
```

### Actualizar cargo
```bash
curl -X PUT http://localhost:8000/api/v1/cargos/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Operario Senior"}'
```

### Eliminar cargo
```bash
curl -X DELETE http://localhost:8000/api/v1/cargos/1 \
  -H "Authorization: Bearer <token>"
```

---

## ✨ Características

- ✅ Multi-tenant seguro (filtrado por empresa_id)
- ✅ Paginación en listados
- ✅ Validaciones robustas
- ✅ Manejo de errores HTTP estándar
- ✅ DTOs Pydantic con ejemplos
- ✅ Endpoints RESTful siguiendo estándares
- ✅ Documentación en docstrings

---

## 🚀 Próximos Pasos
- Implementar CRUD de Cargos
- Integrar permisos (roles) en cargos
- Crear endpoint para asignar roles a cargos
- Implementar CRUD de Productos
- Implementar CRUD de Inventario
