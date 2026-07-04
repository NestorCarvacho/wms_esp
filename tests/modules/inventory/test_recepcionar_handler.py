"""Tests unitarios del módulo inventario (handlers con fakes)."""
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.modules.inventory.application.commands import RecepcionarCommand
from app.modules.inventory.application.handlers.recepcionar_handler import RecepcionarHandler
from app.modules.inventory.domain.services.presentacion_converter import PresentacionConverter


class FakeInventarioRepo:
    def __init__(self):
        self.producto = MagicMock()
        self.zona = MagicMock()
        self.zona.id = 10
        self.zona.bodega_id = 1
        self.movimiento = MagicMock()
        self.movimiento.id = 99
        self.movimiento.tipo = "RECEPCION"
        self.movimiento.producto_id = 5
        self.movimiento.producto = MagicMock(sku="SKU-1", nombre="Producto test")
        self.movimiento.cantidad = Decimal("100")
        self.movimiento.presentacion_id = None
        self.movimiento.venta_por_presentacion = False
        self.movimiento.zona_origen_id = None
        self.movimiento.zona_origen = None
        self.movimiento.zona_destino_id = 10
        self.movimiento.zona_destino = self.zona
        self.movimiento.documento_tipo = None
        self.movimiento.documento_folio = None
        self.movimiento.observaciones = None
        self.movimiento.usuario_id = 1
        self.movimiento.usuario = MagicMock(email="test@wms.com")
        self.movimiento.creado_at = None

    async def obtener_producto(self, producto_id, empresa_id):
        return self.producto if producto_id == 5 else None

    async def obtener_zona(self, zona_id, empresa_id=None):
        return self.zona if zona_id == 10 else None

    async def get_bodega_config(self, bodega_id):
        return None

    async def ajustar_stock(self, zona_id, producto_id, delta):
        return delta

    async def registrar_movimiento(self, datos):
        return self.movimiento

    async def commit(self):
        pass

    async def rollback(self):
        pass


class FakeUoW:
    def __init__(self, repo):
        self.inventario = repo

    async def commit(self):
        await self.inventario.commit()

    async def rollback(self):
        await self.inventario.rollback()


@pytest.mark.asyncio
async def test_recepcionar_sin_zona_default_falla():
    repo = FakeInventarioRepo()
    handler = RecepcionarHandler(FakeUoW(repo))
    cmd = RecepcionarCommand(
        empresa_id=1,
        usuario_id=1,
        bodega_id=1,
        producto_id=5,
        cantidad=Decimal("10"),
    )
    with pytest.raises(ValueError, match="zona de recepción"):
        await handler.handle(cmd)


@pytest.mark.asyncio
async def test_recepcionar_con_zona_destino_ok():
    repo = FakeInventarioRepo()
    handler = RecepcionarHandler(FakeUoW(repo), PresentacionConverter())
    cmd = RecepcionarCommand(
        empresa_id=1,
        usuario_id=1,
        bodega_id=1,
        producto_id=5,
        cantidad=Decimal("10"),
        zona_destino_id=10,
    )
    result = await handler.handle(cmd)
    assert result["id"] == 99
    assert result["stock_destino"] == 10.0


@pytest.mark.asyncio
async def test_presentacion_converter_empaque():
    conv = PresentacionConverter()
    base = conv.calcular_descuento_stock_base(
        cantidad=Decimal("3"),
        cantidad_contenida=Decimal("100"),
        venta_por_presentacion=True,
        permite_venta_unidad=False,
        permite_venta_presentacion=True,
    )
    assert base == Decimal("300")
