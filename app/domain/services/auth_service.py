"""Servicio de autenticación — fachada sobre handlers hexagonales IAM."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.container import build_iam_handlers
from app.modules.iam.application.commands import (
    CambiarContrasenaCommand,
    LoginCommand,
    RestablecerContrasenaCommand,
    SolicitarRecuperacionCommand,
    ValidarTokenQuery,
)


class AuthService:
    """Compatibilidad legacy: acepta (UsuarioRepository, session) o solo session."""

    def __init__(self, repository_or_session, session: AsyncSession | None = None):
        if session is None:
            session = repository_or_session  # type: ignore[assignment]
        self._handlers = build_iam_handlers(session)

    async def login(self, email: str, contrasena: str) -> dict[str, Any]:
        return await self._handlers.login.handle(
            LoginCommand(email=email, contrasena=contrasena)
        )

    async def solicitar_recuperacion(self, email: str) -> None:
        await self._handlers.solicitar_recuperacion.handle(
            SolicitarRecuperacionCommand(email=email)
        )

    async def restablecer_contrasena(self, token: str, contrasena: str) -> None:
        await self._handlers.restablecer_contrasena.handle(
            RestablecerContrasenaCommand(token=token, contrasena=contrasena)
        )

    async def cambiar_contrasena(
        self, usuario_id: int, empresa_id: int, contrasena_actual: str, contrasena_nueva: str
    ) -> None:
        await self._handlers.cambiar_contrasena.handle(
            CambiarContrasenaCommand(
                usuario_id=usuario_id,
                empresa_id=empresa_id,
                contrasena_actual=contrasena_actual,
                contrasena_nueva=contrasena_nueva,
            )
        )

    async def validar_token(self, payload: dict[str, Any]) -> bool:
        return await self._handlers.validar_token.handle(ValidarTokenQuery(payload=payload))
