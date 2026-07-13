"""Unit of Work SQLAlchemy para el módulo inventario."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.inventory.infrastructure.sqlalchemy_repository import SqlAlchemyInventarioRepository
from app.modules.inventory.infrastructure.warehouse_bodega_existencia_adapter import (
    WarehouseBodegaExistenciaAdapter,
)
from app.modules.warehouse.infrastructure.bodega_crud import BodegaCRUDRepository


def _crear_inventario_repository(session: AsyncSession) -> SqlAlchemyInventarioRepository:
    bodega_existencia = WarehouseBodegaExistenciaAdapter(BodegaCRUDRepository(session))
    return SqlAlchemyInventarioRepository(session, bodega_existencia=bodega_existencia)


class SqlAlchemyInventoryUnitOfWork:
    def __init__(self, session: AsyncSession):
        self.inventario = _crear_inventario_repository(session)

    async def commit(self) -> None:
        await self.inventario.commit()

    async def rollback(self) -> None:
        await self.inventario.rollback()
