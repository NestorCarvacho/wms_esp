"""Dependencias FastAPI del módulo warehouse."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.services.bodega_service import BodegaService
from app.domain.services.tipo_zona_service import TipoZonaService
from app.domain.services.zona_bodega_service import ZonaBodegaService
from app.infrastructure.database import get_db_session


async def obtener_bodega_service(
    session: AsyncSession = Depends(get_db_session),
) -> BodegaService:
    return BodegaService(session)


async def obtener_tipo_zona_service(
    session: AsyncSession = Depends(get_db_session),
) -> TipoZonaService:
    return TipoZonaService(session)


async def obtener_zona_bodega_service(
    session: AsyncSession = Depends(get_db_session),
) -> ZonaBodegaService:
    return ZonaBodegaService(session)
