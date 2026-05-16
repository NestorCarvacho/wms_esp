"""
Schemas (DTOs) para Producto.
Validación automática con Pydantic.
"""
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional

# CREATE TABLE `producto` (
#   `id` bigint NOT NULL AUTO_INCREMENT,
#   `empresa_id` bigint NOT NULL,
#   `sku` varchar(100) NOT NULL,
#   `nombre` varchar(255) NOT NULL,
#   `unidad_medida_id` bigint NOT NULL,
#   `precio_costo` decimal(12,2) DEFAULT NULL,
#   `activo` tinyint(1) DEFAULT '1',
#   PRIMARY KEY (`id`),
#   KEY `empresa_id` (`empresa_id`),
#   KEY `unidad_medida_id` (`unidad_medida_id`),
#   CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`),
#   CONSTRAINT `producto_ibfk_2` FOREIGN KEY (`unidad_medida_id`) REFERENCES `unidad_medida` (`id`)
# ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

# ============ PRODUCTO ============
class ProductoCrearDTO(BaseModel):
    """DTO para crear un nuevo producto."""
    nombre: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Nombre del producto (1-100 caracteres)"
    )
    sku: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Código del producto (1-50 caracteres)"
    )
    activo: int = Field(
        1,
        description="Indica si el producto está activa (1) o no (0)"
    )
    unidad_medida_id: int = Field(
        ...,
        description="ID de la unidad de medida asociada"
    )
    precio_costo: Optional[float] = Field(
        None,
        ge=0,
        description="Precio de costo del producto (opcional, debe ser positivo)"
    )

    @validator("nombre")
    def validar_nombre(cls, v):
        """Valida que el nombre no esté vacío y sea válido."""
        if not v.strip():
            raise ValueError("El nombre del producto no puede estar vacío")
        return v.strip()
    
    class Config:
        schema_extra = {
            "example": {
                "nombre": "Producto Central",
                "sku": "BOD001",
                "activo": 1,
                "unidad_medida_id": 1,
                "precio_costo": 10.0
            }
        }


class ProductoActualizarDTO(BaseModel):
    """DTO para actualizar una producto existente."""
    nombre: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        description="Nombre del producto (1-100 caracteres)"
    )
    sku: Optional[str] = Field(
        None,
        min_length=1,
        max_length=50,
        description="Código del producto (1-50 caracteres)"
    )
    activo: Optional[int] = Field(
        None,
        description="Indica si el producto está activa (1) o no (0)"
    )
    unidad_medida_id: Optional[int] = Field(
        None,
        description="ID de la unidad de medida asociada"
    )
    precio_costo: Optional[float] = Field(
        None,
        ge=0,
        description="Precio de costo del producto (opcional, debe ser positivo)"
    )

    @validator("nombre")
    def validar_nombre(cls, v):
        """Valida que el nombre no esté vacío si se proporciona."""
        if v is not None and not v.strip():
            raise ValueError("El nombre del producto no puede estar vacío")
        return v.strip() if v else None

    @validator("sku")
    def validar_sku(cls, v):
        """Valida que el código no esté vacío si se proporciona."""
        if v is not None and not v.strip():
            raise ValueError("El código del producto no puede estar vacío")
        return v.strip() if v else None

    @validator("activo")
    def validar_activo(cls, v):
        """Valida que el valor de activo sea 0 o 1 si se proporciona."""
        if v is not None and v not in (0, 1):
            raise ValueError("El campo 'activo' debe ser 0 o 1")
        return v

    class Config:
        schema_extra = {
            "example": {
                "nombre": "Producto Prueba 1",
                "sku": "PRO001",
                "activo": 1,
                "unidad_medida_id": 1,
                "precio_costo": 10.0
            }
        }


class ProductoRespuestaDTO(BaseModel):
    """DTO para respuesta de producto detallado."""
    id: int
    empresa_id: int
    nombre: str
    sku: str
    activo: int
    unidad_medida_id: int
    precio_costo: Optional[float]

    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": 1,
                "empresa_id": 1,
                "nombre": "Producto Prueba 1",
                "sku": "PRO001",
                "activo": 1,
                "unidad_medida_id": 1,
                "precio_costo": 10.0
            }
        }


class ProductoListaDTO(BaseModel):
    """DTO para producto en lista."""
    id: int
    nombre: str
    sku: str
    activo: int
    unidad_medida_id: int
    precio_costo: Optional[float]

    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": 1,
                "nombre": "Producto Prueba 1",
                "sku": "PRO001",
                "activo": 1,
                "unidad_medida_id": 1,
                "precio_costo": 10.0
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
                    "nombre": "Producto Prueba 1",
                    "sku": "PRO001",
                    "activo": 1,
                    "unidad_medida_id": 1,
                    "precio_costo": 10.0,
                    "empresa_id": 1
                },
                "mensaje": "Operación completada exitosamente"
            }
        }
