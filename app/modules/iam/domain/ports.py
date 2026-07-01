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


class IUserCrudRepository(Protocol):
    async def listar(self, empresa_id: int, **kwargs: Any) -> tuple[list[Any], int]: ...

    async def obtener_por_id(self, usuario_id: int, empresa_id: int | None) -> Any | None: ...

    async def obtener_por_email(self, email: str, empresa_id: int) -> Any | None: ...

    async def crear(
        self, *, empresa_id: int, email: str, contrasena: str, cargo_id: int | None = None
    ) -> Any: ...

    async def actualizar(self, usuario_id: int, empresa_id: int, **campos: Any) -> Any | None: ...

    async def eliminar(self, usuario_id: int, empresa_id: int) -> bool: ...

    async def reactivar(self, usuario_id: int, empresa_id: int) -> Any | None: ...


class IUsuarioRolRepository(Protocol):
    async def obtener_usuario(self, usuario_id: int, empresa_id: int | None) -> Any | None: ...

    async def listar_roles_por_usuario(self, usuario_id: int, empresa_id: int) -> list[int]: ...

    async def sincronizar_roles_usuario(
        self, usuario_id: int, empresa_id: int, rol_ids: list[int]
    ) -> list[int]: ...

    async def heredar_roles_desde_cargo(
        self, usuario_id: int, cargo_id: int, empresa_id: int
    ) -> list[int]: ...


class IRolPermisoRepository(Protocol):
    async def obtener_rol(self, rol_id: int) -> Any | None: ...

    async def listar_por_rol(
        self, rol_id: int, empresa_id: int
    ) -> list[tuple[Any, Any]]: ...

    async def sincronizar(
        self, rol_id: int, empresa_id: int, permiso_ids: list[int]
    ) -> list[int]: ...


class IPermisoCargoRepository(Protocol):
    async def obtener_cargo(self, cargo_id: int, empresa_id: int | None) -> Any | None: ...

    async def listar_roles_por_cargo(self, cargo_id: int, empresa_id: int) -> list[int]: ...

    async def sincronizar_roles_cargo(
        self, cargo_id: int, empresa_id: int, rol_ids: list[int]
    ) -> list[int]: ...


class ITenantAccessValidator(Protocol):
    async def validar_acceso(self, empresa_maestra_id: int, empresa_objetivo_id: int) -> None: ...
