"""Adaptador de consulta de stock — delega en el módulo inventory."""
from __future__ import annotations

from typing import Any

from app.modules.inventory.infrastructure.inventario_crud import InventarioCRUDRepository


class InventarioStockConsultaAdapter:
    def __init__(self, inventario_repo: InventarioCRUDRepository):
        self._inventario_repo = inventario_repo

    async def listar_stock_producto(
        self, empresa_id: int, producto_id: int
    ) -> list[dict[str, Any]]:
        items, _ = await self._inventario_repo.listar_stock(
            empresa_id=empresa_id,
            producto_id=producto_id,
            pagina=1,
            por_pagina=500,
            es_super_admin=False,
        )
        return items
