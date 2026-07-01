"""Dependencias FastAPI del módulo catalog."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.services.producto_service import ProductoService
from app.infrastructure.database import get_db_session


async def obtener_producto_service(
    session: AsyncSession = Depends(get_db_session),
) -> ProductoService:
    return ProductoService(session)
