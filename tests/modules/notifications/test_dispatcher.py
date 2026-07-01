"""Tests dispatcher de notificaciones."""
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.modules.notifications.application.dispatcher import NotificationDispatcher


@pytest.mark.asyncio
async def test_publish_stock_event_delegates_realtime():
    realtime = AsyncMock()
    email = AsyncMock()
    dispatcher = NotificationDispatcher(realtime, email)
    await dispatcher.publish_stock_event(1, "RECEPCION", {"producto_nombre": "A"})
    realtime.publish_stock_event.assert_awaited_once_with(
        1, "RECEPCION", {"producto_nombre": "A"}
    )
    email.send_html.assert_not_awaited()


@pytest.mark.asyncio
async def test_notify_stock_critical_persists_inbox():
    realtime = AsyncMock()
    email = AsyncMock()
    repo = AsyncMock()
    repo.crear = AsyncMock(return_value=MagicMock(id=1))
    dispatcher = NotificationDispatcher(realtime, email, notificaciones=repo)
    await dispatcher.notify_stock_critical(
        1,
        5,
        {"producto_nombre": "Tornillo", "cantidad": 2},
    )
    realtime.publish_stock_event.assert_awaited_once()
    repo.crear.assert_awaited_once()


@pytest.mark.asyncio
async def test_notify_stock_critical_sends_email_when_recipient():
    realtime = AsyncMock()
    email = AsyncMock()
    dispatcher = NotificationDispatcher(realtime, email)
    await dispatcher.notify_stock_critical(
        1,
        5,
        {"producto_nombre": "Tornillo", "cantidad": 2},
        email_to="ops@example.com",
    )
    realtime.publish_stock_event.assert_awaited_once()
    email.send_html.assert_awaited_once()
