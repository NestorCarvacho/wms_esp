"""

Schemas (DTOs) para validación de entrada/salida.
Validación automática con Pydantic.
"""
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime, date
from typing import Optional, List


# ============ USUARIO ============
class UsuarioCrearDTO(BaseModel):
    """DTO para crear un nuevo usuario."""
    email: EmailStr = Field(..., description="Email único del usuario")
    contrasena: str = Field(..., min_length=8, max_length=72, description="Mínimo 8 caracteres, debe incluir mayúscula y número")
    cargo_id: Optional[int] = Field(None, description="ID del cargo (define roles vía cargo_rol)")
    empresa_id: Optional[int] = Field(None, description="ID de la empresa (solo para super admin, opcional)")
    
    @validator("contrasena")
    def validar_contrasena(cls, v):
        """Valida que la contraseña sea fuerte."""
        if not any(c.isupper() for c in v):
            raise ValueError("La contraseña debe contener al menos una mayúscula")
        if not any(c.isdigit() for c in v):
            raise ValueError("La contraseña debe contener al menos un número")
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "juan.perez@empresa.cl",
                "contrasena": "Password123",
                "cargo_id": 1,
                "empresa_id": 2
            }
        }


class UsuarioRespuestaDTO(BaseModel):
    """DTO para respuesta de usuario (sin contraseña)."""
    id: int
    empresa_id: int
    cargo_id: Optional[int] = None
    email: str
    activo: bool
    ultimo_login: Optional[datetime] = None
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    perfil: Optional["PerfilUsuarioRespuestaDTO"] = None
    empresa_nombre: Optional[str] = None
    cargo_nombre: Optional[str] = None
    es_empresa_maestra: bool = False
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "empresa_id": 1,
                "cargo_id": 2,
                "email": "admin@wmscode.cl",
                "activo": True,
                "ultimo_login": "2024-05-20T10:30:00",
                "fecha_creacion": "2024-01-15T08:00:00",
                "fecha_actualizacion": "2024-05-20T10:30:00",
                "perfil": {
                    "usuario_id": 1,
                    "rut": "15.555.555-5",
                    "nombres": "Juan",
                    "apellido_paterno": "Pérez",
                    "apellido_materno": "García",
                    "genero": "M",
                    "telefono": "+56912345678",
                    "direccion": "Calle Principal 123",
                    "comuna": "Santiago",
                    "ciudad": "Santiago",
                    "region": "Metropolitana",
                    "pais": "Chile"
                }
            }
        }

class UsuarioActualizarDTO(BaseModel):
    """DTO para actualizar un usuario existente."""
    email: Optional[EmailStr] = Field(None, description="Email único del usuario")
    cargo_id: Optional[int] = Field(None, description="ID del cargo")
    contrasena: Optional[str] = Field(None, min_length=8, max_length=72, description="Nueva contraseña (opcional, mínimo 8 caracteres)")
    activo: Optional[bool] = Field(None, description="Indica si el usuario está activo")
    
    @validator("contrasena")
    def validar_contrasena(cls, v):
        """Valida que la contraseña sea fuerte si se proporciona."""
        if v is None:
            return v
        if not any(c.isupper() for c in v):
            raise ValueError("La contraseña debe contener al menos una mayúscula")
        if not any(c.isdigit() for c in v):
            raise ValueError("La contraseña debe contener al menos un número")
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "juan.perez@empresa.cl",
                "cargo_id": 1,
                "contrasena": "NewPassword123",
                "activo": True
            }
        }

class UsuarioListaDTO(BaseModel):
    """DTO para listar usuarios (sin contraseña)."""
    id: int
    empresa_id: int
    cargo_id: Optional[int] = None
    email: str
    activo: bool
    ultimo_login: Optional[datetime] = None
    fecha_creacion: datetime
    perfil: Optional["PerfilUsuarioRespuestaDTO"] = None
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "empresa_id": 1,
                "cargo_id": 2,
                "email": "juan.perez@empresa.cl",
                "activo": True,
                "ultimo_login": "2026-05-21T15:47:44",
                "fecha_creacion": "2026-05-21T11:38:10",
                "perfil": None
            }
        }


# ============ PERFIL USUARIO ============
class PerfilUsuarioCrearDTO(BaseModel):
    """DTO para crear perfil de usuario."""
    rut: Optional[str] = Field(None, max_length=20, description="RUT único del usuario")
    nombres: Optional[str] = Field(None, max_length=100, description="Nombre(s) del usuario")
    apellido_paterno: Optional[str] = Field(None, max_length=100, description="Apellido paterno")
    apellido_materno: Optional[str] = Field(None, max_length=100, description="Apellido materno")
    fecha_nacimiento: Optional[date] = Field(None, description="Fecha de nacimiento")
    genero: Optional[str] = Field(None, max_length=20, description="Género (M/F/Otro)")
    telefono: Optional[str] = Field(None, max_length=30, description="Número de teléfono")
    direccion: Optional[str] = Field(None, max_length=255, description="Calle y número")
    region_id: Optional[int] = Field(None, description="ID de región")
    ciudad_id: Optional[int] = Field(None, description="ID de ciudad")
    comuna_id: Optional[int] = Field(None, description="ID de comuna")
    pais: Optional[str] = Field(None, max_length=100, description="País")
    foto_url: Optional[str] = Field(None, max_length=500, description="URL de foto de perfil")
    biografia: Optional[str] = Field(None, description="Biografía o descripción personal")

    class Config:
        json_schema_extra = {
            "example": {
                "rut": "15.555.555-5",
                "nombres": "Juan",
                "apellido_paterno": "Pérez",
                "apellido_materno": "García",
                "fecha_nacimiento": "1990-05-20",
                "genero": "M",
                "telefono": "+56912345678",
                "direccion": "Calle Principal 123",
                "region_id": 7,
                "ciudad_id": 26,
                "comuna_id": 1,
                "pais": "Chile",
                "foto_url": "https://example.com/foto.jpg",
                "biografia": "Profesional con experiencia en logística"
            }
        }


