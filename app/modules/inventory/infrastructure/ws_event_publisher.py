"""Publicador de eventos vía módulo notifications."""
from __future__ import annotations

from app.bootstrap.notification_container import build_notification_handlers
from app.modules.inventory.domain.events import StockMovimientoRegistrado


class WebSocketEventPublisher:
    def __init__(self) -> None:
        self._dispatcher = build_notification_handlers().dispatcher

    async def publish(self, event: StockMovimientoRegistrado) -> None:
        await self._dispatcher.publish_stock_event(
            empresa_id=event.empresa_id,
            event_type=event.tipo,
            payload={
                "movimiento_id": event.movimiento_id,
                "producto_nombre": event.payload.get("producto_nombre"),
                "producto_sku": event.payload.get("producto_sku"),
                "cantidad": event.payload.get("cantidad"),
                "tipo": event.tipo,
                "creado_at_local": event.payload.get("creado_at_local"),
            },
        )
