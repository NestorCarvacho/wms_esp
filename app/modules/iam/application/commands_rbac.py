"""Comandos de gestión de usuarios y asignación RBAC."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class CrearUsuarioCommand:
    empresa_id: int
    email: str
    contrasena: str
    cargo_id: int | None = None


@dataclass(frozen=True)
class ActualizarUsuarioCommand:
    usuario_id: int
    empresa_id: int
    es_super_admin: bool = False
    campos: dict[str, Any] | None = None


@dataclass(frozen=True)
class SincronizarRolesUsuarioCommand:
    usuario_id: int
    empresa_id_caller: int
    rol_ids: list[int]
    es_maestra: bool = False


@dataclass(frozen=True)
class SincronizarPermisosRolCommand:
    rol_id: int
    usuario: dict[str, Any]
    permiso_ids: list[int]


@dataclass(frozen=True)
class SincronizarRolesCargoCommand:
    cargo_id: int
    empresa_id: int
    rol_ids: list[int]
    es_super_admin: bool = False
