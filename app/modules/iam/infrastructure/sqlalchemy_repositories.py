"""Adaptadores SQLAlchemy para IAM."""
from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.models.usuario import Permiso, Rol, RolPermiso, UsuarioRol
from app.infrastructure.repositories.password_reset_repository import PasswordResetRepository
from app.infrastructure.repositories.usuario_repository import UsuarioRepository


class SqlAlchemyUsuarioAuthRepository:
    def __init__(self, session: AsyncSession):
        self._repo = UsuarioRepository(session)

    async def obtener_por_email_login(self, email: str) -> Any | None:
        return await self._repo.obtener_por_email_login(email)

    async def obtener_por_id_login(self, usuario_id: int) -> Any | None:
        return await self._repo.obtener_por_id_login(usuario_id)

    async def obtener_por_id(self, usuario_id: int, empresa_id: int) -> Any | None:
        return await self._repo.obtener_por_id(usuario_id, empresa_id)

    async def actualizar(self, usuario: Any) -> Any:
        return await self._repo.actualizar(usuario)


class SqlAlchemyAutorizacionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def resolver_permisos_por_usuario(
        self, usuario_id: int, empresa_id: int
    ) -> tuple[list[str], list[str]]:
        permisos_stmt = (
            select(Permiso.codigo)
            .join(RolPermiso, RolPermiso.permiso_id == Permiso.id)
            .join(Rol, Rol.id == RolPermiso.rol_id)
            .join(UsuarioRol, UsuarioRol.rol_id == Rol.id)
            .where(
                UsuarioRol.usuario_id == usuario_id,
                UsuarioRol.activo == True,
                RolPermiso.activo == True,
                Rol.activo == True,
                Permiso.activo == True,
                Permiso.empresa_id == empresa_id,
                Rol.empresa_id == empresa_id,
            )
            .distinct()
        )
        roles_stmt = (
            select(Rol.nombre)
            .join(UsuarioRol, UsuarioRol.rol_id == Rol.id)
            .where(
                UsuarioRol.usuario_id == usuario_id,
                UsuarioRol.activo == True,
                Rol.activo == True,
                Rol.empresa_id == empresa_id,
            )
            .distinct()
        )
        permisos_result = await self.session.execute(permisos_stmt)
        roles_result = await self.session.execute(roles_stmt)
        permisos = sorted({row[0] for row in permisos_result.all()})
        roles = sorted({row[0] for row in roles_result.all()})
        return permisos, roles


class SqlAlchemyPasswordResetRepository:
    def __init__(self, session: AsyncSession):
        self._repo = PasswordResetRepository(session)

    async def hay_solicitud_reciente(self, usuario_id: int, cooldown_minutes: int) -> bool:
        return await self._repo.hay_solicitud_reciente(usuario_id, cooldown_minutes)

    async def crear(self, usuario_id: int, token_hash: str, expira_at: datetime) -> Any:
        return await self._repo.crear(usuario_id, token_hash, expira_at)

    async def obtener_valido(self, token_hash: str) -> Any | None:
        return await self._repo.obtener_valido(token_hash)

    async def marcar_usado(self, token: Any) -> None:
        await self._repo.marcar_usado(token)
