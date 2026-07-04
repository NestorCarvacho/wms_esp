"""Entidades de geografía (Chile)."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Region:
    id: int
    nombre: str
    codigo: str


@dataclass(frozen=True)
class Ciudad:
    id: int
    region_id: int
    nombre: str


@dataclass(frozen=True)
class Comuna:
    id: int
    region_id: int
    ciudad_id: int
    nombre: str
