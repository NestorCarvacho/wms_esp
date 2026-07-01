"""Adaptador CRUD de productos."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.repositories.producto_crud_repository import ProductoCRUDRepository


class SqlAlchemyProductoRepository:
    def __init__(self, session: AsyncSession):
        self._repo = ProductoCRUDRepository(session)

    async def listar(self, **kwargs: Any) -> tuple[list[Any], int]:
        return await self._repo.listar(**kwargs)

    async def obtener_por_id(self, producto_id: int, empresa_id: int | None = None) -> Any | None:
        return await self._repo.obtener_por_id(producto_id, empresa_id)

    async def obtener_por_sku(self, sku: str, empresa_id: int) -> Any | None:
        return await self._repo.obtener_por_sku(sku, empresa_id)

    async def obtener_por_nombre(self, nombre: str, empresa_id: int) -> Any | None:
        return await self._repo.obtener_por_nombre(nombre, empresa_id)

    async def crear(
        self,
        empresa_id: int,
        nombre: str,
        sku: str,
        activo: bool = True,
        unidad_medida_id: int | None = None,
        tipo_producto_id: int | None = None,
        precio_costo: float | None = None,
        serializado: bool = False,
    ) -> Any:
        return await self._repo.crear(
            empresa_id,
            nombre,
            sku,
            activo,
            unidad_medida_id,
            tipo_producto_id,
            precio_costo,
            serializado=serializado,
        )

    async def actualizar(
        self,
        producto_id: int,
        empresa_id: int,
        nombre: str | None = None,
        sku: str | None = None,
        activo: bool | None = None,
        unidad_medida_id: int | None = None,
        tipo_producto_id: int | None = None,
        precio_costo: float | None = None,
        *,
        actualizar_tipo_producto: bool = False,
        serializado: bool | None = None,
    ) -> Any | None:
        return await self._repo.actualizar(
            producto_id,
            empresa_id,
            nombre,
            sku,
            activo,
            unidad_medida_id,
            tipo_producto_id,
            precio_costo,
            actualizar_tipo_producto=actualizar_tipo_producto,
            serializado=serializado,
        )

    async def eliminar(self, producto_id: int, empresa_id: int) -> bool:
        return await self._repo.eliminar(producto_id, empresa_id)
