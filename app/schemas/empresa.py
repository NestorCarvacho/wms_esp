"""
Schemas (DTOs) para Empresas.
"""
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional, List


EMPRESA_CAMPOS = ["razon_social", "nombre_fantasia", "rut", "giro",
                  "telefono", "correo", "sitio_web", "direccion",
                  "region_id", "ciudad_id", "comuna_id", "esta_activa",
                  "locale", "timezone", "moneda_codigo"]


class EmpresaCrearDTO(BaseModel):
    codigo:          str            = Field(..., min_length=1, max_length=50)
    razon_social:    str            = Field(..., min_length=1, max_length=255)
    nombre_fantasia: Optional[str]  = Field(None, max_length=255)
    rut:             Optional[str]  = Field(None, max_length=50)
    giro:            Optional[str]  = Field(None, max_length=255)
    telefono:        Optional[str]  = Field(None, max_length=30)
    correo:          Optional[str]  = Field(None, max_length=255)
    sitio_web:       Optional[str]  = Field(None, max_length=255)
    direccion:       Optional[str]  = Field(None, max_length=255)
    region_id:       Optional[int]  = None
    ciudad_id:       Optional[int]  = None
    comuna_id:       Optional[int]  = None
    locale:          Optional[str]  = Field("es-CL", max_length=10)
    timezone:        Optional[str]  = Field("America/Santiago", max_length=64)
    moneda_codigo:   Optional[str]  = Field("CLP", min_length=3, max_length=3)

    class Config:
        json_schema_extra = {
            "example": {
                "codigo": "EMP001",
                "razon_social": "Almacén Central S.A.",
                "nombre_fantasia": "AC Logistics",
                "rut": "76.555.555-5",
                "giro": "Almacenamiento y distribución",
                "telefono": "+56222345678",
                "correo": "contacto@aclogistics.cl",
                "sitio_web": "https://aclogistics.cl",
                "direccion": "Av. Industrial 1234",
                "region_id": 7,
                "ciudad_id": 26,
                "comuna_id": 1
            }
        }


class EmpresaActualizarDTO(BaseModel):
    razon_social:    Optional[str]  = Field(None, min_length=1, max_length=255)
    nombre_fantasia: Optional[str]  = Field(None, max_length=255)
    rut:             Optional[str]  = Field(None, max_length=50)
    giro:            Optional[str]  = Field(None, max_length=255)
    telefono:        Optional[str]  = Field(None, max_length=30)
    correo:          Optional[str]  = Field(None, max_length=255)
    sitio_web:       Optional[str]  = Field(None, max_length=255)
    esta_activa:     Optional[bool] = None
    direccion:       Optional[str]  = Field(None, max_length=255)
    region_id:       Optional[int]  = None
    ciudad_id:       Optional[int]  = None
    comuna_id:       Optional[int]  = None
    locale:          Optional[str]  = Field(None, max_length=10)
    timezone:        Optional[str]  = Field(None, max_length=64)
    moneda_codigo:   Optional[str]  = Field(None, min_length=3, max_length=3)


class EmpresaRespuestaDTO(BaseModel):
    id:              int
    codigo:          str
    razon_social:    str
    nombre_fantasia: Optional[str]  = None
    rut:             Optional[str]  = None
    giro:            Optional[str]  = None
    telefono:        Optional[str]  = None
    correo:          Optional[str]  = None
    sitio_web:       Optional[str]  = None
    esta_activa:     bool
    es_empresa_maestra: bool        = False
    creado_at:       datetime
    direccion:       Optional[str]  = None
    region_id:       Optional[int]  = None
    ciudad_id:       Optional[int]  = None
    comuna_id:       Optional[int]  = None
    region_nombre:   Optional[str]  = None
    ciudad_nombre:   Optional[str]  = None
    comuna_nombre:   Optional[str]  = None
    locale:          str            = "es-CL"
    timezone:        str            = "America/Santiago"
    moneda_codigo:   str            = "CLP"

    class Config:
        from_attributes = True


class EmpresaListaDTO(BaseModel):
    id:              int
    codigo:          str
    razon_social:    str
    nombre_fantasia: Optional[str]  = None
    rut:             Optional[str]  = None
    esta_activa:     bool
    es_empresa_maestra: bool        = False
    creado_at:       datetime
    region_nombre:   Optional[str]  = None
    comuna_nombre:   Optional[str]  = None

    class Config:
        from_attributes = True


class RespuestaAPIDTO(BaseModel):
    exito:   bool
    datos:   Optional[dict | list] = None
    mensaje: Optional[str]         = None
    errores: Optional[list]        = None
