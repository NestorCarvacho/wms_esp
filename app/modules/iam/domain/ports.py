"""Puertos del módulo IAM."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Protocol


class IUserAuthRepository(Protocol):
    async def obtener_por_email_login(self, email: str) -> Any | None: ...

    async def obtener_por_id_login(self, usuario_id: int) -> Any | None: ...

    async def obtener_por_id(self, usuario_id: int, empresa_id: int) -> Any | None: ...

    async def actualizar(self, usuario: Any) -> Any: ...


class IAutorizacionRepository(Protocol):
    async def resolver_permisos_por_usuario(
        self, usuario_id: int, empresa_id: int
    ) -> tuple[list[str], list[str]]: ...


class IPasswordResetRepository(Protocol):
    async def hay_solicitud_reciente(self, usuario_id: int, cooldown_minutes: int) -> bool: ...

    async def crear(self, usuario_id: int, token_hash: str, expira_at: datetime) -> Any: ...

    async def obtener_valido(self, token_hash: str) -> Any | None: ...

    async def marcar_usado(self, token: Any) -> None: ...


class ITokenIssuer(Protocol):
    def emitir(self, claims: dict[str, Any]) -> str: ...


class IPasswordHasher(Protocol):
    def verificar(self, contrasena_plana: str, password_hash: str) -> bool: ...

    def hashear(self, contrasena: str) -> str: ...


class IEmailNotifier(Protocol):
    async def enviar_recuperacion_contrasena(self, email: str, token: str) -> None: ...


class IAuthUnitOfWork(Protocol):
    usuarios: IUserAuthRepository
    reset: IPasswordResetRepository

    async def commit(self) -> None: ...

    async def rollback(self) -> None: ...
