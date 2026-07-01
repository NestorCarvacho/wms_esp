"""Unit of Work para operaciones de autenticación."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.iam.infrastructure.sqlalchemy_repositories import (
    SqlAlchemyPasswordResetRepository,
    SqlAlchemyUsuarioAuthRepository,
)


class SqlAlchemyAuthUnitOfWork:
    def __init__(self, session: AsyncSession):
        self._session = session
        self.usuarios = SqlAlchemyUsuarioAuthRepository(session)
        self.reset = SqlAlchemyPasswordResetRepository(session)

    async def commit(self) -> None:
        await self._session.commit()

    async def rollback(self) -> None:
        await self._session.rollback()
