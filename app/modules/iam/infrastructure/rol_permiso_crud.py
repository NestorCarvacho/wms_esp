"""
Repositorio de rol_permiso y consultas de asignación.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.exc import SQLAlchemyError

from app.infrastructure.models.usuario import Permiso, Rol, RolPermiso


class RolPermisoCRUDRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def obtener_rol(self, rol_id: int) -> Rol | None:
        result = await self.session.execute(
            select(Rol).where(Rol.id == rol_id, Rol.activo == True)
        )
        return result.scalars().first()

    async def listar_por_rol(self, rol_id: int, empresa_id: int) -> list[tuple[RolPermiso, Permiso]]:
        stmt = (
            select(RolPermiso, Permiso)
            .join(Permiso, Permiso.id == RolPermiso.permiso_id)
            .join(Rol, Rol.id == RolPermiso.rol_id)
            .where(
                RolPermiso.rol_id == rol_id,
                Rol.empresa_id == empresa_id,
                Permiso.empresa_id == empresa_id,
                RolPermiso.activo == True,
                Permiso.activo == True,
            )
        )
        result = await self.session.execute(stmt)
        return result.all()

    async def sincronizar(self, rol_id: int, empresa_id: int, permiso_ids: list[int]) -> list[int]:
        try:
            rol = await self.session.execute(
                select(Rol).where(Rol.id == rol_id, Rol.empresa_id == empresa_id, Rol.activo == True)
            )
            if not rol.scalars().first():
                raise ValueError("Rol no encontrado")

            if permiso_ids:
                permisos = await self.session.execute(
                    select(Permiso.id).where(
                        Permiso.id.in_(permiso_ids),
                        Permiso.empresa_id == empresa_id,
                        Permiso.activo == True,
                    )
                )
                valid_ids = {row[0] for row in permisos.all()}
                invalid = set(permiso_ids) - valid_ids
                if invalid:
                    raise ValueError(f"Permisos no válidos para la empresa: {sorted(invalid)}")
            else:
                valid_ids = set()

            await self.session.execute(delete(RolPermiso).where(RolPermiso.rol_id == rol_id))
            for permiso_id in valid_ids:
                self.session.add(RolPermiso(rol_id=rol_id, permiso_id=permiso_id, activo=True))
            await self.session.commit()
            return sorted(valid_ids)
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al sincronizar rol_permiso: {str(e)}")
