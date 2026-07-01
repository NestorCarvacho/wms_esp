"""Comandos CRUD del módulo warehouse."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class CrearBodegaCommand:
    empresa_id: int
    nombre: str
    codigo: str
    activo: bool = True


@dataclass(frozen=True)
class ActualizarBodegaCommand:
    bodega_id: int
    empresa_id: int
    nombre: str | None = None
    codigo: str | None = None
    activo: bool | None = None


@dataclass(frozen=True)
class CrearTipoZonaCommand:
    empresa_id: int
    nombre: str
    activo: bool = True


@dataclass(frozen=True)
class ActualizarTipoZonaCommand:
    tipo_zona_id: int
    empresa_id: int
    nombre: str | None = None
    activo: bool | None = None


@dataclass(frozen=True)
class CrearZonaBodegaCommand:
    empresa_id: int
    bodega_id: int
    tipo_zona_id: int
    nombre: str | None = None
    activo: bool = True
    es_super_admin: bool = False


@dataclass(frozen=True)
class ActualizarZonaBodegaCommand:
    zona_id: int
    empresa_id: int
    bodega_id: int | None = None
    tipo_zona_id: int | None = None
    nombre: str | None = None
    activo: bool | None = None
    es_super_admin: bool = False
