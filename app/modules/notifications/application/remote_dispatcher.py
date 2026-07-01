"""Despachador remoto — publica eventos en Redis para notification-service."""
from __future__ import annotations

from typing import Any

from app.modules.notifications.infrastructure.redis_stock_publisher import RedisStockEventPublisher
from app.shared.events.stock_event import StockEventV1


class RemoteNotificationDispatcher:
    """Sustituto del dispatcher local cuando NOTIFICATIONS_MODE=remote."""

    def __init__(self, redis_publisher: RedisStockEventPublisher) -> None:
        self._redis = redis_publisher

    async def publish_stock_event(
        self,
        empresa_id: int,
        event_type: str,
        payload: dict[str, Any],
    ) -> None:
        await self._redis.publish_stock_event(empresa_id, event_type, payload)

    async def send_alert_email(
        self,
        *,
        to: str | list[str],
        subject: str,
        html: str,
    ) -> None:
        recipients = [to] if isinstance(to, str) else list(to)
        await self._redis.publish(
            StockEventV1(
                event_type="EMAIL_ALERT",
                empresa_id=0,
                payload={"subject": subject, "html": html},
                email_to=recipients,
            )
        )

    async def notify_stock_critical(
        self,
        empresa_id: int,
        usuario_id: int,
        payload: dict[str, Any],
        *,
        email_to: str | list[str] | None = None,
    ) -> None:
        producto = payload.get("producto_nombre", "Producto")
        cantidad = payload.get("cantidad", "")
        enriched = {
            **payload,
            "titulo": f"Stock crítico: {producto}",
            "mensaje": f"Quedan {cantidad} unidades en la zona de origen.",
        }
        recipients: list[str] | None = None
        if email_to:
            recipients = [email_to] if isinstance(email_to, str) else list(email_to)

        await self._redis.publish(
            StockEventV1(
                event_type="STOCK_CRITICO",
                empresa_id=empresa_id,
                usuario_id=usuario_id,
                payload=enriched,
                email_to=recipients,
            )
        )
