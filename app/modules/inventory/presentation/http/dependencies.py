"""Dependencias FastAPI del módulo inventario (capa presentación)."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.container import InventoryHandlers, build_inventory_handlers
from app.domain.services.inventario_reporte_service import InventarioReporteService
from app.infrastructure.database import get_db_session


async def obtener_inventory_handlers(
    session: AsyncSession = Depends(get_db_session),
) -> InventoryHandlers:
    return build_inventory_handlers(session)


async def obtener_inventario_reporte_service(
    handlers: InventoryHandlers = Depends(obtener_inventory_handlers),
) -> InventarioReporteService:
    return InventarioReporteService(handlers)
