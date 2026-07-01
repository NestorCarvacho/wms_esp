"""Tests handlers tipo zona."""
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.modules.warehouse.application.commands import CrearTipoZonaCommand
from app.modules.warehouse.application.handlers.tipo_zona_handlers import CrearTipoZonaHandler


@pytest.mark.asyncio
async def test_crear_tipo_zona_ok():
    repo = AsyncMock()
    repo.obtener_por_nombre.return_value = None
    tipo = MagicMock(id=1, nombre="Picking", empresa_id=1, activo=True)
    repo.crear.return_value = tipo
    handler = CrearTipoZonaHandler(repo)
    result = await handler.handle(CrearTipoZonaCommand(empresa_id=1, nombre="Picking"))
    assert result["nombre"] == "Picking"
