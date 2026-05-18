"""
Schemas (DTOs) para Unidad de Medida.
Validación automática con Pydantic.
"""
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional

# CREATE TABLE `unidad_medida` (
#   `id` bigint NOT NULL AUTO_INCREMENT,
#   `empresa_id` bigint NOT NULL,
#   `codigo` varchar(10) NOT NULL,
#   `nombre` varchar(50) NOT NULL,
#   `activo` tinyint(1) DEFAULT '1',
#   PRIMARY KEY (`id`),
#   UNIQUE KEY `uk_unidad_empresa` (`codigo`,`empresa_id`),
#   KEY `empresa_id` (`empresa_id`),
#   CONSTRAINT `unidad_medida_ibfk_1` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`)
# ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

# ============ UNIDAD DE MEDIDA ============
class UnidadMedidaCrearDTO(BaseModel):
    """DTO para crear una nueva unidad de medida."""
    codigo: str = Field(
        ...,
        min_length=1,
        max_length=10,
        description="Código de la unidad de medida (1-10 caracteres)"
    )
    nombre: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Nombre de la unidad de medida (1-50 caracteres)"
    )
    activo: int = Field(
        1,
        description="Indica si la unidad de medida está activa (1) o no (0)"
    )

    @validator("codigo")
    def validar_codigo(cls, v):
        """Valida que el código no esté vacío y sea válido."""
        if not v.strip():
            raise ValueError("El código de la unidad de medida no puede estar vacío")
        return v.strip()

    @validator("nombre")
    def validar_nombre(cls, v):
        """Valida que el nombre no esté vacío y sea válido."""
        if not v.strip():
            raise ValueError("El nombre de la unidad de medida no puede estar vacío")
        return v.strip()

    class Config:
        json_schema_extra = {
            "example": {
                "codigo": "KG",
                "nombre": "Kilogramo",
                "activo": 1
            }
        }


class UnidadMedidaActualizarDTO(BaseModel):
    """DTO para actualizar una unidad de medida existente."""
    nombre: Optional[str] = Field(
        None,
        min_length=1,
        max_length=50,
        description="Nombre de la unidad de medida (1-50 caracteres)"
    )
    codigo: Optional[str] = Field(
        None,
        min_length=1,
        max_length=10,
        description="Código de la unidad de medida (1-10 caracteres)"
    )
    activo: Optional[int] = Field(
        None,
        description="Indica si la unidad de medida está activa (1) o no (0)"
    )

    @validator("nombre")
    def validar_nombre(cls, v):
        """Valida que el nombre no esté vacío si se proporciona."""
        if v is not None and not v.strip():
            raise ValueError("El nombre de la unidad de medida no puede estar vacío")
        return v.strip() if v else None

    @validator("codigo")
    def validar_codigo(cls, v):
        """Valida que el código no esté vacío si se proporciona."""
        if v is not None and not v.strip():
            raise ValueError("El código de la unidad de medida no puede estar vacío")
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
                "codigo": "KG",
                "nombre": "Kilogramo",
                "activo": 1
            }
        }

class UnidadMedidaRespuestaDTO(BaseModel):
    """DTO para respuesta de unidad de medida detallado."""
    id: int
    empresa_id: int
    nombre: str
    codigo: str
    activo: int

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "empresa_id": 1,
                "nombre": "Kilogramo",
                "codigo": "KG",
                "activo": 1
            }
        }


class UnidadMedidaListaDTO(BaseModel):
    """DTO para unidad de medida en lista."""
    id: int
    nombre: str
    codigo: str
    activo: int

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "nombre": "Kilogramo",
                "codigo": "KG",
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
                    "nombre": "Kilogramo",
                    "codigo": "KG",
                    "activo": 1,
                    "empresa_id": 1
                },
                "mensaje": "Operación completada exitosamente"
            }
        }
