"""Tests unitarios del validador de importación."""
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.modules.catalog.infrastructure.producto_importacion_validador import (
    ProductoImportacionValidador,
)


@pytest.mark.asyncio
async def test_cargar_existentes_delega_en_producto_repo():
    producto_repo = AsyncMock()
    producto_repo.listar_skus_y_nombres_empresa.return_value = ({"SKU-1"}, {"Prod"})
    validador = ProductoImportacionValidador(producto_repo, MagicMock())

    skus, nombres = await validador.cargar_existentes(empresa_id=3)

    assert skus == {"SKU-1"}
    assert nombres == {"Prod"}
    producto_repo.listar_skus_y_nombres_empresa.assert_awaited_once_with(3)


@pytest.mark.asyncio
async def test_validar_filas_productos_detecta_sku_duplicado_en_bd():
    producto_repo = AsyncMock()
    presentacion_repo = MagicMock()
    validador = ProductoImportacionValidador(producto_repo, presentacion_repo)

    filas = [
        {
            "fila": 2,
            "sku": "SKU-EXISTE",
            "nombre": "Nuevo nombre",
            "unidad_medida_id": 1,
            "tipo_producto_id": None,
            "precio_costo": None,
            "codigo_barras": None,
            "serializado": None,
        }
    ]
    validos, errores = validador.validar_filas_productos(
        filas,
        empresa_id=1,
        unidades_validas={1},
        tipos_validos=set(),
        skus_bd={"SKU-EXISTE"},
        nombres_bd=set(),
        barcodes_bd=set(),
    )

    assert validos == []
    assert len(errores) == 1
    assert "ya existe en la empresa" in errores[0]["errores"][0]


@pytest.mark.asyncio
async def test_validar_filas_productos_acepta_fila_valida():
    producto_repo = AsyncMock()
    presentacion_repo = MagicMock()
    validador = ProductoImportacionValidador(producto_repo, presentacion_repo)

    filas = [
        {
            "fila": 2,
            "sku": "SKU-OK",
            "nombre": "Producto OK",
            "unidad_medida_id": 1,
            "tipo_producto_id": None,
            "precio_costo": None,
            "codigo_barras": None,
            "serializado": None,
        }
    ]
    validos, errores = validador.validar_filas_productos(
        filas,
        empresa_id=1,
        unidades_validas={1},
        tipos_validos=set(),
        skus_bd=set(),
        nombres_bd=set(),
        barcodes_bd=set(),
    )

    assert len(validos) == 1
    assert errores == []
    assert validos[0]["sku"] == "SKU-OK"
