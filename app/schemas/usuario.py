"""

Schemas (DTOs) para validación de entrada/salida.
Validación automática con Pydantic.
"""
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional, List


# ============ USUARIO ============
class UsuarioCrearDTO(BaseModel):
    """DTO para crear un nuevo usuario."""
    email: EmailStr = Field(..., description="Email único del usuario")
    contrasena: str = Field(..., min_length=8, max_length=72, description="Mínimo 8 caracteres, debe incluir mayúscula y número")
    nombre_completo: str = Field(..., min_length=1, max_length=255, description="nombre completo completo del usuario")
    rut: Optional[str] = Field(None, max_length=20, description="RUT (opcional)")
    cargo_id: Optional[int] = Field(None, description="ID del cargo (opcional)")
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
                "nombre_completo": "Juan Pérez García",
                "rut": "15.555.555-5",
                "cargo_id": 1,
                "empresa_id": 2
            }
        }


class UsuarioRespuestaDTO(BaseModel):
    """DTO para respuesta de usuario (sin contraseña)."""
    id: int
    empresa_id: int
    email: str
    nombre_completo: Optional[str] = None
    rut: Optional[str] = None
    esta_activo: bool
    ultimo_login: Optional[datetime] = None
    fecha_creacion: datetime
    fecha_actualizacion: datetime

    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "empresa_id": 1,
                "email": "admin@wmscode.cl",
                "nombre_completo": "Administrador",
                "rut": "11.111.111-1",
                "esta_activo": True
            }
        }

class UsuarioActualizarDTO(BaseModel):
    """DTO para actualizar un usuario existente."""
    email: Optional[EmailStr] = Field(None, description="Email único del usuario")
    nombre_completo: Optional[str] = Field(None, min_length=1, max_length=255, description="Nombre completo del usuario")
    rut: Optional[str] = Field(None, max_length=20, description="RUT (opcional)")
    cargo_id: Optional[int] = Field(None, description="ID del cargo (opcional)")
    contrasena: Optional[str] = Field(None, min_length=8, max_length=72, description="Nueva contraseña (opcional, mínimo 8 caracteres)")
    esta_activo: Optional[bool] = Field(None, description="Indica si el usuario está activo")
    
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
                "nombre_completo": "Juan Pérez García",
                "rut": "15.555.555-5",
                "cargo_id": 1,
                "contrasena": "NewPassword123",
                "esta_activo": True
            }
        }

class UsuarioListaDTO(BaseModel):
    """DTO para listar usuarios (sin contraseña)."""
    id: int
    empresa_id: int
    email: str
    nombre_completo: Optional[str] = None
    rut: Optional[str] = None
    esta_activo: bool
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "empresa_id": 1,
                "email": "juan.perez@empresa.cl",
                "nombre_completo": "Juan Pérez García",
                "rut": "15.555.555-5",
                "esta_activo": True
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
    cargo_id: int
    exp: int
    roles: List[str] = Field(default_factory=list)


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
