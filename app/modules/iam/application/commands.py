"""Comandos y consultas IAM."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class LoginCommand:
    email: str
    contrasena: str


@dataclass(frozen=True)
class SolicitarRecuperacionCommand:
    email: str


@dataclass(frozen=True)
class RestablecerContrasenaCommand:
    token: str
    contrasena: str


@dataclass(frozen=True)
class CambiarContrasenaCommand:
    usuario_id: int
    empresa_id: int
    contrasena_actual: str
    contrasena_nueva: str


@dataclass(frozen=True)
class ValidarTokenQuery:
    payload: dict[str, Any]
