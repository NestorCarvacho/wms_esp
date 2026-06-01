"""Repositorio CRUD de Zonas de Bodega."""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, func
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import SQLAlchemyError
from app.infrastructure.models.usuario import ZonaBodega, Bodega
from app.infrastructure.repositories.listado_helpers import condicion_buscar, filtro_empresa


class ZonaBodegaCRUDRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    def _base_query(self):
        return select(ZonaBodega).options(
            selectinload(ZonaBodega.bodega).selectinload(Bodega.empresa),
            selectinload(ZonaBodega.tipo_zona),
        )

    async def listar(
        self,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 10,
        es_super_admin: bool = False,
        empresa_id_filtro: int | None = None,
        empresas_scope_ids: list[int] | None = None,
        bodega_id: int | None = None,
        buscar: str | None = None,
    ) -> tuple[list[ZonaBodega], int]:
        try:
            stmt_base = self._base_query().join(Bodega, ZonaBodega.bodega_id == Bodega.id)
            empresa_cond = filtro_empresa(Bodega, empresa_id, es_super_admin, empresa_id_filtro, empresas_scope_ids)
            if empresa_cond is not None:
                stmt_base = stmt_base.where(empresa_cond)
            if bodega_id is not None:
                stmt_base = stmt_base.where(ZonaBodega.bodega_id == bodega_id)
            stmt_base = stmt_base.where(ZonaBodega.activo == True)
            buscar_cond = condicion_buscar(ZonaBodega, buscar, "nombre")
            if buscar_cond is not None:
                stmt_base = stmt_base.where(buscar_cond)

            count_stmt = (
                select(func.count(ZonaBodega.id))
                .select_from(ZonaBodega)
                .join(Bodega, ZonaBodega.bodega_id == Bodega.id)
                .where(ZonaBodega.activo == True)
            )
            if empresa_cond is not None:
                count_stmt = count_stmt.where(empresa_cond)
            if bodega_id is not None:
                count_stmt = count_stmt.where(ZonaBodega.bodega_id == bodega_id)
            if buscar_cond is not None:
                count_stmt = count_stmt.where(buscar_cond)
            total = (await self.session.execute(count_stmt)).scalar() or 0

            offset = (pagina - 1) * por_pagina
            result = await self.session.execute(stmt_base.offset(offset).limit(por_pagina))
            return result.scalars().all(), total
        except SQLAlchemyError as e:
            raise Exception(f"Error al listar zonas de bodega: {str(e)}")

    async def obtener_por_id(
        self,
        id: int,
        empresa_id: int | None = None,
    ) -> ZonaBodega | None:
        stmt = self._base_query().where(ZonaBodega.id == id)
        if empresa_id is not None:
            stmt = stmt.join(Bodega, ZonaBodega.bodega_id == Bodega.id).where(
                Bodega.empresa_id == empresa_id
            )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def crear(
        self,
        bodega_id: int,
        tipo_zona_id: int,
        nombre: str | None = None,
        activo: bool = True,
    ) -> ZonaBodega:
        try:
            nueva = ZonaBodega(
                bodega_id=bodega_id,
                tipo_zona_id=tipo_zona_id,
                nombre=nombre,
                activo=activo,
            )
            self.session.add(nueva)
            await self.session.commit()
            await self.session.refresh(nueva)
            return await self.obtener_por_id(nueva.id)
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al crear zona de bodega: {str(e)}")

    async def actualizar(
        self,
        zona_id: int,
        empresa_id: int,
        bodega_id: int | None = None,
        tipo_zona_id: int | None = None,
        nombre: str | None = None,
        activo: bool | None = None,
        _unset_nombre: bool = False,
    ) -> ZonaBodega | None:
        try:
            zona = await self.obtener_por_id(zona_id, empresa_id)
            if not zona:
                return None
            datos = {}
            if bodega_id is not None:
                datos["bodega_id"] = bodega_id
            if tipo_zona_id is not None:
                datos["tipo_zona_id"] = tipo_zona_id
            if nombre is not None or _unset_nombre:
                datos["nombre"] = nombre
            if activo is not None:
                datos["activo"] = activo
            if not datos:
                return zona
            stmt = (
                update(ZonaBodega)
                .where(ZonaBodega.id == zona_id)
                .values(**datos)
            )
            await self.session.execute(stmt)
            await self.session.commit()
            return await self.obtener_por_id(zona_id, empresa_id)
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al actualizar zona de bodega: {str(e)}")

    async def eliminar(self, zona_id: int, empresa_id: int) -> bool:
        try:
            zona = await self.obtener_por_id(zona_id, empresa_id)
            if not zona:
                return False
            stmt = update(ZonaBodega).where(ZonaBodega.id == zona_id).values(activo=False)
            await self.session.execute(stmt)
            await self.session.commit()
            return True
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al eliminar zona de bodega: {str(e)}")
