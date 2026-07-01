"""Tests catálogo RBAC."""
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.modules.iam.application.commands_catalog import CrearRolCommand
from app.modules.iam.application.handlers.catalog_handlers import CrearRolHandler


@pytest.mark.asyncio
async def test_crear_rol_nombre_duplicado():
    repo = AsyncMock()
    repo.obtener_por_nombre.return_value = MagicMock(id=1)
    handler = CrearRolHandler(repo)
    with pytest.raises(ValueError, match="Ya existe un rol"):
        await handler.handle(
            CrearRolCommand(empresa_id=1, nombre="Admin", descripcion="Administrador")
        )


@pytest.mark.asyncio
async def test_crear_rol_ok():
    repo = AsyncMock()
    repo.obtener_por_nombre.return_value = None
    rol = MagicMock(id=5, empresa_id=1, nombre="Operador", descripcion="Operaciones", activo=True)
    repo.crear.return_value = rol
    handler = CrearRolHandler(repo)
    result = await handler.handle(
        CrearRolCommand(empresa_id=1, nombre="Operador", descripcion="Operaciones")
    )
    assert result["id"] == 5
    assert result["nombre"] == "Operador"
