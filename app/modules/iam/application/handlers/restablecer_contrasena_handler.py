"""Handler: restablecer contraseña con token."""
from __future__ import annotations

import hashlib

from app.modules.iam.application.commands import RestablecerContrasenaCommand
from app.modules.iam.domain.constants import MSG_BLOQUEO_PERMANENTE
from app.modules.iam.domain.ports import IPasswordHasher, IUserAuthRepository, IPasswordResetRepository


class RestablecerContrasenaHandler:
    def __init__(
        self,
        usuarios: IUserAuthRepository,
        reset: IPasswordResetRepository,
        password_hasher: IPasswordHasher,
    ):
        self.usuarios = usuarios
        self.reset = reset
        self.password_hasher = password_hasher

    @staticmethod
    def _hash_token(raw_token: str) -> str:
        return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

    async def handle(self, cmd: RestablecerContrasenaCommand) -> None:
        token_hash = self._hash_token(cmd.token.strip())
        reset_row = await self.reset.obtener_valido(token_hash)
        if not reset_row:
            raise ValueError("El enlace de recuperación es inválido o ha caducado")

        usuario = await self.usuarios.obtener_por_id_login(reset_row.usuario_id)
        if not usuario or usuario.bloqueado_permanente:
            raise ValueError(MSG_BLOQUEO_PERMANENTE)

        usuario.password_hash = self.password_hasher.hashear(cmd.contrasena)
        usuario.intentos_fallidos = 0
        usuario.bloqueado_hasta = None
        usuario.bloqueos_temporales = 0
        await self.reset.marcar_usado(reset_row)
        await self.usuarios.actualizar(usuario)
