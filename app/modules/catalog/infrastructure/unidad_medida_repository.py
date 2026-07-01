"""Adaptador CRUD de unidades de medida."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.repositories.unidadMedida_crud_repository import UnidadMedidaCRUDRepository


class SqlAlchemyUnidadMedidaRepository:
    def __init__(self, session: AsyncSession):
        self._repo = UnidadMedidaCRUDRepository(session)

    async def listar(self, **kwargs: Any) -> tuple[list[Any], int]:
        return await self._repo.listar(**kwargs)

    async def obtener_por_id(self, unidad_medida_id: int, empresa_id: int | None = None) -> Any | None:
        return await self._repo.obtener_por_id(unidad_medida_id, empresa_id)

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
        unidad_medida_id: int,
        empresa_id: int,
        nombre: str | None = None,
        codigo: str | None = None,
        activo: bool | None = None,
    ) -> Any | None:
        return await self._repo.actualizar(unidad_medida_id, empresa_id, nombre, codigo, activo)

    async def eliminar(self, unidad_medida_id: int, empresa_id: int) -> bool:
        return await self._repo.eliminar(unidad_medida_id, empresa_id)
