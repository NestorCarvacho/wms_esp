"""Handler: autenticación y emisión de sesión."""
from __future__ import annotations

from datetime import datetime

from app.modules.iam.application.commands import LoginCommand
from app.modules.iam.application.session_builder import construir_respuesta_sesion
from app.modules.iam.domain.constants import MSG_CREDENCIALES
from app.modules.iam.domain.ports import (
    IAutorizacionRepository,
    IPasswordHasher,
    ITokenIssuer,
    IUserAuthRepository,
)
from app.modules.iam.domain.services.login_policy import aplicar_fallo_login, validar_estado_login
from app.shared.kernel.result import Result


class LoginHandler:
    def __init__(
        self,
        usuarios: IUserAuthRepository,
        autorizacion: IAutorizacionRepository,
        token_issuer: ITokenIssuer,
        password_hasher: IPasswordHasher,
    ):
        self.usuarios = usuarios
        self.autorizacion = autorizacion
        self.token_issuer = token_issuer
        self.password_hasher = password_hasher

    async def handle(self, cmd: LoginCommand) -> Result[dict]:
        usuario = await self.usuarios.obtener_por_email_login(cmd.email)
        if not usuario:
            return Result.failure(MSG_CREDENCIALES)

        try:
            validar_estado_login(usuario)
        except ValueError as exc:
            return Result.failure(str(exc))

        if not self.password_hasher.verificar(cmd.contrasena, usuario.password_hash):
            error_msg = MSG_CREDENCIALES
            try:
                aplicar_fallo_login(usuario)
            except ValueError as exc:
                error_msg = str(exc)
            await self.usuarios.actualizar(usuario)
            return Result.failure(error_msg)

        usuario.intentos_fallidos = 0
        usuario.bloqueado_hasta = None
        usuario.ultimo_login = datetime.utcnow()
        await self.usuarios.actualizar(usuario)

        permisos, roles = await self.autorizacion.resolver_permisos_por_usuario(
            usuario.id, usuario.empresa_id
        )
        es_empresa_maestra = usuario.es_empresa_maestra
        token = self.token_issuer.emitir(
            {
                "usuario_id": usuario.id,
                "empresa_id": usuario.empresa_id,
                "email": usuario.email,
                "cargo_id": usuario.cargo_id,
                "roles": roles,
                "permisos": permisos,
                "es_empresa_maestra": es_empresa_maestra,
            }
        )
        return Result.success(construir_respuesta_sesion(usuario, permisos, roles, token))