class PerfilUsuarioRespuestaDTO(BaseModel):
    """DTO para respuesta de perfil de usuario."""
    usuario_id: int
    rut: Optional[str] = None
    nombres: Optional[str] = None
    apellido_paterno: Optional[str] = None
    apellido_materno: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    genero: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    region_id: Optional[int] = None
    ciudad_id: Optional[int] = None
    comuna_id: Optional[int] = None
    region_nombre: Optional[str] = None
    ciudad_nombre: Optional[str] = None
    comuna_nombre: Optional[str] = None
    pais: Optional[str] = None
    foto_url: Optional[str] = None
    biografia: Optional[str] = None

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "usuario_id": 1,
                "rut": "15.555.555-5",
                "nombres": "Juan",
                "apellido_paterno": "Pérez",
                "apellido_materno": "García",
                "fecha_nacimiento": "1990-05-20T00:00:00",
                "genero": "M",
                "telefono": "+56912345678",
                "direccion": "Calle Principal 123",
                "region_id": 7,
                "ciudad_id": 26,
                "comuna_id": 1,
                "region_nombre": "Metropolitana de Santiago",
                "ciudad_nombre": "Santiago",
                "comuna_nombre": "Providencia",
                "pais": "Chile",
                "foto_url": "https://example.com/foto.jpg",
                "biografia": "Profesional con experiencia en logística"
            }
        }


class PerfilUsuarioActualizarDTO(BaseModel):
    """DTO para actualizar perfil de usuario."""
    rut: Optional[str] = Field(None, max_length=20)
    nombres: Optional[str] = Field(None, max_length=100)
    apellido_paterno: Optional[str] = Field(None, max_length=100)
    apellido_materno: Optional[str] = Field(None, max_length=100)
    fecha_nacimiento: Optional[date] = None
    genero: Optional[str] = Field(None, max_length=20)
    telefono: Optional[str] = Field(None, max_length=30)
    direccion: Optional[str] = Field(None, max_length=255)
    region_id: Optional[int] = None
    ciudad_id: Optional[int] = None
    comuna_id: Optional[int] = None
    pais: Optional[str] = Field(None, max_length=100)
    foto_url: Optional[str] = Field(None, max_length=500)
    biografia: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "rut": "15.555.555-5",
                "nombres": "Juan",
                "apellido_paterno": "Pérez",
                "telefono": "+56912345678",
                "foto_url": "https://example.com/foto-actualizada.jpg"
            }
        }


# ============ AUTENTICACIÓN ============
class LoginRequestDTO(BaseModel):
    """DTO para solicitud de login."""
    email: EmailStr = Field(..., description="Email del usuario registrado")
    contrasena: str = Field(..., description="Contraseña del usuario", max_length=72)
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "admin@wmscode.cl",
                "contrasena": "Test1234"
            }
        }


def _validar_contrasena_fuerte(v: str) -> str:
    if len(v) < 8:
        raise ValueError("La contraseña debe tener al menos 8 caracteres")
    if not any(c.isupper() for c in v):
        raise ValueError("La contraseña debe contener al menos una mayúscula")
    if not any(c.isdigit() for c in v):
        raise ValueError("La contraseña debe contener al menos un número")
    return v


class ChangePasswordDTO(BaseModel):
    contrasena_actual: str = Field(..., max_length=72)
    contrasena_nueva: str = Field(..., min_length=8, max_length=72)

    @validator("contrasena_nueva")
    def validar_contrasena(cls, v):
        return _validar_contrasena_fuerte(v)


class TokenResponseDTO(BaseModel):
    """DTO para respuesta con token JWT."""
    acceso_token: str
    token_type: str = "bearer"
    usuario: UsuarioRespuestaDTO

class TokenPayload(BaseModel):
    """DTO para payload decodificado del JWT."""
    usuario_id: int
    empresa_id: int
    email: str
    cargo_id: Optional[int] = None
    exp: int
    roles: List[str] = Field(default_factory=list)
    permisos: List[str] = Field(default_factory=list)
    es_empresa_maestra: bool = False


# ============ EMPRESA ============
class EmpresaRespuestaDTO(BaseModel):
    """DTO para respuesta de empresa."""
    id: int
    codigo: str
    nombre: str
    rut: Optional[str]
    esta_activa: bool
    
    class Config:
        from_attributes = True


# ============ RESPUESTA UNIFICADA ============
class RespuestaAPIDTO(BaseModel):
    """DTO de respuesta unificada para todos los endpoints."""
    exito: bool = Field(..., description="Indica si la operación fue exitosa")
    datos: Optional[dict] = Field(None, description="Datos de la respuesta")
    mensaje: str = Field(..., description="Mensaje descriptivo de la operación")
    errores: Optional[List[str]] = Field(None, description="Lista de errores si los hay")
    
    class Config:
        json_schema_extra = {
            "example": {
                "exito": True,
                "datos": {"id": 1, "acceso_token": "eyJ..."},
                "mensaje": "Login exitoso",
                "errores": None
            }
        }
