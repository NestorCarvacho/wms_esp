"""Adaptador SQLAlchemy — perfil de usuario."""
from __future__ import annotations

from typing import Any

from sqlalchemy import select, update
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.infrastructure.models.usuario import PerfilUsuario
from app.modules.iam.domain.entities import PerfilUsuario as PerfilUsuarioEntity
from app.modules.iam.infrastructure.orm_mappers import perfil_desde_orm

_PERFIL_LOAD = (
    selectinload(PerfilUsuario.region),
    selectinload(PerfilUsuario.ciudad),
    selectinload(PerfilUsuario.comuna),
)


class SqlAlchemyPerfilUsuarioRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def _obtener_orm(self, usuario_id: int) -> PerfilUsuario | None:
        stmt = (
            select(PerfilUsuario)
            .options(*_PERFIL_LOAD)
            .where(PerfilUsuario.usuario_id == usuario_id)
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def obtener_por_usuario_id(self, usuario_id: int) -> PerfilUsuarioEntity | None:
        row = await self._obtener_orm(usuario_id)
        return perfil_desde_orm(row) if row else None

    async def obtener_por_rut(self, rut: str) -> PerfilUsuarioEntity | None:
        stmt = select(PerfilUsuario).options(*_PERFIL_LOAD).where(PerfilUsuario.rut == rut)
        result = await self.session.execute(stmt)
        row = result.scalars().first()
        return perfil_desde_orm(row) if row else None

    async def crear(self, usuario_id: int, **datos: Any) -> PerfilUsuarioEntity:
        campos_validos = {
            "rut", "nombres", "apellido_paterno", "apellido_materno",
            "fecha_nacimiento", "genero", "telefono", "direccion",
            "region_id", "ciudad_id", "comuna_id", "pais",
            "locale_override", "timezone_override", "foto_url", "biografia",
        }
        datos_filtrados = {k: v for k, v in datos.items() if k in campos_validos}
        try:
            nuevo = PerfilUsuario(usuario_id=usuario_id, **datos_filtrados)
            self.session.add(nuevo)
            await self.session.commit()
            row = await self._obtener_orm(usuario_id)
            if not row:
                raise ValueError("Perfil no encontrado tras crear")
            return perfil_desde_orm(row)
        except SQLAlchemyError as exc:
            await self.session.rollback()
            raise Exception(f"Error al crear perfil de usuario: {exc}") from exc

    async def actualizar(self, usuario_id: int, **datos: Any) -> PerfilUsuarioEntity | None:
        campos_validos = {
            "rut", "nombres", "apellido_paterno", "apellido_materno",
            "fecha_nacimiento", "genero", "telefono", "direccion",
            "region_id", "ciudad_id", "comuna_id", "pais",
            "locale_override", "timezone_override", "foto_url", "biografia",
        }
        datos_filtrados = {k: v for k, v in datos.items() if k in campos_validos}
        if not datos_filtrados:
            return await self.obtener_por_usuario_id(usuario_id)
        try:
            perfil = await self._obtener_orm(usuario_id)
            if not perfil:
                raise ValueError("Perfil de usuario no encontrado")
            stmt = (
                update(PerfilUsuario)
                .where(PerfilUsuario.usuario_id == usuario_id)
                .values(**datos_filtrados)
            )
            await self.session.execute(stmt)
            await self.session.commit()
            return await self.obtener_por_usuario_id(usuario_id)
        except SQLAlchemyError as exc:
            await self.session.rollback()
            raise Exception(f"Error al actualizar perfil de usuario: {exc}") from exc
