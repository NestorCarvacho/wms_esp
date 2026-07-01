"""Adaptador CRUD de zonas de bodega."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.repositories.zona_bodega_crud_repository import ZonaBodegaCRUDRepository


class SqlAlchemyZonaBodegaRepository:
    def __init__(self, session: AsyncSession):
        self._repo = ZonaBodegaCRUDRepository(session)

    async def listar(self, **kwargs: Any) -> tuple[list[Any], int]:
        return await self._repo.listar(**kwargs)

    async def obtener_por_id(self, zona_id: int, empresa_id: int | None = None) -> Any | None:
        return await self._repo.obtener_por_id(zona_id, empresa_id)

    async def crear(
        self,
        bodega_id: int,
        tipo_zona_id: int,
        nombre: str | None = None,
        activo: bool = True,
    ) -> Any:
        return await self._repo.crear(bodega_id, tipo_zona_id, nombre, activo)

    async def actualizar(
        self,
        zona_id: int,
        empresa_id: int,
        bodega_id: int | None = None,
        tipo_zona_id: int | None = None,
        nombre: str | None = None,
        activo: bool | None = None,
        _unset_nombre: bool = False,
    ) -> Any | None:
        return await self._repo.actualizar(
            zona_id,
            empresa_id,
            bodega_id=bodega_id,
            tipo_zona_id=tipo_zona_id,
            nombre=nombre,
            activo=activo,
            _unset_nombre=_unset_nombre,
        )

    async def eliminar(self, zona_id: int, empresa_id: int) -> bool:
        return await self._repo.eliminar(zona_id, empresa_id)
