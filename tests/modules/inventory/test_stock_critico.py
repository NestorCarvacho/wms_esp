"""Tests evaluación stock crítico."""
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.modules.inventory.application.operation_helpers import evaluar_stock_critico_tras_despacho


@pytest.mark.asyncio
async def test_no_emite_sin_umbral():
    notifications = AsyncMock()
    producto = MagicMock(stock_minimo=None)
    await evaluar_stock_critico_tras_despacho(
        notifications,
        empresa_id=1,
        usuario_id=2,
        producto=producto,
        stock_zona=Decimal("5"),
        payload_base={"producto_nombre": "A"},
    )
    notifications.notify_stock_critical.assert_not_awaited()


@pytest.mark.asyncio
async def test_emite_cuando_stock_bajo_umbral():
    notifications = AsyncMock()
    producto = MagicMock(id=10, stock_minimo=Decimal("10"))
    await evaluar_stock_critico_tras_despacho(
        notifications,
        empresa_id=1,
        usuario_id=2,
        producto=producto,
        stock_zona=Decimal("8"),
        payload_base={"producto_nombre": "Tornillo", "producto_sku": "SKU-1"},
    )
    notifications.notify_stock_critical.assert_awaited_once()
    args = notifications.notify_stock_critical.await_args
    assert args.args[0] == 1
    assert args.args[1] == 2
    assert args.args[2]["cantidad"] == 8.0


@pytest.mark.asyncio
async def test_no_emite_si_stock_sobre_umbral():
    notifications = AsyncMock()
    producto = MagicMock(id=10, stock_minimo=Decimal("5"))
    await evaluar_stock_critico_tras_despacho(
        notifications,
        empresa_id=1,
        usuario_id=2,
        producto=producto,
        stock_zona=Decimal("20"),
        payload_base={"producto_nombre": "Tornillo"},
    )
    notifications.notify_stock_critical.assert_not_awaited()
