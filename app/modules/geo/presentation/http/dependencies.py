"""Dependencias FastAPI del módulo geo."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.geo_container import GeoHandlers, build_geo_handlers
from app.infrastructure.database import get_db_session


async def obtener_geo_handlers(
    session: AsyncSession = Depends(get_db_session),
) -> GeoHandlers:
    return build_geo_handlers(session)
