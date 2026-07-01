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
    """Compatibilidad legacy: acepta session, (UsuarioRepository, session) o session= kw."""

    def __init__(self, repository_or_session=None, session: AsyncSession | None = None):
        if session is not None:
            resolved = session
        elif repository_or_session is not None:
            resolved = getattr(repository_or_session, "session", repository_or_session)
        else:
            raise ValueError("Se requiere session")
        self._handlers = build_iam_handlers(resolved)

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

    async def registrar_usuario(
        self,
        email: str,
        contrasena: str,
        empresa_id: int,
        cargo_id: int | None = None,
    ) -> dict[str, Any]:
        from app.modules.iam.application.commands_rbac import CrearUsuarioCommand

        return await self._handlers.crear_usuario.handle(
            CrearUsuarioCommand(
                empresa_id=empresa_id,
                email=email,
                contrasena=contrasena,
                cargo_id=cargo_id,
            )
        )
