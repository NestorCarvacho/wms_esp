# WMS Multi-Tenant - Setup y Guía de Uso

## 📋 Requisitos Previos

- Python 3.9+
- MySQL 8.0+
- Git

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone <repo>
cd wms_esp
```

### 2. Crear entorno virtual
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate  # Windows
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus datos de BD
```

### 5. Crear base de datos e iniciar el servidor
```bash
# Crear BD (ver mysql-init/01_setup.sql)
mysql -u root -p < mysql-init/01_setup.sql

# Iniciar servidor
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📚 API Endpoints

### Autenticación (`/api/v1/auth/`)
- `POST /login` - Login con correo y contraseña
- `POST /registrar` - Registrar nuevo usuario

### Documentación Interactiva
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

## 🏗️ Estructura del Proyecto

```
app/
├── api/v1/endpoints/       # Controladores (Capa Presentación)
│   └── auth.py
├── core/                   # Configuración y seguridad
│   ├── config.py
│   └── security.py
├── domain/services/        # Lógica de negocio
│   └── auth_service.py
├── infrastructure/         # Acceso a datos
│   ├── database.py
│   ├── models/
│   └── repositories/
├── schemas/               # DTOs (Validación)
└── main.py               # Entrada de la app
```

## 🔐 Arquitectura de Capas

1. **Presentación** (`api/v1/endpoints/`) - Controllers y DTOs
2. **Negocio** (`domain/services/`) - Lógica de dominio
3. **Datos** (`infrastructure/`) - Repositorios y ORM
4. **Seguridad** (`core/security.py`) - JWT, BCrypt

## 📝 Regla de Oro: Multi-tenancy

Todo acceso a datos **DEBE filtrar por `empresa_id`**:
- Se extrae del JWT del usuario autenticado
- Nunca se recibe como parámetro del body
- Garantiza aislamiento entre empresas

## 🛠️ Próximos Pasos

- [ ✅ ] Crear endpoints de usuarios
- [ ✅ ] Crear endpoints de empresas
- [ ] Crear endpoints de productos
- [ ] Crear endpoints de inventario
- [ ] Crear endpoints de órdenes
- [ ] Implementar middleware de autenticación global

## 📞 Soporte

Ver documentación en `docs/capas/` para detalles de cada capa.
