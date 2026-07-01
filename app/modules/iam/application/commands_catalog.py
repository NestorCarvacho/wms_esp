"""Comandos CRUD catálogo RBAC y bootstrap."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class CrearRolCommand:
    empresa_id: int
    nombre: str
    descripcion: str | None = None
    activo: bool = True


@dataclass(frozen=True)
class ActualizarRolCommand:
    rol_id: int
    empresa_id: int
    nombre: str | None = None
    descripcion: str | None = None
    activo: bool | None = None


@dataclass(frozen=True)
class CrearPermisoCommand:
    empresa_id: int
    codigo: str
    descripcion: str | None = None
    activo: bool = True


@dataclass(frozen=True)
class ActualizarPermisoCommand:
    permiso_id: int
    empresa_id: int
    campos: dict[str, Any]


@dataclass(frozen=True)
class CrearCargoCommand:
    empresa_id: int
    nombre: str


@dataclass(frozen=True)
class ActualizarCargoCommand:
    cargo_id: int
    empresa_id: int
    nombre: str | None = None


@dataclass(frozen=True)
class ProvisionarRbacCommand:
    empresa_destino_id: int
    usuario: dict[str, Any] | None = None
    empresa_plantilla_id: int = 1
    es_super_admin: bool = False
    empresa_maestra_id: int | None = None
