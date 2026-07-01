"""Suscriptor Redis — procesa StockEventV1 con dispatcher local."""
from __future__ import annotations

import asyncio
import logging

import redis.asyncio as redis

from app.bootstrap.notification_container import build_notification_handlers
from app.core.config import REDIS_URL, STOCK_EVENTS_CHANNEL
from app.infrastructure.database import async_session
from app.shared.events.stock_event import StockEventV1

logger = logging.getLogger(__name__)


async def _dispatch_event(event: StockEventV1) -> None:
    async with async_session() as session:
        handlers = build_notification_handlers(session)
        dispatcher = handlers.dispatcher

        if event.event_type == "STOCK_CRITICO" and event.usuario_id is not None:
            await dispatcher.notify_stock_critical(
                event.empresa_id,
                event.usuario_id,
                event.payload,
                email_to=event.email_to,
            )
            return

        if event.event_type == "EMAIL_ALERT" and event.email_to:
            await dispatcher.send_alert_email(
                to=event.email_to,
                subject=event.payload.get("subject", "Alerta WMS"),
                html=event.payload.get("html", ""),
            )
            return

        await dispatcher.publish_stock_event(
            event.empresa_id,
            event.event_type,
            event.payload,
        )


async def run_stock_events_subscriber(stop_event: asyncio.Event) -> None:
    """Escucha el canal Redis y delega al módulo notifications (modo local)."""
    client = redis.from_url(REDIS_URL, decode_responses=True)
    pubsub = client.pubsub()
    await pubsub.subscribe(STOCK_EVENTS_CHANNEL)
    logger.info("Suscriptor Redis activo en canal %s", STOCK_EVENTS_CHANNEL)

    try:
        while not stop_event.is_set():
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
            if message is None:
                continue
            if message.get("type") != "message":
                continue
            try:
                event = StockEventV1.from_json(message["data"])
                await _dispatch_event(event)
            except Exception:
                logger.exception("Error procesando evento de stock")
    finally:
        await pubsub.unsubscribe(STOCK_EVENTS_CHANNEL)
        await pubsub.aclose()
        await client.aclose()
        logger.info("Suscriptor Redis detenido")
