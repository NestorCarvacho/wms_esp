"""Tests handlers zona bodega."""
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.modules.warehouse.application.commands import CrearZonaBodegaCommand
from app.modules.warehouse.application.handlers.zona_bodega_handlers import CrearZonaBodegaHandler


@pytest.mark.asyncio
async def test_crear_zona_bodega_empresa_distinta():
    zonas = AsyncMock()
    bodegas = AsyncMock()
    tipos = AsyncMock()
    bodega = MagicMock(id=1, empresa_id=1, activo=True)
    tipo = MagicMock(id=2, empresa_id=2, activo=True)
    bodegas.obtener_por_id.return_value = bodega
    tipos.obtener_por_id.return_value = tipo
    handler = CrearZonaBodegaHandler(zonas, bodegas, tipos)
    with pytest.raises(ValueError, match="misma empresa"):
        await handler.handle(
            CrearZonaBodegaCommand(
                empresa_id=1, bodega_id=1, tipo_zona_id=2, nombre="A-01"
            )
        )
