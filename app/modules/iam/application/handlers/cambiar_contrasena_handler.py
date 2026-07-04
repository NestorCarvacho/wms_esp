"""Handler: cambio de contraseña autenticado."""
from __future__ import annotations

from app.modules.iam.application.commands import CambiarContrasenaCommand
from app.modules.iam.domain.ports import IPasswordHasher, IUserAuthRepository
from app.shared.kernel.result import Result


class CambiarContrasenaHandler:
    def __init__(self, usuarios: IUserAuthRepository, password_hasher: IPasswordHasher):
        self.usuarios = usuarios
        self.password_hasher = password_hasher

    async def handle(self, cmd: CambiarContrasenaCommand) -> Result[None]:
        usuario = await self.usuarios.obtener_por_id_login(cmd.usuario_id)
        if not usuario or usuario.empresa_id != cmd.empresa_id:
            return Result.failure("Usuario no encontrado")
        if not self.password_hasher.verificar(cmd.contrasena_actual, usuario.password_hash):
            return Result.failure("La contraseña actual es incorrecta")

        usuario.password_hash = self.password_hasher.hashear(cmd.contrasena_nueva)
        await self.usuarios.actualizar(usuario)
        return Result.success(None)
