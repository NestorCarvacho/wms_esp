"""Schemas (DTOs) para ProductoPresentacion."""
import re
from decimal import Decimal
from pydantic import BaseModel, Field, validator
from typing import Optional

_RE_BARCODE = re.compile(r"^[A-Za-z0-9\-]+$")


class ProductoPresentacionCrearDTO(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=255)
    codigo_barras: Optional[str] = Field(None, max_length=100)
    cantidad_contenida: Decimal = Field(..., gt=0)
    unidad_medida_id: int = Field(...)
    precio_costo: Optional[float] = Field(None, ge=0)
    precio_venta: Optional[float] = Field(None, ge=0)
    permite_venta_unidad: int = Field(1)
    permite_venta_presentacion: int = Field(1)

    @validator("nombre")
    def validar_nombre(cls, v):
        if not v.strip():
            raise ValueError("El nombre no puede estar vacío")
        return v.strip()

    @validator("codigo_barras")
    def validar_codigo_barras(cls, v):
        if v is None:
            return v
        v = v.strip()
        if not v:
            return None
        if not _RE_BARCODE.match(v):
            raise ValueError("El código de barras solo puede contener letras, números y guiones")
        return v

    @validator("permite_venta_unidad", "permite_venta_presentacion")
    def validar_flags(cls, v):
        if v not in (0, 1):
            raise ValueError("Debe ser 0 o 1")
        return v


class ProductoPresentacionActualizarDTO(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=255)
    codigo_barras: Optional[str] = Field(None, max_length=100)
    cantidad_contenida: Optional[Decimal] = Field(None, gt=0)
    unidad_medida_id: Optional[int] = None
    precio_costo: Optional[float] = Field(None, ge=0)
    precio_venta: Optional[float] = Field(None, ge=0)
    permite_venta_unidad: Optional[int] = None
    permite_venta_presentacion: Optional[int] = None
    activo: Optional[int] = None

    @validator("nombre")
    def validar_nombre(cls, v):
        if v is not None and not v.strip():
            raise ValueError("El nombre no puede estar vacío")
        return v.strip() if v else None

    @validator("codigo_barras")
    def validar_codigo_barras(cls, v):
        if v is None:
            return v
        v = v.strip()
        if not v:
            return None
        if not _RE_BARCODE.match(v):
            raise ValueError("El código de barras solo puede contener letras, números y guiones")
        return v

    @validator("permite_venta_unidad", "permite_venta_presentacion", "activo")
    def validar_flags(cls, v):
        if v is not None and v not in (0, 1):
            raise ValueError("Debe ser 0 o 1")
        return v


class VentaDescuentoDTO(BaseModel):
    """Simula / calcula descuento de stock base por venta."""
    presentacion_id: int
    cantidad: Decimal = Field(..., gt=0)
    venta_por_presentacion: bool = Field(
        False,
        description="True = venta de empaques completos; False = venta por unidad interna",
    )


class RespuestaAPIDTO(BaseModel):
    exito: bool
    datos: Optional[dict] = None
    mensaje: str
