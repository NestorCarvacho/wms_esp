"""Dependencias FastAPI del módulo catalog."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.services.producto_service import ProductoService
from app.domain.services.tipo_producto_service import TipoProductoService
from app.domain.services.unidadMedidad_service import UnidadMedidaService
from app.infrastructure.database import get_db_session


async def obtener_producto_service(
    session: AsyncSession = Depends(get_db_session),
) -> ProductoService:
    return ProductoService(session)


async def obtener_tipo_producto_service(
    session: AsyncSession = Depends(get_db_session),
) -> TipoProductoService:
    return TipoProductoService(session)


async def obtener_unidad_medida_service(
    session: AsyncSession = Depends(get_db_session),
) -> UnidadMedidaService:
    return UnidadMedidaService(session)
