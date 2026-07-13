"""Tests del adaptador de existencia de bodega (inventory → warehouse)."""
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.modules.inventory.infrastructure.warehouse_bodega_existencia_adapter import (
    WarehouseBodegaExistenciaAdapter,
)


@pytest.mark.asyncio
async def test_bodega_existe_cuando_obtener_por_id_devuelve_registro():
    bodega_repo = MagicMock()
    bodega_repo.obtener_por_id = AsyncMock(return_value=MagicMock(id=1))
    adapter = WarehouseBodegaExistenciaAdapter(bodega_repo)

    assert await adapter.existe(bodega_id=3, empresa_id=7) is True
    bodega_repo.obtener_por_id.assert_awaited_once_with(3, 7)


@pytest.mark.asyncio
async def test_bodega_no_existe_cuando_obtener_por_id_devuelve_none():
    bodega_repo = MagicMock()
    bodega_repo.obtener_por_id = AsyncMock(return_value=None)
    adapter = WarehouseBodegaExistenciaAdapter(bodega_repo)

    assert await adapter.existe(bodega_id=3, empresa_id=7) is False
