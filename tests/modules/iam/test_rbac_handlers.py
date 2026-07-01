"""Tests de asignación RBAC."""
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.modules.iam.application.commands_rbac import SincronizarRolesUsuarioCommand
from app.modules.iam.application.handlers.rbac_handlers import SincronizarRolesUsuarioHandler


@pytest.mark.asyncio
async def test_sincronizar_roles_usuario_no_autorizado():
    usuario = MagicMock(empresa_id=2)
    repo = AsyncMock()
    repo.obtener_usuario.return_value = usuario
    handler = SincronizarRolesUsuarioHandler(repo)
    cmd = SincronizarRolesUsuarioCommand(
        usuario_id=1, empresa_id_caller=1, rol_ids=[10], es_maestra=False
    )
    with pytest.raises(ValueError, match="No autorizado"):
        await handler.handle(cmd)


@pytest.mark.asyncio
async def test_sincronizar_roles_usuario_ok():
    usuario = MagicMock(empresa_id=1)
    repo = AsyncMock()
    repo.obtener_usuario.return_value = usuario
    repo.sincronizar_roles_usuario.return_value = [10, 20]
    handler = SincronizarRolesUsuarioHandler(repo)
    cmd = SincronizarRolesUsuarioCommand(
        usuario_id=1, empresa_id_caller=1, rol_ids=[10, 20], es_maestra=False
    )
    result = await handler.handle(cmd)
    assert result == {"usuario_id": 1, "rol_ids": [10, 20]}
