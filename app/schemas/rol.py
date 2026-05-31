"""
Schemas (DTOs) para Roles.
"""
from pydantic import BaseModel, Field, validator
from typing import Optional


class RolCrearDTO(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    descripcion: Optional[str] = Field(None, max_length=255)
    activo: Optional[int] = 1
    
    @validator("nombre")
    def validar_nombre(cls, v):
        if not v.strip():
            raise ValueError("El nombre del rol no puede estar vacío")
        return v.strip()


class RolActualizarDTO(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=100)
    descripcion: Optional[str] = Field(None, max_length=255)
    activo: Optional[bool] = None
    
    @validator("nombre")
    def validar_nombre(cls, v):
        if v is not None and not v.strip():
            raise ValueError("El nombre del rol no puede estar vacío")
        return v.strip() if v else None


class RolRespuestaDTO(BaseModel):
    id: int
    empresa_id: int
    nombre: str
    descripcion: Optional[str] = None
    activo: bool

    class Config:
        from_attributes = True


class RolListaDTO(BaseModel):
    id: int
    empresa_id: int
    nombre: str
    descripcion: Optional[str] = None
    activo: bool
    
    class Config:
        from_attributes = True


class RespuestaAPIDTO(BaseModel):
    exito: bool
    datos: Optional[dict] = None
    mensaje: str
