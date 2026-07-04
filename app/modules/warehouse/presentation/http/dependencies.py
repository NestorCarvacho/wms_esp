"""Dependencias FastAPI del módulo warehouse."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.warehouse_container import WarehouseHandlers, build_warehouse_handlers
from app.infrastructure.database import get_db_session


async def obtener_warehouse_handlers(
    session: AsyncSession = Depends(get_db_session),
) -> WarehouseHandlers:
    return build_warehouse_handlers(session)
