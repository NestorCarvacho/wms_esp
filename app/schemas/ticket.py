"""DTOs del centro de ayuda."""
from typing import Optional

from pydantic import BaseModel, Field, validator


class TicketCrearDTO(BaseModel):
    tipo_solicitud_id: int = Field(..., gt=0)
    mensaje: str = Field(..., min_length=1, max_length=4000)
    asunto: Optional[str] = Field(None, max_length=160)

    @validator("mensaje")
    def limpiar_mensaje(cls, v):
        texto = v.strip()
        if not texto:
            raise ValueError("Debe describir el problema")
        return texto

    @validator("asunto")
    def limpiar_asunto(cls, v):
        if v is None:
            return v
        texto = v.strip()
        return texto or None


class TicketMensajeDTO(BaseModel):
    mensaje: str = Field(..., min_length=1, max_length=4000)

    @validator("mensaje")
    def limpiar_mensaje(cls, v):
        texto = v.strip()
        if not texto:
            raise ValueError("El mensaje no puede estar vacío")
        return texto


class TicketEstadoDTO(BaseModel):
    estado_codigo: str = Field(..., min_length=1, max_length=30)

    @validator("estado_codigo")
    def limpiar_codigo(cls, v):
        return v.strip().lower()


class RespuestaAPIDTO(BaseModel):
    exito: bool
    datos: Optional[dict | list] = None
    mensaje: str
    errores: Optional[list] = None
