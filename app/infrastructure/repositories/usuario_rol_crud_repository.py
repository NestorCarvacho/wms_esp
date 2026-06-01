"""Repositorio de asignación usuario ↔ rol."""
from sqlalchemy import delete, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.models.usuario import Rol, Usuario, UsuarioRol


class UsuarioRolCRUDRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def obtener_usuario(self, usuario_id: int, empresa_id: int | None = None) -> Usuario | None:
        stmt = select(Usuario).where(Usuario.id == usuario_id, Usuario.activo == True)
        if empresa_id is not None:
            stmt = stmt.where(Usuario.empresa_id == empresa_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def listar_roles_por_usuario(self, usuario_id: int, empresa_id: int) -> list[int]:
        stmt = (
            select(UsuarioRol.rol_id)
            .join(Usuario, UsuarioRol.usuario_id == Usuario.id)
            .join(Rol, UsuarioRol.rol_id == Rol.id)
            .where(
                UsuarioRol.usuario_id == usuario_id,
                Usuario.empresa_id == empresa_id,
                Usuario.activo == True,
                Rol.activo == True,
                UsuarioRol.activo == True,
            )
        )
        result = await self.session.execute(stmt)
        return sorted({row[0] for row in result.all()})

    async def sincronizar_roles_usuario(
        self, usuario_id: int, empresa_id: int, rol_ids: list[int]
    ) -> list[int]:
        try:
            usuario = await self.obtener_usuario(usuario_id, empresa_id)
            if not usuario:
                raise ValueError("Usuario no encontrado")

            if rol_ids:
                roles = await self.session.execute(
                    select(Rol.id).where(
                        Rol.id.in_(rol_ids),
                        Rol.empresa_id == empresa_id,
                        Rol.activo == True,
                    )
                )
                valid_ids = {row[0] for row in roles.all()}
                invalid = set(rol_ids) - valid_ids
                if invalid:
                    raise ValueError(f"Roles no válidos para la empresa: {sorted(invalid)}")
            else:
                valid_ids = set()

            await self.session.execute(
                delete(UsuarioRol).where(UsuarioRol.usuario_id == usuario_id)
            )
            for rol_id in valid_ids:
                self.session.add(UsuarioRol(usuario_id=usuario_id, rol_id=rol_id, activo=True))
            await self.session.commit()
            return sorted(valid_ids)
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al sincronizar roles del usuario: {str(e)}") from e
