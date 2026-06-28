"""DTOs para inventario serializado (serie_producto)."""
from typing import Optional
from pydantic import BaseModel, Field, validator


class SerieRecepcionarDTO(BaseModel):
    producto_id: int = Field(..., gt=0)
    numero_serie: str = Field(..., min_length=1, max_length=100)
    bodega_id: int = Field(..., gt=0)
    zona_destino_id: Optional[int] = Field(None, gt=0)
    documento_tipo: Optional[str] = Field(None, max_length=50)
    documento_folio: Optional[str] = Field(None, max_length=100)
    observaciones: Optional[str] = Field(None, max_length=2000)

    @validator("numero_serie")
    def strip_serie(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("El número de serie no puede estar vacío")
        return v


class SerieTrasladarDTO(BaseModel):
    numero_serie: str = Field(..., min_length=1, max_length=100)
    zona_origen_id: int = Field(..., gt=0)
    zona_destino_id: int = Field(..., gt=0)
    documento_tipo: Optional[str] = Field(None, max_length=50)
    documento_folio: Optional[str] = Field(None, max_length=100)
    observaciones: Optional[str] = Field(None, max_length=2000)

    @validator("numero_serie")
    def strip_serie(cls, v):
        return v.strip()


class SerieDespacharDTO(BaseModel):
    numero_serie: str = Field(..., min_length=1, max_length=100)
    zona_origen_id: int = Field(..., gt=0)
    documento_tipo: Optional[str] = Field(None, max_length=50)
    documento_folio: Optional[str] = Field(None, max_length=100)
    observaciones: Optional[str] = Field(None, max_length=2000)

    @validator("numero_serie")
    def strip_serie(cls, v):
        return v.strip()
