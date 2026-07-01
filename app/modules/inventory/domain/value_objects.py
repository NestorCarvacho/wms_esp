"""Value objects del módulo inventario."""
from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal


@dataclass(frozen=True)
class CantidadInventario:
    valor: Decimal

    def __post_init__(self) -> None:
        if self.valor <= 0:
            raise ValueError("La cantidad debe ser mayor a cero")

    @classmethod
    def from_float(cls, value: float) -> CantidadInventario:
        return cls(valor=Decimal(str(value)))


@dataclass(frozen=True)
class UbicacionRef:
    bodega_id: int
    zona_id: int
