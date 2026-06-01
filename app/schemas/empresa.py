"""
Schemas (DTOs) para Empresas.
Validación automática con Pydantic.
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


# ============ EMPRESA ============
class EmpresaCrearDTO(BaseModel):
    """DTO para crear una nueva empresa."""
    codigo: str = Field(..., min_length=1, max_length=50, description="Código único de la empresa")
    nombre: str = Field(..., min_length=1, max_length=255, description="Nombre de la empresa")
    rut: Optional[str] = Field(None, max_length=50, description="RUT de la empresa (opcional)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "codigo": "EMP001",
                "nombre": "Almacén Central S.A.",
                "rut": "76.555.555-5"
            }
        }


class EmpresaActualizarDTO(BaseModel):
    """DTO para actualizar una empresa existente."""
    nombre: Optional[str] = Field(None, min_length=1, max_length=255, description="Nombre de la empresa")
    rut: Optional[str] = Field(None, max_length=50, description="RUT de la empresa")
    esta_activa: Optional[bool] = Field(None, description="Indica si la empresa está activa")
    
    class Config:
        json_schema_extra = {
            "example": {
                "nombre": "Almacén Central S.A. - Sucursal",
                "rut": "76.555.555-5",
                "esta_activa": True
            }
        }


class EmpresaRespuestaDTO(BaseModel):
    """DTO para respuesta de empresa."""
    id: int
    codigo: str
    nombre: str
    rut: Optional[str] = None
    esta_activa: bool
    es_empresa_maestra: bool = False
    creado_at: datetime
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "codigo": "EMP001",
                "nombre": "Almacén Central S.A.",
                "rut": "76.555.555-5",
                "esta_activa": True,
                "creado_at": "2026-05-12T10:30:00"
            }
        }


class EmpresaListaDTO(BaseModel):
    """DTO para listar empresas."""
    id: int
    codigo: str
    nombre: str
    rut: Optional[str] = None
    esta_activa: bool
    es_empresa_maestra: bool = False
    creado_at: datetime
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "codigo": "EMP001",
                "nombre": "Almacén Central S.A.",
                "rut": "76.555.555-5",
                "esta_activa": True,
                "creado_at": "2026-05-12T10:30:00"
            }
        }


class RespuestaAPIDTO(BaseModel):
    """DTO genérico para respuestas API."""
    exito: bool
    datos: Optional[dict | list] = None
    mensaje: Optional[str] = None
    errores: Optional[list] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "exito": True,
                "datos": [],
                "mensaje": "Operación completada exitosamente"
            }
        }
