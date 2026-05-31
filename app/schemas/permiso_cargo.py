"""
Schemas (DTOs) para Permisos Cargo (relación cargo ↔ rol).
"""
from pydantic import BaseModel, Field
from typing import Optional


class PermisoCargoCrearDTO(BaseModel):
    cargo_id: int = Field(..., description="ID del cargo")
    rol_id: int = Field(..., description="ID del rol")
    activo: int = Field(1, description="Estado del permiso (1 activo, 0 inactivo)")


class PermisoCargoActualizarDTO(BaseModel):
    activo: Optional[int] = Field(None, description="Estado del permiso (1 activo, 0 inactivo)")


class PermisoCargoRespuestaDTO(BaseModel):
    cargo_id: int
    rol_id: int
    activo: bool
    cargo_nombre: Optional[str] = None
    rol_nombre: Optional[str] = None
    empresa_id: Optional[int] = None

    class Config:
        from_attributes = True


class RespuestaAPIDTO(BaseModel):
    exito: bool
    datos: Optional[dict] = None
    mensaje: str
