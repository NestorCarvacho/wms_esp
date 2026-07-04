"""Tests unitarios del módulo IAM."""
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.modules.iam.application.commands import LoginCommand
from app.modules.iam.application.handlers.login_handler import LoginHandler
from app.modules.iam.domain.entities import UsuarioAuth
from app.modules.iam.domain.services.login_policy import aplicar_fallo_login, validar_estado_login


def _usuario_auth(**overrides) -> UsuarioAuth:
    base = UsuarioAuth(
        id=1,
        empresa_id=1,
        email="test@wms.com",
        password_hash="hashed",
        cargo_id=1,
        activo=True,
        cargo_nombre="Admin",
        fecha_creacion=datetime.utcnow(),
        fecha_actualizacion=datetime.utcnow(),
    )
    for key, value in overrides.items():
        setattr(base, key, value)
    return base


@pytest.mark.asyncio
async def test_login_credenciales_invalidas():
    usuario = _usuario_auth()
    repo = AsyncMock()
    repo.obtener_por_email_login.return_value = usuario
    hasher = MagicMock()
    hasher.verificar.return_value = False
    handler = LoginHandler(repo, AsyncMock(), MagicMock(), hasher)
    result = await handler.handle(LoginCommand(email="test@wms.com", contrasena="wrong"))
    assert not result.ok
    assert "incorrectos" in (result.error or "")
    repo.actualizar.assert_awaited_once()


@pytest.mark.asyncio
async def test_login_exitoso():
    usuario = _usuario_auth()
    repo = AsyncMock()
    repo.obtener_por_email_login.return_value = usuario
    repo.actualizar.return_value = usuario
    auth_repo = AsyncMock()
    auth_repo.resolver_permisos_por_usuario.return_value = (["inventario.leer"], ["Operador"])
    token_issuer = MagicMock()
    token_issuer.emitir.return_value = "jwt-token"
    hasher = MagicMock()
    hasher.verificar.return_value = True

    handler = LoginHandler(repo, auth_repo, token_issuer, hasher)
    result = await handler.handle(LoginCommand(email="test@wms.com", contrasena="ok"))
    assert result.ok
    assert result.value["acceso_token"] == "jwt-token"
    assert result.value["usuario"]["permisos"] == ["inventario.leer"]


def test_validar_estado_cuenta_bloqueada():
    usuario = _usuario_auth(bloqueado_hasta=datetime.utcnow().replace(year=2099))
    with pytest.raises(ValueError, match="bloqueada temporalmente"):
        validar_estado_login(usuario)


def test_aplicar_fallo_login_incrementa_intentos():
    usuario = _usuario_auth()
    with pytest.raises(ValueError, match="incorrectos"):
        aplicar_fallo_login(usuario)
    assert usuario.intentos_fallidos == 1
