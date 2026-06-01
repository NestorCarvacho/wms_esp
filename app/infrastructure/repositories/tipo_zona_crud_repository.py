"""Repositorio CRUD de Tipos de Zona."""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, func
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import SQLAlchemyError
from app.infrastructure.models.usuario import TipoZona
from app.infrastructure.repositories.listado_helpers import condicion_buscar, filtro_empresa


class TipoZonaCRUDRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def listar(
        self,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 10,
        es_super_admin: bool = False,
        empresa_id_filtro: int | None = None,
        empresas_scope_ids: list[int] | None = None,
        buscar: str | None = None,
    ) -> tuple[list[TipoZona], int]:
        try:
            stmt_base = select(TipoZona).options(selectinload(TipoZona.empresa))
            empresa_cond = filtro_empresa(TipoZona, empresa_id, es_super_admin, empresa_id_filtro, empresas_scope_ids)
            if empresa_cond is not None:
                stmt_base = stmt_base.where(empresa_cond)
            stmt_base = stmt_base.where(TipoZona.activo == True)
            buscar_cond = condicion_buscar(TipoZona, buscar, "nombre")
            if buscar_cond is not None:
                stmt_base = stmt_base.where(buscar_cond)

            count_stmt = select(func.count(TipoZona.id)).where(TipoZona.activo == True)
            if empresa_cond is not None:
                count_stmt = count_stmt.where(empresa_cond)
            if buscar_cond is not None:
                count_stmt = count_stmt.where(buscar_cond)
            total = (await self.session.execute(count_stmt)).scalar() or 0

            offset = (pagina - 1) * por_pagina
            result = await self.session.execute(stmt_base.offset(offset).limit(por_pagina))
            return result.scalars().all(), total
        except SQLAlchemyError as e:
            raise Exception(f"Error al listar tipos de zona: {str(e)}")

    async def obtener_por_id(self, id: int, empresa_id: int | None = None) -> TipoZona | None:
        stmt = select(TipoZona).where(TipoZona.id == id)
        if empresa_id is not None:
            stmt = stmt.where(TipoZona.empresa_id == empresa_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def obtener_por_nombre(self, nombre: str, empresa_id: int) -> TipoZona | None:
        stmt = select(TipoZona).where(
            TipoZona.nombre == nombre,
            TipoZona.empresa_id == empresa_id,
            TipoZona.activo == True,
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def crear(self, empresa_id: int, nombre: str, activo: bool = True) -> TipoZona:
        try:
            nuevo = TipoZona(empresa_id=empresa_id, nombre=nombre, activo=activo)
            self.session.add(nuevo)
            await self.session.commit()
            await self.session.refresh(nuevo)
            return nuevo
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al crear tipo de zona: {str(e)}")

    async def actualizar(
        self,
        tipo_zona_id: int,
        empresa_id: int,
        nombre: str | None = None,
        activo: bool | None = None,
    ) -> TipoZona | None:
        try:
            tipo = await self.obtener_por_id(tipo_zona_id, empresa_id)
            if not tipo:
                return None
            datos = {}
            if nombre is not None:
                datos["nombre"] = nombre
            if activo is not None:
                datos["activo"] = activo
            if not datos:
                return tipo
            stmt = update(TipoZona).where(
                and_(TipoZona.id == tipo_zona_id, TipoZona.empresa_id == empresa_id)
            ).values(**datos)
            await self.session.execute(stmt)
            await self.session.commit()
            return await self.obtener_por_id(tipo_zona_id, empresa_id)
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al actualizar tipo de zona: {str(e)}")

    async def eliminar(self, tipo_zona_id: int, empresa_id: int) -> bool:
        try:
            tipo = await self.obtener_por_id(tipo_zona_id, empresa_id)
            if not tipo:
                return False
            stmt = update(TipoZona).where(
                and_(TipoZona.id == tipo_zona_id, TipoZona.empresa_id == empresa_id)
            ).values(activo=False)
            await self.session.execute(stmt)
            await self.session.commit()
            return True
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al eliminar tipo de zona: {str(e)}")
