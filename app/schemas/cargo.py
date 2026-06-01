"""
Schemas (DTOs) para Cargos.
Validación automática con Pydantic.
"""
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional


# ============ CARGO ============
class CargoCrearDTO(BaseModel):
    """DTO para crear un nuevo cargo."""
    nombre: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Nombre del cargo (1-100 caracteres)"
    )
    empresa_id: Optional[int] = Field(None, description="Empresa destino (solo empresa maestra)")
    
    @validator("nombre")
    def validar_nombre(cls, v):
        """Valida que el nombre no esté vacío y sea válido."""
        if not v.strip():
            raise ValueError("El nombre del cargo no puede estar vacío")
        return v.strip()
    
    class Config:
        json_schema_extra = {
            "example": {
                "nombre": "Operario de Bodega"
            }
        }


class CargoActualizarDTO(BaseModel):
    """DTO para actualizar un cargo existente."""
    nombre: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        description="Nombre del cargo (1-100 caracteres)"
    )
    
    @validator("nombre")
    def validar_nombre(cls, v):
        """Valida que el nombre no esté vacío si se proporciona."""
        if v is not None and not v.strip():
            raise ValueError("El nombre del cargo no puede estar vacío")
        return v.strip() if v else None
    
    class Config:
        json_schema_extra = {
            "example": {
                "nombre": "Operario Senior"
            }
        }


class CargoRespuestaDTO(BaseModel):
    """DTO para respuesta de cargo detallado."""
    id: int
    empresa_id: int
    nombre: str
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "empresa_id": 1,
                "nombre": "Administrador"
            }
        }


class CargoListaDTO(BaseModel):
    """DTO para cargo en lista."""
    id: int
    nombre: str
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "nombre": "Administrador"
            }
        }


class RespuestaAPIDTO(BaseModel):
    """Estructura estándar de respuesta API."""
    exito: bool
    datos: Optional[dict] = None
    mensaje: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "exito": True,
                "datos": {
                    "id": 1,
                    "nombre": "Administrador",
                    "empresa_id": 1
                },
                "mensaje": "Operación completada exitosamente"
            }
        }
