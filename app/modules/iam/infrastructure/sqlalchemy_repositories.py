"""Adaptadores SQLAlchemy para IAM."""
from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.models.usuario import Permiso, Rol, RolPermiso, Usuario, UsuarioRol
from app.modules.iam.domain.entities import UsuarioAuth
from app.modules.iam.infrastructure.load_options import USUARIO_CON_PERFIL_GEO_LOAD
from app.modules.iam.infrastructure.orm_mappers import aplicar_auth_a_orm, usuario_auth_desde_orm

_USUARIO_AUTH_LOAD = USUARIO_CON_PERFIL_GEO_LOAD


class SqlAlchemyUsuarioAuthRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def _obtener_orm_por_email(self, email: str) -> Usuario | None:
        stmt = (
            select(Usuario)
            .options(*_USUARIO_AUTH_LOAD)
            .where(Usuario.email == email)
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def _obtener_orm_por_id(self, usuario_id: int) -> Usuario | None:
        stmt = (
            select(Usuario)
            .options(*_USUARIO_AUTH_LOAD)
            .where(Usuario.id == usuario_id)
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def obtener_por_email_login(self, email: str) -> UsuarioAuth | None:
        row = await self._obtener_orm_por_email(email)
        return usuario_auth_desde_orm(row) if row else None

    async def obtener_por_id_login(self, usuario_id: int) -> UsuarioAuth | None:
        row = await self._obtener_orm_por_id(usuario_id)
        return usuario_auth_desde_orm(row) if row else None

    async def obtener_por_id(self, usuario_id: int, empresa_id: int) -> UsuarioAuth | None:
        stmt = (
            select(Usuario)
            .options(*_USUARIO_AUTH_LOAD)
            .where(Usuario.id == usuario_id, Usuario.empresa_id == empresa_id, Usuario.activo == True)
        )
        result = await self.session.execute(stmt)
        row = result.scalars().first()
        return usuario_auth_desde_orm(row) if row else None

    async def actualizar(self, usuario: UsuarioAuth) -> UsuarioAuth:
        try:
            row = await self._obtener_orm_por_id(usuario.id)
            if not row:
                raise ValueError("Usuario no encontrado")
            aplicar_auth_a_orm(usuario, row)
            self.session.add(row)
            await self.session.commit()
            await self.session.refresh(row)
            refreshed = await self._obtener_orm_por_id(usuario.id)
            if not refreshed:
                raise ValueError("Usuario no encontrado tras actualizar")
            return usuario_auth_desde_orm(refreshed)
        except SQLAlchemyError as exc:
            await self.session.rollback()
            raise Exception(f"Error al actualizar usuario: {exc}") from exc


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
