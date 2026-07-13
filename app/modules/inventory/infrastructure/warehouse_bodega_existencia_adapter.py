"""Adaptador de existencia de bodega — delega en el módulo warehouse."""
from __future__ import annotations

from app.modules.warehouse.infrastructure.bodega_crud import BodegaCRUDRepository


class WarehouseBodegaExistenciaAdapter:
    def __init__(self, bodega_repo: BodegaCRUDRepository):
        self._bodega_repo = bodega_repo

    async def existe(self, bodega_id: int, empresa_id: int) -> bool:
        bodega = await self._bodega_repo.obtener_por_id(bodega_id, empresa_id)
        return bodega is not None
