"""
Resolución de permisos efectivos: Usuario → usuario_rol → Rol → rol_permiso → Permiso.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.models.usuario import Permiso, Rol, RolPermiso, UsuarioRol


class AutorizacionService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def resolver_permisos_por_usuario(
        self,
        usuario_id: int,
        empresa_id: int,
    ) -> tuple[list[str], list[str]]:
        """Retorna (códigos_permiso, nombres_rol) para un usuario en su empresa."""
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
