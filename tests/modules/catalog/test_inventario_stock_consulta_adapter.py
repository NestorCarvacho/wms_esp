"""Tests del adaptador de consulta de stock (catalog → inventory)."""
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.modules.catalog.infrastructure.inventario_stock_consulta_adapter import (
    InventarioStockConsultaAdapter,
)


@pytest.mark.asyncio
async def test_listar_stock_producto_delega_con_parametros_fijos():
    inventario_repo = MagicMock()
    inventario_repo.listar_stock = AsyncMock(return_value=([{"cantidad": 5.0}], 1))
    adapter = InventarioStockConsultaAdapter(inventario_repo)

    result = await adapter.listar_stock_producto(empresa_id=10, producto_id=99)

    assert result == [{"cantidad": 5.0}]
    inventario_repo.listar_stock.assert_awaited_once_with(
        empresa_id=10,
        producto_id=99,
        pagina=1,
        por_pagina=500,
        es_super_admin=False,
    )
