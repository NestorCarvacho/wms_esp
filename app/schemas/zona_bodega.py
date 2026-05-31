"""Schemas (DTOs) para ZonaBodega."""
from pydantic import BaseModel, Field, validator
from typing import Optional


class ZonaBodegaCrearDTO(BaseModel):
    bodega_id: int = Field(..., gt=0)
    tipo_zona_id: int = Field(..., gt=0)
    nombre: Optional[str] = Field(None, max_length=100)
    activo: int = Field(1)

    @validator("nombre")
    def validar_nombre(cls, v):
        if v is not None and not v.strip():
            return None
        return v.strip() if v else None

    @validator("activo")
    def validar_activo(cls, v):
        if v not in (0, 1):
            raise ValueError("El campo 'activo' debe ser 0 o 1")
        return v


class ZonaBodegaActualizarDTO(BaseModel):
    bodega_id: Optional[int] = Field(None, gt=0)
    tipo_zona_id: Optional[int] = Field(None, gt=0)
    nombre: Optional[str] = Field(None, max_length=100)
    activo: Optional[int] = Field(None)

    @validator("nombre")
    def validar_nombre(cls, v):
        if v is not None and not v.strip():
            return None
        return v.strip() if v else None

    @validator("activo")
    def validar_activo(cls, v):
        if v is not None and v not in (0, 1):
            raise ValueError("El campo 'activo' debe ser 0 o 1")
        return v


class RespuestaAPIDTO(BaseModel):
    exito: bool
    datos: Optional[dict] = None
    mensaje: str
