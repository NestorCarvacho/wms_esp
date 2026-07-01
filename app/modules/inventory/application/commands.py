"""Comandos y consultas del módulo inventario."""
from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal


@dataclass(frozen=True)
class RecepcionarCommand:
    empresa_id: int
    usuario_id: int
    bodega_id: int
    producto_id: int
    cantidad: Decimal
    zona_destino_id: int | None = None
    presentacion_id: int | None = None
    venta_por_presentacion: bool = False
    documento_tipo: str | None = None
    documento_folio: str | None = None
    observaciones: str | None = None


@dataclass(frozen=True)
class TrasladarCommand:
    empresa_id: int
    usuario_id: int
    producto_id: int
    cantidad: Decimal
    zona_origen_id: int
    zona_destino_id: int
    presentacion_id: int | None = None
    venta_por_presentacion: bool = False
    documento_tipo: str | None = None
    documento_folio: str | None = None
    observaciones: str | None = None


@dataclass(frozen=True)
class DespacharCommand:
    empresa_id: int
    usuario_id: int
    producto_id: int
    cantidad: Decimal
    zona_origen_id: int
    presentacion_id: int | None = None
    venta_por_presentacion: bool = False
    documento_tipo: str | None = None
    documento_folio: str | None = None
    observaciones: str | None = None


@dataclass(frozen=True)
class ActualizarConfigBodegaCommand:
    bodega_id: int
    empresa_id: int
    zona_recepcion_default_id: int | None
