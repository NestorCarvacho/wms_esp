"""
Repositorio CRUD de Permisos.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import SQLAlchemyError

from app.infrastructure.models.usuario import Permiso
from app.infrastructure.repositories.listado_helpers import condicion_buscar, filtro_empresa


class PermisoCRUDRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def listar(
        self,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 100,
        es_super_admin: bool = False,
        empresa_id_filtro: int | None = None,
        empresas_scope_ids: list[int] | None = None,
        buscar: str | None = None,
    ) -> tuple[list[Permiso], int]:
        try:
            stmt_base = select(Permiso).options(selectinload(Permiso.empresa)).where(Permiso.activo == True)
            empresa_cond = filtro_empresa(Permiso, empresa_id, es_super_admin, empresa_id_filtro, empresas_scope_ids)
            if empresa_cond is not None:
                stmt_base = stmt_base.where(empresa_cond)
            buscar_cond = condicion_buscar(Permiso, buscar, "codigo", "descripcion")
            if buscar_cond is not None:
                stmt_base = stmt_base.where(buscar_cond)

            count_stmt = select(func.count(Permiso.id)).select_from(Permiso).where(Permiso.activo == True)
            if empresa_cond is not None:
                count_stmt = count_stmt.where(empresa_cond)
            if buscar_cond is not None:
                count_stmt = count_stmt.where(buscar_cond)

            total = (await self.session.execute(count_stmt)).scalar() or 0
            offset = (pagina - 1) * por_pagina
            result = await self.session.execute(stmt_base.offset(offset).limit(por_pagina))
            return result.scalars().all(), total
        except SQLAlchemyError as e:
            raise Exception(f"Error al listar permisos: {str(e)}")

    async def obtener_por_id(self, permiso_id: int, empresa_id: int | None = None) -> Permiso | None:
        stmt = select(Permiso).where(Permiso.id == permiso_id, Permiso.activo == True)
        if empresa_id is not None:
            stmt = stmt.where(Permiso.empresa_id == empresa_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def obtener_por_codigo(self, codigo: str, empresa_id: int) -> Permiso | None:
        stmt = select(Permiso).where(
            Permiso.codigo == codigo,
            Permiso.empresa_id == empresa_id,
            Permiso.activo == True,
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def crear(self, empresa_id: int, codigo: str, descripcion: str | None, activo: bool = True) -> Permiso:
        try:
            permiso = Permiso(
                empresa_id=empresa_id,
                codigo=codigo.strip(),
                descripcion=descripcion,
                activo=activo,
            )
            self.session.add(permiso)
            await self.session.commit()
            await self.session.refresh(permiso)
            return permiso
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al crear permiso: {str(e)}")

    async def actualizar(self, permiso_id: int, empresa_id: int, **datos) -> Permiso | None:
        try:
            permiso = await self.obtener_por_id(permiso_id, empresa_id)
            if not permiso:
                return None
            campos = {k: v for k, v in datos.items() if v is not None and k in {"codigo", "descripcion", "activo"}}
            if not campos:
                return permiso
            await self.session.execute(
                update(Permiso).where(and_(Permiso.id == permiso_id, Permiso.empresa_id == empresa_id)).values(**campos)
            )
            await self.session.commit()
            return await self.obtener_por_id(permiso_id, empresa_id)
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al actualizar permiso: {str(e)}")

    async def eliminar(self, permiso_id: int, empresa_id: int) -> bool:
        try:
            permiso = await self.obtener_por_id(permiso_id, empresa_id)
            if not permiso:
                return False
            await self.session.execute(
                update(Permiso).where(and_(Permiso.id == permiso_id, Permiso.empresa_id == empresa_id)).values(activo=False)
            )
            await self.session.commit()
            return True
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al eliminar permiso: {str(e)}")
