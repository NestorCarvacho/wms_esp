"""Publicador realtime vía WebSocket (inventario)."""
from __future__ import annotations

from typing import Any

from app.infrastructure.ws.inventario_event_bus import inventario_event_bus
from app.modules.notifications.domain.ports import IStockRealtimePublisher


class WebSocketStockPublisher(IStockRealtimePublisher):
    async def publish_stock_event(
        self,
        empresa_id: int,
        event_type: str,
        payload: dict[str, Any],
    ) -> None:
        await inventario_event_bus.broadcast_stock_event(
            empresa_id=empresa_id,
            event_type=event_type,
            payload=payload,
        )
