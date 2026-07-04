"""Comandos de perfil."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class ActualizarPerfilCommand:
    usuario_id: int
    empresa_id: int | None
    datos: dict[str, Any]
