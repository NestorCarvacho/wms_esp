"""Tests handlers CRUD empresa."""
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.modules.tenant.application.commands import CrearEmpresaCommand
from app.modules.tenant.application.handlers.empresa_handlers import CrearEmpresaHandler


@pytest.mark.asyncio
async def test_crear_empresa_codigo_duplicado():
    repo = AsyncMock()
    repo.obtener_por_codigo.return_value = MagicMock(id=1)
    handler = CrearEmpresaHandler(repo)
    with pytest.raises(ValueError, match="ya existe"):
        await handler.handle(
            CrearEmpresaCommand(codigo="ACME", razon_social="Acme SA", campos={})
        )


@pytest.mark.asyncio
async def test_crear_empresa_ok():
    repo = AsyncMock()
    repo.obtener_por_codigo.return_value = None
    empresa = MagicMock(
        id=2,
        codigo="ACME",
        razon_social="Acme SA",
        nombre_fantasia=None,
        rut=None,
        giro=None,
        telefono=None,
        correo=None,
        sitio_web=None,
        esta_activa=True,
        creado_at=None,
        direccion=None,
        region_id=None,
        ciudad_id=None,
        comuna_id=None,
    )
    empresa.es_empresa_maestra = False
    repo.crear.return_value = empresa
    handler = CrearEmpresaHandler(repo)
    result = await handler.handle(
        CrearEmpresaCommand(codigo="ACME", razon_social="Acme SA", campos={})
    )
    assert result["id"] == 2
    assert result["codigo"] == "ACME"
