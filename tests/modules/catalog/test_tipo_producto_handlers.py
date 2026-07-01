"""Tests handlers tipo producto."""
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.modules.catalog.application.commands import CrearTipoProductoCommand
from app.modules.catalog.application.handlers.tipo_producto_handlers import CrearTipoProductoHandler


@pytest.mark.asyncio
async def test_crear_tipo_producto_nombre_duplicado():
    repo = AsyncMock()
    repo.obtener_por_nombre.return_value = MagicMock(id=1)
    handler = CrearTipoProductoHandler(repo)
    with pytest.raises(ValueError, match="Ya existe un tipo"):
        await handler.handle(CrearTipoProductoCommand(empresa_id=1, nombre="Electrónica"))


@pytest.mark.asyncio
async def test_crear_tipo_producto_ok():
    repo = AsyncMock()
    repo.obtener_por_nombre.return_value = None
    tipo = MagicMock(id=3, nombre="Electrónica", empresa_id=1, activo=True)
    repo.crear.return_value = tipo
    handler = CrearTipoProductoHandler(repo)
    result = await handler.handle(CrearTipoProductoCommand(empresa_id=1, nombre="Electrónica"))
    assert result["id"] == 3
