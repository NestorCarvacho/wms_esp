"""Tests handlers bodega."""
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.modules.warehouse.application.commands import CrearBodegaCommand
from app.modules.warehouse.application.handlers.bodega_handlers import CrearBodegaHandler


@pytest.mark.asyncio
async def test_crear_bodega_nombre_duplicado():
    repo = AsyncMock()
    repo.obtener_por_nombre.return_value = MagicMock(id=1)
    handler = CrearBodegaHandler(repo)
    with pytest.raises(ValueError, match="Ya existe una bodega"):
        await handler.handle(
            CrearBodegaCommand(empresa_id=1, nombre="Central", codigo="B01")
        )


@pytest.mark.asyncio
async def test_crear_bodega_ok():
    repo = AsyncMock()
    repo.obtener_por_nombre.return_value = None
    bodega = MagicMock(id=2, empresa_id=1, nombre="Central", codigo="B01", activo=True)
    repo.crear.return_value = bodega
    handler = CrearBodegaHandler(repo)
    result = await handler.handle(
        CrearBodegaCommand(empresa_id=1, nombre="Central", codigo="B01")
    )
    assert result["id"] == 2
    assert result["codigo"] == "B01"
