"""Adaptador CRUD de unidades de medida."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.repositories.unidadMedida_crud_repository import UnidadMedidaCRUDRepository
from app.modules.catalog.domain.entities import UnidadMedida
from app.modules.catalog.infrastructure.orm_mappers import unidad_medida_desde_orm


class SqlAlchemyUnidadMedidaRepository:
    def __init__(self, session: AsyncSession):
        self._repo = UnidadMedidaCRUDRepository(session)

    async def listar(self, **kwargs: Any) -> tuple[list[UnidadMedida], int]:
        rows, total = await self._repo.listar(**kwargs)
        return [unidad_medida_desde_orm(r) for r in rows], total

    async def obtener_por_id(self, unidad_medida_id: int, empresa_id: int | None = None) -> UnidadMedida | None:
        row = await self._repo.obtener_por_id(unidad_medida_id, empresa_id)
        return unidad_medida_desde_orm(row) if row else None

    async def obtener_por_nombre(self, nombre: str, empresa_id: int) -> UnidadMedida | None:
        row = await self._repo.obtener_por_nombre(nombre, empresa_id)
        return unidad_medida_desde_orm(row) if row else None

    async def obtener_por_codigo(self, codigo: str, empresa_id: int) -> UnidadMedida | None:
        row = await self._repo.obtener_por_codigo(codigo, empresa_id)
        return unidad_medida_desde_orm(row) if row else None

    async def crear(
        self, empresa_id: int, nombre: str, codigo: str, activo: bool = True
    ) -> UnidadMedida:
        row = await self._repo.crear(empresa_id, nombre, codigo, activo)
        return unidad_medida_desde_orm(row)

    async def actualizar(
        self,
        unidad_medida_id: int,
        empresa_id: int,
        nombre: str | None = None,
        codigo: str | None = None,
        activo: bool | None = None,
    ) -> UnidadMedida | None:
        row = await self._repo.actualizar(unidad_medida_id, empresa_id, nombre, codigo, activo)
        return unidad_medida_desde_orm(row) if row else None

    async def eliminar(self, unidad_medida_id: int, empresa_id: int) -> bool:
        return await self._repo.eliminar(unidad_medida_id, empresa_id)
