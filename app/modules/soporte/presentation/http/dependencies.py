"""Dependencias FastAPI del módulo soporte."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.soporte_container import SoporteHandlers, build_soporte_handlers
from app.infrastructure.database import get_db_session


async def obtener_soporte_handlers(
    session: AsyncSession = Depends(get_db_session),
) -> SoporteHandlers:
    return build_soporte_handlers(session)
