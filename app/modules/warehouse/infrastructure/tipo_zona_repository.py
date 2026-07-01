"""Adaptador CRUD de tipos de zona."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.repositories.tipo_zona_crud_repository import TipoZonaCRUDRepository


class SqlAlchemyTipoZonaRepository:
    def __init__(self, session: AsyncSession):
        self._repo = TipoZonaCRUDRepository(session)

    async def listar(self, **kwargs: Any) -> tuple[list[Any], int]:
        return await self._repo.listar(**kwargs)

    async def obtener_por_id(self, tipo_zona_id: int, empresa_id: int | None = None) -> Any | None:
        return await self._repo.obtener_por_id(tipo_zona_id, empresa_id)

    async def obtener_por_nombre(self, nombre: str, empresa_id: int) -> Any | None:
        return await self._repo.obtener_por_nombre(nombre, empresa_id)

    async def crear(self, empresa_id: int, nombre: str, activo: bool = True) -> Any:
        return await self._repo.crear(empresa_id, nombre, activo)

    async def actualizar(
        self,
        tipo_zona_id: int,
        empresa_id: int,
        nombre: str | None = None,
        activo: bool | None = None,
    ) -> Any | None:
        return await self._repo.actualizar(tipo_zona_id, empresa_id, nombre, activo)

    async def eliminar(self, tipo_zona_id: int, empresa_id: int) -> bool:
        return await self._repo.eliminar(tipo_zona_id, empresa_id)
