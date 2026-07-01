"""Unit of Work SQLAlchemy para el módulo inventario."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.inventory.infrastructure.sqlalchemy_repository import SqlAlchemyInventarioRepository


class SqlAlchemyInventoryUnitOfWork:
    def __init__(self, session: AsyncSession):
        self.inventario = SqlAlchemyInventarioRepository(session)

    async def commit(self) -> None:
        await self.inventario.commit()

    async def rollback(self) -> None:
        await self.inventario.rollback()
