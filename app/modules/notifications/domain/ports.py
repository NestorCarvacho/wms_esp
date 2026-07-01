"""Puertos del bounded context notifications."""
from __future__ import annotations

from typing import Any, Protocol


class IStockRealtimePublisher(Protocol):
    async def publish_stock_event(
        self,
        empresa_id: int,
        event_type: str,
        payload: dict[str, Any],
    ) -> None: ...


class ITransactionalEmailSender(Protocol):
    async def send_html(
        self,
        *,
        to: str | list[str],
        subject: str,
        html: str,
    ) -> None: ...


class INotificationDispatcher(Protocol):
    async def publish_stock_event(
        self,
        empresa_id: int,
        event_type: str,
        payload: dict[str, Any],
    ) -> None: ...

    async def send_alert_email(
        self,
        *,
        to: str | list[str],
        subject: str,
        html: str,
    ) -> None: ...
