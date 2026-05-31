"""Schemas (DTOs) para TipoZona."""
from pydantic import BaseModel, Field, validator
from typing import Optional


class TipoZonaCrearDTO(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=50)

    @validator("nombre")
    def validar_nombre(cls, v):
        if not v.strip():
            raise ValueError("El nombre no puede estar vacío")
        return v.strip()


class TipoZonaActualizarDTO(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=50)
    activo: Optional[int] = Field(None)

    @validator("nombre")
    def validar_nombre(cls, v):
        if v is not None and not v.strip():
            raise ValueError("El nombre no puede estar vacío")
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
