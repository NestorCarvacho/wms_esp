"""Tests unitarios del módulo IAM."""
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.modules.iam.application.commands import LoginCommand
from app.modules.iam.application.handlers.login_handler import LoginHandler
from app.modules.iam.domain.services.login_policy import aplicar_fallo_login, validar_estado_login


class FakeUsuario:
    def __init__(self):
        self.id = 1
        self.empresa_id = 1
        self.email = "test@wms.com"
        self.password_hash = "hashed"
        self.cargo_id = 1
        self.activo = True
        self.bloqueado_permanente = False
        self.bloqueado_hasta = None
        self.intentos_fallidos = 0
        self.bloqueos_temporales = 0
        self.ultimo_login = None
        self.fecha_creacion = datetime.utcnow()
        self.fecha_actualizacion = datetime.utcnow()
        self.empresa = MagicMock(es_empresa_maestra=False, esta_activa=True, activo=True)
        self.cargo = MagicMock(nombre="Admin")
        self.perfil = None


@pytest.mark.asyncio
async def test_login_credenciales_invalidas():
    usuario = FakeUsuario()
    repo = AsyncMock()
    repo.obtener_por_email_login.return_value = usuario
    hasher = MagicMock()
    hasher.verificar.return_value = False
    handler = LoginHandler(repo, AsyncMock(), MagicMock(), hasher)
    with pytest.raises(ValueError, match="incorrectos"):
        await handler.handle(LoginCommand(email="test@wms.com", contrasena="wrong"))
    repo.actualizar.assert_awaited_once()


@pytest.mark.asyncio
async def test_login_exitoso():
    usuario = FakeUsuario()
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
    assert result["acceso_token"] == "jwt-token"
    assert result["usuario"]["permisos"] == ["inventario.leer"]


def test_validar_estado_cuenta_bloqueada():
    usuario = FakeUsuario()
    usuario.bloqueado_hasta = datetime.utcnow().replace(year=2099)
    with pytest.raises(ValueError, match="bloqueada temporalmente"):
        validar_estado_login(usuario)


def test_aplicar_fallo_login_incrementa_intentos():
    usuario = FakeUsuario()
    with pytest.raises(ValueError, match="incorrectos"):
        aplicar_fallo_login(usuario)
    assert usuario.intentos_fallidos == 1
