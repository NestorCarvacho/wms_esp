"""Publicador de eventos de stock hacia Redis."""
from __future__ import annotations

from typing import Any

import redis.asyncio as redis

from app.core.config import REDIS_URL, STOCK_EVENTS_CHANNEL
from app.modules.notifications.domain.ports import IStockRealtimePublisher
from app.shared.events.stock_event import StockEventV1


class RedisStockEventPublisher(IStockRealtimePublisher):
    """Adaptador Redis — implementa IStockRealtimePublisher para modo remote."""

    def __init__(self, redis_url: str | None = None, channel: str | None = None) -> None:
        self._channel = channel or STOCK_EVENTS_CHANNEL
        self._redis = redis.from_url(redis_url or REDIS_URL, decode_responses=True)

    async def publish(self, event: StockEventV1) -> None:
        await self._redis.publish(self._channel, event.to_json())

    async def publish_stock_event(
        self,
        empresa_id: int,
        event_type: str,
        payload: dict[str, Any],
    ) -> None:
        await self.publish(
            StockEventV1(
                event_type=event_type,
                empresa_id=empresa_id,
                payload=payload,
            )
        )

    async def close(self) -> None:
        await self._redis.aclose()
