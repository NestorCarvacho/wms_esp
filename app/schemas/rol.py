"""
Schemas (DTOs) para Roles.
Validación automática con Pydantic.
"""
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional


# ============ ROL ============
class RolCrearDTO(BaseModel):
    """DTO para crear un nuevo rol."""
    nombre: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Nombre del rol (1-100 caracteres)"
    ),
    cargo_id: Optional[int] = Field(
        None,
        description="ID del cargo asociado (opcional, pero recomendado)"
    ),
    descripcion: Optional[str] = Field(
        None,
        max_length=255,
        description="Descripción del rol (opcional, máximo 255 caracteres)"
    ),
    activo: Optional[int] = Field(
        1,
        description="Indica si el rol está activo (1) o inactivo (0). Por defecto es 1 (activo)."
    )
    
    @validator("nombre")
    def validar_nombre(cls, v):
        """Valida que el nombre no esté vacío y sea válido."""
        if not v.strip():
            raise ValueError("El nombre del rol no puede estar vacío")
        return v.strip()
    
    class Config:
        schema_extra = {
            "example": {
                "nombre": "Receptor",
                "cargo_id": 1,
                "descripcion": "Rol para recibir mercancías",
                "activo": 1
            }
        }


class RolActualizarDTO(BaseModel):
    """DTO para actualizar un rol existente."""
    nombre: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        description="Nombre del rol (1-100 caracteres)"
    ),
    cargo_id: Optional[int] = Field(
        None,
        description="ID del cargo asociado (opcional, pero recomendado)"
    ),
    descripcion: Optional[str] = Field(
        None,
        max_length=255,
        description="Descripción del rol (opcional, máximo 255 caracteres)"
    ),
    activo: Optional[bool] = Field(
        None,
        description="Indica si el rol está activo (1) o inactivo (0)."
    )
    
    @validator("nombre")
    def validar_nombre(cls, v):
        """Valida que el nombre no esté vacío si se proporciona."""
        if v is not None and not v.strip():
            raise ValueError("El nombre del rol no puede estar vacío")
        return v.strip() if v else None
    
    class Config:
        schema_extra = {
            "example": {
                "nombre": "Recepcionista",
                "cargo_id": 1,
                "descripcion": "Encargado de recepcion del wms",
                "activo": 1
            }
        }


class RolRespuestaDTO(BaseModel):
    """DTO para respuesta de rol detallado."""
    id: int
    empresa_id: int
    nombre: str
    descripcion: Optional[str] = None
    activo: bool
    cargo_id: Optional[int] = None

    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": 1,
                "empresa_id": 1,
                "nombre": "Packer",
                "descripcion": "Encargado de empacar productos",
                "activo": 1,
                "cargo_id": 1
            }
        }


class RolListaDTO(BaseModel):
    """DTO para rol en lista."""
    id: int
    empresa_id: int
    nombre: str
    descripcion: Optional[str] = None
    activo: bool
    cargo_id: Optional[int] = None
    
    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": 1,
                "empresa_id": 1,
                "nombre": "Packer",
                "descripcion": "Encargado de empacar productos",
                "activo": 1,
                "cargo_id": 1
            }
        }


class RespuestaAPIDTO(BaseModel):
    """Estructura estándar de respuesta API."""
    exito: bool
    datos: Optional[dict] = None
    mensaje: str
    
    class Config:
        schema_extra = {
            "example": {
                "exito": True,
                "datos": {
                    "id": 1,
                    "empresa_id": 1,
                    "nombre": "Packer",
                    "descripcion": "Encargado de empacar productos",
                    "activo": 1,
                    "cargo_id": 1
                },
                "mensaje": "Operación completada exitosamente"
            }
        }
