"""Tests RemoteNotificationDispatcher."""
from unittest.mock import AsyncMock, patch

import pytest

from app.modules.notifications.application.remote_dispatcher import RemoteNotificationDispatcher
from app.shared.events.stock_event import StockEventV1


@pytest.mark.asyncio
async def test_remote_dispatcher_publishes_stock_event():
    redis = AsyncMock()
    dispatcher = RemoteNotificationDispatcher(redis)
    await dispatcher.publish_stock_event(2, "TRASLADO", {"producto_nombre": "B"})
    redis.publish_stock_event.assert_awaited_once_with(2, "TRASLADO", {"producto_nombre": "B"})


@pytest.mark.asyncio
async def test_remote_dispatcher_publishes_stock_critico_with_context():
    redis = AsyncMock()
    dispatcher = RemoteNotificationDispatcher(redis)
    await dispatcher.notify_stock_critical(
        1,
        5,
        {"producto_nombre": "Tornillo", "cantidad": 2},
        email_to="ops@example.com",
    )
    redis.publish.assert_awaited_once()
    event: StockEventV1 = redis.publish.await_args.args[0]
    assert event.event_type == "STOCK_CRITICO"
    assert event.usuario_id == 5
    assert event.email_to == ["ops@example.com"]
    assert "Stock crítico" in event.payload["titulo"]
