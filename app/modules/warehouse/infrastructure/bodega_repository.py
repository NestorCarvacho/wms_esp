"""Adaptador CRUD de bodegas."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.repositories.bodega_crud_repository import BodegaCRUDRepository


class SqlAlchemyBodegaRepository:
    def __init__(self, session: AsyncSession):
        self._repo = BodegaCRUDRepository(session)

    async def listar(self, **kwargs: Any) -> tuple[list[Any], int]:
        return await self._repo.listar(**kwargs)

    async def obtener_por_id(self, bodega_id: int, empresa_id: int | None = None) -> Any | None:
        return await self._repo.obtener_por_id(bodega_id, empresa_id)

    async def obtener_por_nombre(self, nombre: str, empresa_id: int) -> Any | None:
        return await self._repo.obtener_por_nombre(nombre, empresa_id)

    async def obtener_por_codigo(self, codigo: str, empresa_id: int) -> Any | None:
        return await self._repo.obtener_por_codigo(codigo, empresa_id)

    async def crear(
        self, empresa_id: int, nombre: str, codigo: str, activo: bool = True
    ) -> Any:
        return await self._repo.crear(empresa_id, nombre, codigo, activo)

    async def actualizar(
        self,
        bodega_id: int,
        empresa_id: int,
        nombre: str | None = None,
        codigo: str | None = None,
        activo: bool | None = None,
    ) -> Any | None:
        return await self._repo.actualizar(bodega_id, empresa_id, nombre, codigo, activo)

    async def eliminar(self, bodega_id: int, empresa_id: int) -> bool:
        return await self._repo.eliminar(bodega_id, empresa_id)
