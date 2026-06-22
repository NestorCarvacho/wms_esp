"""
Schemas (DTOs) para Bodega.
Validación automática con Pydantic.
"""
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional

#tabla bodega para relacionar armar schema de bodega
# CREATE TABLE `bodega` (
#   `id` bigint NOT NULL AUTO_INCREMENT,
#   `empresa_id` bigint NOT NULL,
#   `codigo` varchar(50) NOT NULL,
#   `nombre` varchar(255) NOT NULL,
#   `activo` tinyint(1) DEFAULT '1',
#   PRIMARY KEY (`id`),
#   KEY `empresa_id` (`empresa_id`),
#   CONSTRAINT `bodega_ibfk_1` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`)
# ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

# ============ BODEGA ============
class BodegaCrearDTO(BaseModel):
    """DTO para crear una nueva bodega."""
    nombre: str = Field(..., min_length=1, max_length=100)
    codigo: str = Field(..., min_length=1, max_length=50)
    activo: int = Field(1)
    direccion: Optional[str] = Field(None, max_length=255, description="Calle y número")
    region_id: Optional[int] = None
    ciudad_id: Optional[int] = None
    comuna_id: Optional[int] = None

    @validator("nombre")
    def validar_nombre(cls, v):
        """Valida que el nombre no esté vacío y sea válido."""
        if not v.strip():
            raise ValueError("El nombre de la bodega no puede estar vacío")
        return v.strip()
    
    class Config:
        json_schema_extra = {
            "example": {
                "nombre": "Bodega Central",
                "codigo": "BOD001",
                "activo": 1
            }
        }


class BodegaActualizarDTO(BaseModel):
    """DTO para actualizar una bodega existente."""
    nombre: Optional[str] = Field(None, min_length=1, max_length=100)
    codigo: Optional[str] = Field(None, min_length=1, max_length=50)
    activo: Optional[int] = None
    direccion: Optional[str] = Field(None, max_length=255)
    region_id: Optional[int] = None
    ciudad_id: Optional[int] = None
    comuna_id: Optional[int] = None

    @validator("nombre")
    def validar_nombre(cls, v):
        """Valida que el nombre no esté vacío si se proporciona."""
        if v is not None and not v.strip():
            raise ValueError("El nombre de la bodega no puede estar vacío")
        return v.strip() if v else None

    @validator("codigo")
    def validar_codigo(cls, v):
        """Valida que el código no esté vacío si se proporciona."""
        if v is not None and not v.strip():
            raise ValueError("El código de la bodega no puede estar vacío")
        return v.strip() if v else None

    @validator("activo")
    def validar_activo(cls, v):
        """Valida que el valor de activo sea 0 o 1 si se proporciona."""
        if v is not None and v not in (0, 1):
            raise ValueError("El campo 'activo' debe ser 0 o 1")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "nombre": "Bodega Central",
                "codigo": "BOD001",
                "activo": 1
            }
        }


class BodegaRespuestaDTO(BaseModel):
    """DTO para respuesta de bodega detallado."""
    id: int
    empresa_id: int
    nombre: str
    codigo: Optional[str] = None
    activo: Optional[int] = None
    direccion: Optional[str] = None
    region_id: Optional[int] = None
    ciudad_id: Optional[int] = None
    comuna_id: Optional[int] = None
    region_nombre: Optional[str] = None
    ciudad_nombre: Optional[str] = None
    comuna_nombre: Optional[str] = None

    class Config:
        from_attributes = True


class BodegaListaDTO(BaseModel):
    """DTO para bodega en lista."""
    id: int
    nombre: str
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "nombre": "Bodega Central",
                "codigo": "BOD001",
                "activo": 1
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
                    "nombre": "Bodega Central",
                    "codigo": "BOD001",
                    "activo": 1,
                    "empresa_id": 1
                },
                "mensaje": "Operación completada exitosamente"
            }
        }
