"""Dependencias FastAPI del módulo notifications."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.notification_container import NotificationHandlers, build_notification_handlers
from app.infrastructure.database import get_db_session


async def obtener_notification_handlers(
    session: AsyncSession = Depends(get_db_session),
) -> NotificationHandlers:
    return build_notification_handlers(session)
