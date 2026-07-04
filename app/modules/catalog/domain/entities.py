"""Entidades de dominio del bounded context catalog."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Producto:
    id: int
    empresa_id: int
    nombre: str
    sku: str
    activo: bool
    unidad_medida_id: int | None = None
    tipo_producto_id: int | None = None
    precio_costo: float | None = None
    serializado: bool = False
    stock_minimo: float | None = None
    empresa_nombre: str | None = None
    unidad_medida_nombre: str | None = None
    tipo_producto_nombre: str | None = None


@dataclass(frozen=True)
class TipoProducto:
    id: int
    empresa_id: int
    nombre: str
    activo: bool
    empresa_nombre: str | None = None


@dataclass(frozen=True)
class UnidadMedida:
    id: int
    empresa_id: int
    nombre: str
    codigo: str
    activo: bool
    empresa_nombre: str | None = None
