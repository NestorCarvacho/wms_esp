"""Handler: solicitud de recuperación de contraseña."""
from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta

from app.core.config import PASSWORD_RESET_COOLDOWN_MINUTES, PASSWORD_RESET_EXPIRE_MINUTES
from app.modules.iam.application.commands import SolicitarRecuperacionCommand
from app.modules.iam.domain.ports import IAuthUnitOfWork, IEmailNotifier


class SolicitarRecuperacionContrasenaHandler:
    def __init__(self, uow: IAuthUnitOfWork, email_notifier: IEmailNotifier):
        self.uow = uow
        self.email_notifier = email_notifier

    @staticmethod
    def _hash_token(raw_token: str) -> str:
        return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

    async def handle(self, cmd: SolicitarRecuperacionCommand) -> None:
        usuario = await self.uow.usuarios.obtener_por_email_login(cmd.email)
        if not usuario or usuario.bloqueado_permanente or not usuario.activo:
            return

        if await self.uow.reset.hay_solicitud_reciente(
            usuario.id, PASSWORD_RESET_COOLDOWN_MINUTES
        ):
            return

        raw_token = secrets.token_urlsafe(32)
        expira_at = datetime.utcnow() + timedelta(minutes=PASSWORD_RESET_EXPIRE_MINUTES)
        await self.uow.reset.crear(usuario.id, self._hash_token(raw_token), expira_at)
        try:
            await self.email_notifier.enviar_recuperacion_contrasena(usuario.email, raw_token)
            await self.uow.commit()
        except Exception:
            await self.uow.rollback()
            raise
