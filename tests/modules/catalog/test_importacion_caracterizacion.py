"""Tests de caracterización para importación masiva de productos."""
from decimal import Decimal
from io import BytesIO
from unittest.mock import AsyncMock, MagicMock

import pytest
from openpyxl import Workbook

from app.modules.catalog.infrastructure.producto_importacion_parser import (
    PRESENTACION_HEADERS,
    SHEET_PRESENTACIONES,
    SHEET_PRODUCTOS,
    TEMPLATE_HEADERS,
)
from app.modules.catalog.infrastructure.producto_importacion_service import ProductoImportacionService


def _excel_producto_nuevo() -> bytes:
    wb = Workbook()
    ws = wb.active
    ws.title = SHEET_PRODUCTOS
    ws.append(TEMPLATE_HEADERS)
    ws.append(["SKU-NUEVO", "Producto nuevo", "", 1, 100, "", 0])
    buffer = BytesIO()
    wb.save(buffer)
    return buffer.getvalue()


def _excel_sku_duplicado_en_archivo() -> bytes:
    wb = Workbook()
    ws = wb.active
    ws.title = SHEET_PRODUCTOS
    ws.append(TEMPLATE_HEADERS)
    ws.append(["SKU-DUP", "Producto A", "", 1, "", "", 0])
    ws.append(["SKU-DUP", "Producto B", "", 1, "", "", 0])
    buffer = BytesIO()
    wb.save(buffer)
    return buffer.getvalue()


def _servicio_con_mocks() -> ProductoImportacionService:
    session = AsyncMock()
    session.execute = AsyncMock(return_value=MagicMock(all=MagicMock(return_value=[])))
    session.add_all = MagicMock()
    session.commit = AsyncMock()
    session.rollback = AsyncMock()

    service = ProductoImportacionService(session)
    unidad = MagicMock(id=1, codigo="UN", nombre="Unidad")
    service.unidad_repo.listar = AsyncMock(return_value=([unidad], 1))
    service.tipo_producto_repo.listar = AsyncMock(return_value=([], 0))
    service.validador.cargar_existentes = AsyncMock(return_value=(set(), set()))
    service.validador.cargar_barcodes_existentes = AsyncMock(return_value=set())
    service.validador.mapa_skus_empresa = AsyncMock(return_value={"SKU-NUEVO": 50})
    service.producto_repo.crear_masivo = AsyncMock(return_value=1)
    service.validador.validar_presentaciones = AsyncMock(return_value=([], []))
    return service


@pytest.mark.asyncio
async def test_importar_happy_path_crea_producto():
    service = _servicio_con_mocks()
    resultado = await service.importar_desde_excel(_excel_producto_nuevo(), empresa_id=1)

    assert resultado["creados"] == 1
    assert resultado["con_errores"] == 0
    assert resultado["errores"] == []
    service.producto_repo.crear_masivo.assert_awaited_once()


@pytest.mark.asyncio
async def test_importar_sku_duplicado_en_archivo_reporta_error():
    service = _servicio_con_mocks()
    service.producto_repo.crear_masivo = AsyncMock(return_value=1)

    resultado = await service.importar_desde_excel(_excel_sku_duplicado_en_archivo(), empresa_id=1)

    assert resultado["creados"] == 1
    assert resultado["con_errores"] >= 1
    assert any(
        "duplicado en el archivo" in err
        for item in resultado["errores"]
        for err in item["errores"]
    )
    service.producto_repo.crear_masivo.assert_awaited_once()
