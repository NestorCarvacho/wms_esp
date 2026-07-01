"""Eventos de dominio — desacoplados del transporte (WebSocket, Kafka, etc.)."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any


@dataclass(frozen=True)
class StockMovimientoRegistrado:
    empresa_id: int
    movimiento_id: int
    tipo: str
    payload: dict[str, Any]
    creado_at_local: datetime | None = None

    @property
    def event_type(self) -> str:
        return "stock.movimiento_registrado"
