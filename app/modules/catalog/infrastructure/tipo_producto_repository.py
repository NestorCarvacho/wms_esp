"""Adaptador CRUD de tipos de producto."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.catalog.infrastructure.tipo_producto_crud import TipoProductoCRUDRepository
from app.modules.catalog.domain.entities import TipoProducto
from app.modules.catalog.infrastructure.orm_mappers import tipo_producto_desde_orm


class SqlAlchemyTipoProductoRepository:
    def __init__(self, session: AsyncSession):
        self._repo = TipoProductoCRUDRepository(session)

    async def listar(self, **kwargs: Any) -> tuple[list[TipoProducto], int]:
        rows, total = await self._repo.listar(**kwargs)
        return [tipo_producto_desde_orm(r) for r in rows], total

    async def obtener_por_id(self, tipo_producto_id: int, empresa_id: int | None = None) -> TipoProducto | None:
        row = await self._repo.obtener_por_id(tipo_producto_id, empresa_id)
        return tipo_producto_desde_orm(row) if row else None

    async def obtener_por_nombre(self, nombre: str, empresa_id: int) -> TipoProducto | None:
        row = await self._repo.obtener_por_nombre(nombre, empresa_id)
        return tipo_producto_desde_orm(row) if row else None

    async def crear(self, empresa_id: int, nombre: str, activo: bool = True) -> TipoProducto:
        row = await self._repo.crear(empresa_id, nombre, activo)
        return tipo_producto_desde_orm(row)

    async def actualizar(
        self,
        tipo_producto_id: int,
        empresa_id: int,
        nombre: str | None = None,
        activo: bool | None = None,
    ) -> TipoProducto | None:
        row = await self._repo.actualizar(tipo_producto_id, empresa_id, nombre, activo)
        return tipo_producto_desde_orm(row) if row else None

    async def eliminar(self, tipo_producto_id: int, empresa_id: int) -> bool:
        return await self._repo.eliminar(tipo_producto_id, empresa_id)
