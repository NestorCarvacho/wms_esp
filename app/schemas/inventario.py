"""DTOs de inventario operativo (stock por zona y movimientos)."""
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, validator


class RespuestaAPIDTO(BaseModel):
    exito: bool
    datos: Optional[dict | list] = None
    mensaje: Optional[str] = None
    errores: Optional[list] = None


class BodegaConfigDTO(BaseModel):
    bodega_id: int
    zona_recepcion_default_id: Optional[int] = None


class BodegaConfigActualizarDTO(BaseModel):
    zona_recepcion_default_id: Optional[int] = Field(None, gt=0)


class OperacionInventarioBaseDTO(BaseModel):
    producto_id: int = Field(..., gt=0)
    cantidad: Decimal = Field(..., gt=0)
    presentacion_id: Optional[int] = Field(None, gt=0)
    venta_por_presentacion: bool = False
    documento_tipo: Optional[str] = Field(None, max_length=50)
    documento_folio: Optional[str] = Field(None, max_length=100)
    observaciones: Optional[str] = Field(None, max_length=2000)

    @validator("documento_tipo", "documento_folio", "observaciones")
    def strip_optional(cls, v):
        if v is None:
            return None
        s = str(v).strip()
        return s if s else None


class RecepcionDTO(OperacionInventarioBaseDTO):
    bodega_id: int = Field(..., gt=0)
    zona_destino_id: Optional[int] = Field(None, gt=0)


class TrasladoDTO(OperacionInventarioBaseDTO):
    zona_origen_id: int = Field(..., gt=0)
    zona_destino_id: int = Field(..., gt=0)


class DespachoDTO(OperacionInventarioBaseDTO):
    zona_origen_id: int = Field(..., gt=0)
