"""Comandos CRUD de empresas."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class CrearEmpresaCommand:
    codigo: str
    razon_social: str
    campos: dict[str, Any]


@dataclass(frozen=True)
class ActualizarEmpresaCommand:
    empresa_id: int
    campos: dict[str, Any]
