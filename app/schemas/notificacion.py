"""Schemas de notificaciones."""
from pydantic import BaseModel, Field
from typing import Any, Optional
from datetime import datetime


class RespuestaAPIDTO(BaseModel):
    exito: bool
    datos: Optional[Any] = None
    mensaje: str = ""


class NotificacionRespuestaDTO(BaseModel):
    id: int
    empresa_id: int
    tipo: str
    titulo: str
    mensaje: Optional[str] = None
    payload: Optional[Any] = None
    leida: bool
    creado_at: Optional[datetime] = None
    leida_at: Optional[datetime] = None
