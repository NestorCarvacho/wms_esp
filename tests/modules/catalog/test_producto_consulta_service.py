"""Tests de ProductoConsultaService."""
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.modules.catalog.infrastructure.producto_consulta_service import ProductoConsultaService


def _producto_orm(**kwargs):
    producto = MagicMock()
    producto.id = kwargs.get("id", 10)
    producto.empresa_id = kwargs.get("empresa_id", 1)
    producto.sku = kwargs.get("sku", "SKU-1")
    producto.nombre = kwargs.get("nombre", "Tornillo")
    producto.activo = True
    producto.serializado = False
    producto.unidad_medida_id = 1
    producto.tipo_producto_id = None
    producto.precio_costo = None
    producto.empresa = MagicMock(nombre="Empresa Test")
    producto.unidad_medida = MagicMock(nombre="Unidad")
    producto.tipo_producto = None
    return producto


@pytest.mark.asyncio
async def test_consultar_por_codigo_por_sku_agrega_stock(monkeypatch):
    producto_repo = MagicMock()
    presentacion_repo = MagicMock()
    stock_port = MagicMock()
    stock_port.listar_stock_producto = AsyncMock(
        return_value=[{"cantidad": 4.0, "zona_bodega_id": 2}, {"cantidad": 6.0, "zona_bodega_id": 3}]
    )

    producto = _producto_orm()
    producto_repo.obtener_por_sku = AsyncMock(return_value=producto)
    presentacion_repo.buscar_por_codigo_barras = AsyncMock(return_value=None)
    presentacion_repo.listar_por_producto = AsyncMock(return_value=([], 0))

    service = ProductoConsultaService(producto_repo, presentacion_repo, stock_port)
    service._buscar_sku_insensitive = AsyncMock(return_value=None)
    service._buscar_por_numero_serie = AsyncMock(return_value=None)
    service._cargar_producto = AsyncMock(return_value=producto)
    service._resumen_series = AsyncMock(return_value=([], 0))

    resultado = await service.consultar_por_codigo("SKU-1", [1])

    assert resultado["via"] == "sku"
    assert resultado["stock"]["total_unidades_base"] == 10.0
    assert len(resultado["stock"]["por_zona"]) == 2
    stock_port.listar_stock_producto.assert_awaited_once_with(empresa_id=1, producto_id=10)


@pytest.mark.asyncio
async def test_consultar_por_codigo_vacio_falla():
    service = ProductoConsultaService(MagicMock(), MagicMock(), MagicMock())
    with pytest.raises(ValueError, match="Ingrese un SKU"):
        await service.consultar_por_codigo("   ", [1])
