"""Adaptador SQLAlchemy — implementa IInventarioRepository."""
from __future__ import annotations

from decimal import Decimal
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.inventory.infrastructure.inventario_crud import InventarioCRUDRepository
from app.modules.warehouse.infrastructure.bodega_crud import BodegaCRUDRepository


class SqlAlchemyInventarioRepository:
    """Wrapper del repositorio legacy hacia el puerto del módulo."""

    def __init__(self, session: AsyncSession):
        self._session = session
        self._crud = InventarioCRUDRepository(session)
        self._bodega = BodegaCRUDRepository(session)

    async def obtener_zona(self, zona_id: int, empresa_id: int | None = None) -> Any | None:
        return await self._crud.obtener_zona(zona_id, empresa_id)

    async def obtener_producto(self, producto_id: int, empresa_id: int) -> Any | None:
        return await self._crud.obtener_producto(producto_id, empresa_id)

    async def obtener_presentacion(
        self, presentacion_id: int, producto_id: int
    ) -> Any | None:
        return await self._crud.obtener_presentacion(presentacion_id, producto_id)

    async def bodega_existe(self, bodega_id: int, empresa_id: int) -> bool:
        bodega = await self._bodega.obtener_por_id(bodega_id, empresa_id)
        return bodega is not None

    async def get_bodega_config(self, bodega_id: int) -> Any | None:
        return await self._crud.get_bodega_config(bodega_id)

    async def upsert_bodega_config(
        self, bodega_id: int, zona_recepcion_default_id: int | None
    ) -> None:
        await self._crud.upsert_bodega_config(bodega_id, zona_recepcion_default_id)

    async def ajustar_stock(
        self, zona_bodega_id: int, producto_id: int, delta: Decimal
    ) -> Decimal:
        return await self._crud.ajustar_stock(zona_bodega_id, producto_id, delta)

    async def registrar_movimiento(self, datos: dict) -> Any:
        return await self._crud.registrar_movimiento(datos)

    async def listar_stock(self, empresa_id: int, **kwargs: Any) -> tuple[list[dict], int]:
        return await self._crud.listar_stock(empresa_id=empresa_id, **kwargs)

    async def listar_movimientos(
        self, empresa_id: int, **kwargs: Any
    ) -> tuple[list[Any], int]:
        return await self._crud.listar_movimientos(empresa_id=empresa_id, **kwargs)

    async def commit(self) -> None:
        await self._crud.commit()

    async def rollback(self) -> None:
        await self._crud.rollback()
