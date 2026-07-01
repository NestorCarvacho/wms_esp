"""Comandos CRUD de productos."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class CrearProductoCommand:
    empresa_id: int
    nombre: str
    sku: str
    activo: bool = True
    unidad_medida_id: int | None = None
    tipo_producto_id: int | None = None
    precio_costo: float | None = None
    serializado: bool = False
    stock_minimo: float | None = None


@dataclass(frozen=True)
class ActualizarProductoCommand:
    producto_id: int
    empresa_id: int
    nombre: str | None = None
    sku: str | None = None
    activo: bool | None = None
    unidad_medida_id: int | None = None
    tipo_producto_id: int | None = None
    actualizar_tipo_producto: bool = False
    precio_costo: float | None = None
    serializado: bool | None = None
    stock_minimo: float | None = None
    actualizar_stock_minimo: bool = False


@dataclass(frozen=True)
class CrearTipoProductoCommand:
    empresa_id: int
    nombre: str
    activo: bool = True


@dataclass(frozen=True)
class ActualizarTipoProductoCommand:
    tipo_producto_id: int
    empresa_id: int
    nombre: str | None = None
    activo: bool | None = None


@dataclass(frozen=True)
class CrearUnidadMedidaCommand:
    empresa_id: int
    nombre: str
    codigo: str
    activo: bool = True


@dataclass(frozen=True)
class ActualizarUnidadMedidaCommand:
    unidad_medida_id: int
    empresa_id: int
    nombre: str | None = None
    codigo: str | None = None
    activo: bool | None = None
