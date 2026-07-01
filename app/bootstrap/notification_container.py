"""Composition root del módulo notifications."""
from __future__ import annotations

from dataclasses import dataclass

from app.modules.notifications.application.dispatcher import NotificationDispatcher
from app.modules.notifications.infrastructure.resend_email_sender import ResendTransactionalEmailSender
from app.modules.notifications.infrastructure.ws_stock_publisher import WebSocketStockPublisher


@dataclass
class NotificationHandlers:
    dispatcher: NotificationDispatcher


def build_notification_handlers() -> NotificationHandlers:
    return NotificationHandlers(
        dispatcher=NotificationDispatcher(
            realtime=WebSocketStockPublisher(),
            email=ResendTransactionalEmailSender(),
        )
    )
