"""Schemas para permisos atómicos."""
from pydantic import BaseModel, Field
from typing import Optional


class PermisoCrearDTO(BaseModel):
    codigo: str = Field(..., min_length=1, max_length=100)
    descripcion: Optional[str] = Field(None, max_length=255)
    activo: Optional[int] = 1
    empresa_id: Optional[int] = Field(None, description="Empresa destino (solo empresa maestra)")


class PermisoActualizarDTO(BaseModel):
    codigo: Optional[str] = Field(None, min_length=1, max_length=100)
    descripcion: Optional[str] = Field(None, max_length=255)
    activo: Optional[bool] = None


class PermisoRespuestaDTO(BaseModel):
    id: int
    empresa_id: int
    codigo: str
    descripcion: Optional[str] = None
    activo: bool

    class Config:
        from_attributes = True


class RolPermisoSincronizarDTO(BaseModel):
    permiso_ids: list[int] = Field(default_factory=list)
