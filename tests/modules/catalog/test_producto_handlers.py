"""Tests handlers CRUD producto."""
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.modules.catalog.application.commands import CrearProductoCommand
from app.modules.catalog.application.handlers.producto_handlers import CrearProductoHandler


@pytest.mark.asyncio
async def test_crear_producto_nombre_duplicado():
    repo = AsyncMock()
    repo.obtener_por_nombre.return_value = MagicMock(id=1)
    handler = CrearProductoHandler(repo)
    with pytest.raises(ValueError, match="Ya existe una producto"):
        await handler.handle(
            CrearProductoCommand(empresa_id=1, nombre="Tornillo", sku="SKU-1")
        )


@pytest.mark.asyncio
async def test_crear_producto_stock_minimo_negativo():
    repo = AsyncMock()
    repo.obtener_por_nombre.return_value = None
    handler = CrearProductoHandler(repo)
    with pytest.raises(ValueError, match="no puede ser negativo"):
        await handler.handle(
            CrearProductoCommand(
                empresa_id=1,
                nombre="Tornillo",
                sku="SKU-1",
                unidad_medida_id=1,
                stock_minimo=-1,
            )
        )


@pytest.mark.asyncio
async def test_crear_producto_ok():
    repo = AsyncMock()
    repo.obtener_por_nombre.return_value = None
    producto = MagicMock(
        id=10,
        empresa_id=1,
        nombre="Tornillo",
        sku="SKU-1",
        activo=True,
        unidad_medida_id=1,
        tipo_producto_id=None,
        precio_costo=100.0,
        serializado=False,
    )
    repo.crear.return_value = producto
    handler = CrearProductoHandler(repo)
    result = await handler.handle(
        CrearProductoCommand(empresa_id=1, nombre="Tornillo", sku="SKU-1")
    )
    assert result["id"] == 10
    assert result["nombre"] == "Tornillo"
