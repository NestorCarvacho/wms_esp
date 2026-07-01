"""Despachador compuesto de notificaciones (WS + email + inbox)."""
from __future__ import annotations

from typing import Any

from app.modules.notifications.application.commands import CrearNotificacionCommand
from app.modules.notifications.application.handlers.notificacion_handlers import CrearNotificacionHandler
from app.modules.notifications.domain.ports import (
    INotificacionRepository,
    IStockRealtimePublisher,
    ITransactionalEmailSender,
)


class NotificationDispatcher:
    def __init__(
        self,
        realtime: IStockRealtimePublisher,
        email: ITransactionalEmailSender,
        notificaciones: INotificacionRepository | None = None,
    ):
        self._realtime = realtime
        self._email = email
        self._crear_notificacion = (
            CrearNotificacionHandler(notificaciones) if notificaciones else None
        )

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
        usuario_id: int,
        payload: dict[str, Any],
        *,
        email_to: str | list[str] | None = None,
    ) -> None:
        producto = payload.get("producto_nombre", "Producto")
        cantidad = payload.get("cantidad", "")
        titulo = f"Stock crítico: {producto}"
        mensaje = f"Quedan {cantidad} unidades en la zona de origen."

        await self.publish_stock_event(empresa_id, "STOCK_CRITICO", payload)

        if self._crear_notificacion:
            await self._crear_notificacion.handle(
                CrearNotificacionCommand(
                    empresa_id=empresa_id,
                    usuario_id=usuario_id,
                    tipo="STOCK_CRITICO",
                    titulo=titulo,
                    mensaje=mensaje,
                    payload=payload,
                )
            )

        if email_to:
            await self.send_alert_email(
                to=email_to,
                subject=f"Alerta de stock crítico — {producto}",
                html=f"""
                <p>El producto <strong>{producto}</strong> tiene stock crítico.</p>
                <p>Cantidad actual: <strong>{cantidad}</strong></p>
                """,
            )
