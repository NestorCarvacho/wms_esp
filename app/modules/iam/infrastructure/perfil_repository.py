"""Adaptador SQLAlchemy — perfil de usuario."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.repositories.perfil_usuario_crud_repository import PerfilUsuarioCRUDRepository


class SqlAlchemyPerfilUsuarioRepository:
    def __init__(self, session: AsyncSession):
        self._repo = PerfilUsuarioCRUDRepository(session)

    async def obtener_por_usuario_id(self, usuario_id: int) -> Any | None:
        return await self._repo.obtener_por_usuario_id(usuario_id)

    async def obtener_por_rut(self, rut: str) -> Any | None:
        return await self._repo.obtener_por_rut(rut)

    async def crear(self, usuario_id: int, **datos: Any) -> Any:
        return await self._repo.crear(usuario_id=usuario_id, **datos)

    async def actualizar(self, usuario_id: int, **datos: Any) -> Any | None:
        return await self._repo.actualizar(usuario_id, **datos)
