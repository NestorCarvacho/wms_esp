"""Composition root del módulo notifications."""
from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import NOTIFICATIONS_MODE
from app.modules.notifications.application.dispatcher import NotificationDispatcher
from app.modules.notifications.application.remote_dispatcher import RemoteNotificationDispatcher
from app.modules.notifications.domain.ports import INotificationDispatcher
from app.modules.notifications.application.handlers.notificacion_handlers import (
    ContarNoLeidasQueryHandler,
    ListarNotificacionesQueryHandler,
    MarcarNotificacionLeidaHandler,
    MarcarTodasLeidasHandler,
)
from app.modules.notifications.infrastructure.notificacion_repository import SqlAlchemyNotificacionRepository
from app.modules.notifications.infrastructure.redis_stock_publisher import RedisStockEventPublisher
from app.modules.notifications.infrastructure.resend_email_sender import ResendTransactionalEmailSender
from app.modules.notifications.infrastructure.ws_stock_publisher import WebSocketStockPublisher


@dataclass
class NotificationHandlers:
    dispatcher: INotificationDispatcher
    listar_notificaciones: ListarNotificacionesQueryHandler
    contar_no_leidas: ContarNoLeidasQueryHandler
    marcar_leida: MarcarNotificacionLeidaHandler
    marcar_todas_leidas: MarcarTodasLeidasHandler


def _build_dispatcher(repo: SqlAlchemyNotificacionRepository):
    if NOTIFICATIONS_MODE == "remote":
        return RemoteNotificationDispatcher(RedisStockEventPublisher())
    return NotificationDispatcher(
        realtime=WebSocketStockPublisher(),
        email=ResendTransactionalEmailSender(),
        notificaciones=repo,
    )


def build_notification_handlers(session: AsyncSession) -> NotificationHandlers:
    repo = SqlAlchemyNotificacionRepository(session)
    return NotificationHandlers(
        dispatcher=_build_dispatcher(repo),
        listar_notificaciones=ListarNotificacionesQueryHandler(repo),
        contar_no_leidas=ContarNoLeidasQueryHandler(repo),
        marcar_leida=MarcarNotificacionLeidaHandler(repo),
        marcar_todas_leidas=MarcarTodasLeidasHandler(repo),
    )
