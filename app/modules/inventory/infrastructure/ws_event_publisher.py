"""Publicador de eventos vía WebSocket (adaptador de infraestructura)."""
from __future__ import annotations

from app.infrastructure.ws.inventario_event_bus import inventario_event_bus
from app.modules.inventory.domain.events import StockMovimientoRegistrado


class WebSocketEventPublisher:
    async def publish(self, event: StockMovimientoRegistrado) -> None:
        await inventario_event_bus.broadcast_stock_event(
            empresa_id=event.empresa_id,
            event_type=event.tipo,
            payload=event.payload,
        )
