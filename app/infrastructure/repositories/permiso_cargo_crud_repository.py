"""
Repositorio CRUD de Permisos Cargo.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func, delete
from sqlalchemy.exc import SQLAlchemyError

from app.infrastructure.models.usuario import PermisoCargo, Cargo, Rol, Empresa


class PermisoCargoCRUDRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def listar(
        self,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 10,
        es_super_admin: bool = False,
    ) -> tuple[list[tuple[PermisoCargo, Cargo, Rol, Empresa]], int]:
        try:
            stmt_base = (
                select(PermisoCargo, Cargo, Rol, Empresa)
                .join(Cargo, PermisoCargo.cargo_id == Cargo.id)
                .join(Rol, PermisoCargo.rol_id == Rol.id)
                .join(Empresa, Cargo.empresa_id == Empresa.id)
                .where(Cargo.activo == True)
                .where(Rol.activo == True)
            )

            if not es_super_admin:
                stmt_base = stmt_base.where(
                    Cargo.empresa_id == empresa_id,
                    Rol.empresa_id == empresa_id,
                )

            count_stmt = select(func.count(PermisoCargo.cargo_id)).select_from(PermisoCargo).join(
                Cargo, PermisoCargo.cargo_id == Cargo.id
            ).join(Rol, PermisoCargo.rol_id == Rol.id).where(
                Cargo.activo == True, Rol.activo == True
            )
            if not es_super_admin:
                count_stmt = count_stmt.where(
                    Cargo.empresa_id == empresa_id,
                    Rol.empresa_id == empresa_id,
                )

            count_result = await self.session.execute(count_stmt)
            total = count_result.scalar() or 0

            offset = (pagina - 1) * por_pagina
            stmt = stmt_base.offset(offset).limit(por_pagina)
            result = await self.session.execute(stmt)
            rows = result.all()
            return rows, total
        except SQLAlchemyError as e:
            raise Exception(f"Error al listar permisos cargo: {str(e)}")

    async def obtener(self, cargo_id: int, rol_id: int, empresa_id: int | None = None) -> tuple[PermisoCargo, Cargo, Rol] | None:
        stmt = (
            select(PermisoCargo, Cargo, Rol)
            .join(Cargo, PermisoCargo.cargo_id == Cargo.id)
            .join(Rol, PermisoCargo.rol_id == Rol.id)
            .where(PermisoCargo.cargo_id == cargo_id, PermisoCargo.rol_id == rol_id)
        )
        if empresa_id is not None:
            stmt = stmt.where(Cargo.empresa_id == empresa_id, Rol.empresa_id == empresa_id)

        result = await self.session.execute(stmt)
        return result.first()

    async def crear(self, cargo_id: int, rol_id: int, activo: bool = True) -> PermisoCargo:
        try:
            existente = await self.session.execute(
                select(PermisoCargo).where(
                    PermisoCargo.cargo_id == cargo_id,
                    PermisoCargo.rol_id == rol_id,
                )
            )
            if existente.scalars().first():
                raise ValueError("Ya existe un permiso para este cargo y rol")

            permiso = PermisoCargo(cargo_id=cargo_id, rol_id=rol_id, activo=activo)
            self.session.add(permiso)
            await self.session.commit()
            await self.session.refresh(permiso)
            return permiso
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al crear permiso cargo: {str(e)}")

    async def actualizar(self, cargo_id: int, rol_id: int, activo: bool) -> PermisoCargo | None:
        try:
            permiso = await self.session.execute(
                select(PermisoCargo).where(
                    PermisoCargo.cargo_id == cargo_id,
                    PermisoCargo.rol_id == rol_id,
                )
            )
            registro = permiso.scalars().first()
            if not registro:
                return None

            stmt = (
                update(PermisoCargo)
                .where(
                    PermisoCargo.cargo_id == cargo_id,
                    PermisoCargo.rol_id == rol_id,
                )
                .values(activo=activo)
            )
            await self.session.execute(stmt)
            await self.session.commit()
            refreshed = await self.session.execute(
                select(PermisoCargo).where(
                    PermisoCargo.cargo_id == cargo_id,
                    PermisoCargo.rol_id == rol_id,
                )
            )
            return refreshed.scalars().first()
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al actualizar permiso cargo: {str(e)}")

    async def eliminar(self, cargo_id: int, rol_id: int) -> bool:
        try:
            permiso = await self.session.execute(
                select(PermisoCargo).where(
                    PermisoCargo.cargo_id == cargo_id,
                    PermisoCargo.rol_id == rol_id,
                )
            )
            registro = permiso.scalars().first()
            if not registro:
                return False

            await self.session.delete(registro)
            await self.session.commit()
            return True
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al eliminar permiso cargo: {str(e)}")

    async def obtener_cargo(self, cargo_id: int, empresa_id: int | None = None) -> Cargo | None:
        stmt = select(Cargo).where(Cargo.id == cargo_id, Cargo.activo == True)
        if empresa_id is not None:
            stmt = stmt.where(Cargo.empresa_id == empresa_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def obtener_rol(self, rol_id: int, empresa_id: int | None = None) -> Rol | None:
        stmt = select(Rol).where(Rol.id == rol_id, Rol.activo == True)
        if empresa_id is not None:
            stmt = stmt.where(Rol.empresa_id == empresa_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def listar_roles_por_cargo(self, cargo_id: int, empresa_id: int) -> list[int]:
        stmt = (
            select(PermisoCargo.rol_id)
            .join(Cargo, PermisoCargo.cargo_id == Cargo.id)
            .join(Rol, PermisoCargo.rol_id == Rol.id)
            .where(
                PermisoCargo.cargo_id == cargo_id,
                Cargo.empresa_id == empresa_id,
                Cargo.activo == True,
                Rol.activo == True,
                PermisoCargo.activo == True,
            )
        )
        result = await self.session.execute(stmt)
        return sorted({row[0] for row in result.all()})

    async def sincronizar_roles_cargo(self, cargo_id: int, empresa_id: int, rol_ids: list[int]) -> list[int]:
        try:
            cargo = await self.obtener_cargo(cargo_id, empresa_id)
            if not cargo:
                raise ValueError("Cargo no encontrado")

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

            await self.session.execute(delete(PermisoCargo).where(PermisoCargo.cargo_id == cargo_id))
            for rol_id in valid_ids:
                self.session.add(PermisoCargo(cargo_id=cargo_id, rol_id=rol_id, activo=True))
            await self.session.commit()
            return sorted(valid_ids)
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al sincronizar roles del cargo: {str(e)}")
