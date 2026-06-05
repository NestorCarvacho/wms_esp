"""Repositorio CRUD de Tipos de Producto."""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, func
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import SQLAlchemyError
from app.infrastructure.models.usuario import TipoProducto
from app.infrastructure.repositories.listado_helpers import aplicar_orden, condicion_buscar, filtro_empresa


class TipoProductoCRUDRepository:
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
        ordenar_por: str | None = None,
        orden: str | None = None,
    ) -> tuple[list[TipoProducto], int]:
        try:
            stmt_base = select(TipoProducto).options(selectinload(TipoProducto.empresa))
            empresa_cond = filtro_empresa(
                TipoProducto, empresa_id, es_super_admin, empresa_id_filtro, empresas_scope_ids
            )
            if empresa_cond is not None:
                stmt_base = stmt_base.where(empresa_cond)
            stmt_base = stmt_base.where(TipoProducto.activo == True)
            buscar_cond = condicion_buscar(TipoProducto, buscar, "nombre")
            if buscar_cond is not None:
                stmt_base = stmt_base.where(buscar_cond)

            count_stmt = select(func.count(TipoProducto.id)).where(TipoProducto.activo == True)
            if empresa_cond is not None:
                count_stmt = count_stmt.where(empresa_cond)
            if buscar_cond is not None:
                count_stmt = count_stmt.where(buscar_cond)
            total = (await self.session.execute(count_stmt)).scalar() or 0

            stmt_base = aplicar_orden(
                stmt_base,
                columnas={
                    "id": TipoProducto.id,
                    "nombre": TipoProducto.nombre,
                    "activo": TipoProducto.activo,
                    "empresa_id": TipoProducto.empresa_id,
                },
                ordenar_por=ordenar_por,
                orden=orden,
                default=TipoProducto.nombre,
            )

            offset = (pagina - 1) * por_pagina
            result = await self.session.execute(stmt_base.offset(offset).limit(por_pagina))
            return result.scalars().all(), total
        except SQLAlchemyError as e:
            raise Exception(f"Error al listar tipos de producto: {str(e)}")

    async def obtener_por_id(self, id: int, empresa_id: int | None = None) -> TipoProducto | None:
        stmt = select(TipoProducto).where(TipoProducto.id == id)
        if empresa_id is not None:
            stmt = stmt.where(TipoProducto.empresa_id == empresa_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def obtener_por_nombre(self, nombre: str, empresa_id: int) -> TipoProducto | None:
        stmt = select(TipoProducto).where(
            TipoProducto.nombre == nombre,
            TipoProducto.empresa_id == empresa_id,
            TipoProducto.activo == True,
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def crear(self, empresa_id: int, nombre: str, activo: bool = True) -> TipoProducto:
        try:
            nuevo = TipoProducto(empresa_id=empresa_id, nombre=nombre, activo=activo)
            self.session.add(nuevo)
            await self.session.commit()
            await self.session.refresh(nuevo)
            return nuevo
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al crear tipo de producto: {str(e)}")

    async def actualizar(
        self,
        tipo_producto_id: int,
        empresa_id: int,
        nombre: str | None = None,
        activo: bool | None = None,
    ) -> TipoProducto | None:
        try:
            tipo = await self.obtener_por_id(tipo_producto_id, empresa_id)
            if not tipo:
                return None
            datos = {}
            if nombre is not None:
                datos["nombre"] = nombre
            if activo is not None:
                datos["activo"] = activo
            if not datos:
                return tipo
            stmt = update(TipoProducto).where(
                and_(TipoProducto.id == tipo_producto_id, TipoProducto.empresa_id == empresa_id)
            ).values(**datos)
            await self.session.execute(stmt)
            await self.session.commit()
            return await self.obtener_por_id(tipo_producto_id, empresa_id)
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al actualizar tipo de producto: {str(e)}")

    async def eliminar(self, tipo_producto_id: int, empresa_id: int) -> bool:
        try:
            tipo = await self.obtener_por_id(tipo_producto_id, empresa_id)
            if not tipo:
                return False
            stmt = update(TipoProducto).where(
                and_(TipoProducto.id == tipo_producto_id, TipoProducto.empresa_id == empresa_id)
            ).values(activo=False)
            await self.session.execute(stmt)
            await self.session.commit()
            return True
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al eliminar tipo de producto: {str(e)}")
