"""Copia catálogo RBAC (permisos, roles, rol_permiso) desde empresa plantilla."""
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.models.usuario import Permiso, Rol, RolPermiso


class EmpresaRbacBootstrapRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def contar_permisos(self, empresa_id: int) -> int:
        stmt = select(func.count(Permiso.id)).where(
            Permiso.empresa_id == empresa_id,
            Permiso.activo == True,
        )
        return (await self.session.execute(stmt)).scalar() or 0

    async def listar_roles_activos(self, empresa_id: int) -> list[Rol]:
        result = await self.session.execute(
            select(Rol).where(Rol.empresa_id == empresa_id, Rol.activo == True)
        )
        return list(result.scalars().all())

    async def codigos_permiso_de_rol(self, rol_id: int) -> list[str]:
        stmt = (
            select(Permiso.codigo)
            .join(RolPermiso, RolPermiso.permiso_id == Permiso.id)
            .where(
                RolPermiso.rol_id == rol_id,
                RolPermiso.activo == True,
                Permiso.activo == True,
            )
            .order_by(Permiso.codigo)
        )
        result = await self.session.execute(stmt)
        return [row[0] for row in result.all()]

    async def copiar_permisos(self, empresa_plantilla_id: int, empresa_destino_id: int) -> int:
        plantilla = await self.session.execute(
            select(Permiso).where(
                Permiso.empresa_id == empresa_plantilla_id,
                Permiso.activo == True,
            )
        )
        creados = 0
        for permiso in plantilla.scalars().all():
            existente = await self.session.execute(
                select(Permiso).where(
                    Permiso.empresa_id == empresa_destino_id,
                    Permiso.codigo == permiso.codigo,
                )
            )
            row = existente.scalars().first()
            if row:
                if not row.activo or row.descripcion != permiso.descripcion:
                    row.activo = True
                    row.descripcion = permiso.descripcion
                continue
            self.session.add(
                Permiso(
                    empresa_id=empresa_destino_id,
                    codigo=permiso.codigo,
                    descripcion=permiso.descripcion,
                    activo=True,
                )
            )
            creados += 1
        return creados

    async def asegurar_rol(self, empresa_id: int, nombre: str, descripcion: str | None) -> Rol:
        result = await self.session.execute(
            select(Rol).where(Rol.empresa_id == empresa_id, Rol.nombre == nombre)
        )
        rol = result.scalars().first()
        if rol:
            if not rol.activo:
                rol.activo = True
            if descripcion and rol.descripcion != descripcion:
                rol.descripcion = descripcion
            return rol
        rol = Rol(
            empresa_id=empresa_id,
            nombre=nombre,
            descripcion=descripcion,
            activo=True,
        )
        self.session.add(rol)
        await self.session.flush()
        return rol

    async def ids_por_codigos(self, empresa_id: int, codigos: list[str]) -> list[int]:
        if not codigos:
            return []
        result = await self.session.execute(
            select(Permiso.id).where(
                Permiso.empresa_id == empresa_id,
                Permiso.codigo.in_(codigos),
                Permiso.activo == True,
            )
        )
        return [row[0] for row in result.all()]

    async def reemplazar_rol_permiso(self, rol_id: int, permiso_ids: list[int]) -> None:
        await self.session.execute(delete(RolPermiso).where(RolPermiso.rol_id == rol_id))
        for permiso_id in permiso_ids:
            self.session.add(RolPermiso(rol_id=rol_id, permiso_id=permiso_id, activo=True))

    async def commit(self) -> None:
        await self.session.commit()

    async def rollback(self) -> None:
        await self.session.rollback()
