"""Dependencias FastAPI del módulo catalog."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.catalog_container import CatalogHandlers, build_catalog_handlers
from app.infrastructure.database import get_db_session


async def obtener_catalog_handlers(
    session: AsyncSession = Depends(get_db_session),
) -> CatalogHandlers:
    return build_catalog_handlers(session)
