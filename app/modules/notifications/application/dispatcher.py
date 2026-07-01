"""Despachador compuesto de notificaciones (WS + email)."""
from __future__ import annotations

from typing import Any

from app.modules.notifications.domain.ports import (
    INotificationDispatcher,
    IStockRealtimePublisher,
    ITransactionalEmailSender,
)


class NotificationDispatcher(INotificationDispatcher):
    def __init__(
        self,
        realtime: IStockRealtimePublisher,
        email: ITransactionalEmailSender,
    ):
        self._realtime = realtime
        self._email = email

    async def publish_stock_event(
        self,
        empresa_id: int,
        event_type: str,
        payload: dict[str, Any],
    ) -> None:
        await self._realtime.publish_stock_event(empresa_id, event_type, payload)

    async def send_alert_email(
        self,
        *,
        to: str | list[str],
        subject: str,
        html: str,
    ) -> None:
        await self._email.send_html(to=to, subject=subject, html=html)

    async def notify_stock_critical(
        self,
        empresa_id: int,
        payload: dict[str, Any],
        *,
        email_to: str | list[str] | None = None,
    ) -> None:
        await self.publish_stock_event(empresa_id, "STOCK_CRITICO", payload)
        if email_to:
            producto = payload.get("producto_nombre", "Producto")
            cantidad = payload.get("cantidad", "")
            await self.send_alert_email(
                to=email_to,
                subject=f"Alerta de stock crítico — {producto}",
                html=f"""
                <p>El producto <strong>{producto}</strong> tiene stock crítico.</p>
                <p>Cantidad actual: <strong>{cantidad}</strong></p>
                """,
            )
