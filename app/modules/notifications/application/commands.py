"""Comandos de notificaciones."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class CrearNotificacionCommand:
    empresa_id: int
    usuario_id: int
    tipo: str
    titulo: str
    mensaje: str | None = None
    payload: dict[str, Any] | None = None
