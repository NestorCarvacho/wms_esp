"""Tests unitarios del validador de importación."""
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.modules.catalog.infrastructure.producto_importacion_validador import (
    ProductoImportacionValidador,
)


@pytest.mark.asyncio
async def test_validar_filas_productos_detecta_sku_duplicado_en_bd():
    session = AsyncMock()
    producto_repo = MagicMock()
    presentacion_repo = MagicMock()
    validador = ProductoImportacionValidador(session, producto_repo, presentacion_repo)

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
    session = AsyncMock()
    producto_repo = MagicMock()
    presentacion_repo = MagicMock()
    validador = ProductoImportacionValidador(session, producto_repo, presentacion_repo)

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
