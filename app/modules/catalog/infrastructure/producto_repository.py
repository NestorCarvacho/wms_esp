"""Adaptador CRUD de productos."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.catalog.infrastructure.producto_crud import ProductoCRUDRepository
from app.modules.catalog.domain.entities import Producto
from app.modules.catalog.infrastructure.orm_mappers import producto_desde_orm


class SqlAlchemyProductoRepository:
    def __init__(self, session: AsyncSession):
        self._repo = ProductoCRUDRepository(session)

    async def listar(self, **kwargs: Any) -> tuple[list[Producto], int]:
        rows, total = await self._repo.listar(**kwargs)
        return [producto_desde_orm(r) for r in rows], total

    async def obtener_por_id(self, producto_id: int, empresa_id: int | None = None) -> Producto | None:
        row = await self._repo.obtener_por_id(producto_id, empresa_id)
        return producto_desde_orm(row) if row else None

    async def obtener_por_sku(self, sku: str, empresa_id: int) -> Producto | None:
        row = await self._repo.obtener_por_sku(sku, empresa_id)
        return producto_desde_orm(row) if row else None

    async def obtener_por_nombre(self, nombre: str, empresa_id: int) -> Producto | None:
        row = await self._repo.obtener_por_nombre(nombre, empresa_id)
        return producto_desde_orm(row) if row else None

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
        stock_minimo: float | None = None,
    ) -> Producto:
        row = await self._repo.crear(
            empresa_id,
            nombre,
            sku,
            activo,
            unidad_medida_id,
            tipo_producto_id,
            precio_costo,
            serializado=serializado,
            stock_minimo=stock_minimo,
        )
        return producto_desde_orm(row)

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
        stock_minimo: float | None = None,
        actualizar_stock_minimo: bool = False,
    ) -> Producto | None:
        row = await self._repo.actualizar(
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
            stock_minimo=stock_minimo,
            actualizar_stock_minimo=actualizar_stock_minimo,
        )
        return producto_desde_orm(row) if row else None

    async def eliminar(self, producto_id: int, empresa_id: int) -> bool:
        return await self._repo.eliminar(producto_id, empresa_id)

    async def listar_skus_y_nombres_empresa(self, empresa_id: int) -> tuple[set[str], set[str]]:
        return await self._repo.listar_skus_y_nombres_empresa(empresa_id)

    async def listar_codigos_barras_empresa(self, empresa_id: int) -> set[str]:
        return await self._repo.listar_codigos_barras_empresa(empresa_id)

    async def mapa_ids_por_skus(self, empresa_id: int, skus: set[str]) -> dict[str, int]:
        return await self._repo.mapa_ids_por_skus(empresa_id, skus)
