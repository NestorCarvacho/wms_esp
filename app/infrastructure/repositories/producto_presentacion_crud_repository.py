"""Repositorio CRUD de presentaciones de producto."""
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, func
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import SQLAlchemyError
from app.infrastructure.models.usuario import Producto, ProductoPresentacion
from app.infrastructure.repositories.listado_helpers import condicion_buscar


class ProductoPresentacionCRUDRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def listar_por_producto(
        self,
        producto_id: int,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 50,
        buscar: str | None = None,
    ) -> tuple[list[ProductoPresentacion], int]:
        try:
            stmt_base = (
                select(ProductoPresentacion)
                .join(Producto, ProductoPresentacion.producto_id == Producto.id)
                .options(
                    selectinload(ProductoPresentacion.unidad_medida),
                    selectinload(ProductoPresentacion.producto),
                )
                .where(
                    ProductoPresentacion.producto_id == producto_id,
                    Producto.empresa_id == empresa_id,
                    ProductoPresentacion.activo == True,
                )
            )
            buscar_cond = condicion_buscar(ProductoPresentacion, buscar, "nombre")
            if buscar_cond is not None:
                stmt_base = stmt_base.where(buscar_cond)

            count_stmt = (
                select(func.count(ProductoPresentacion.id))
                .join(Producto, ProductoPresentacion.producto_id == Producto.id)
                .where(
                    ProductoPresentacion.producto_id == producto_id,
                    Producto.empresa_id == empresa_id,
                    ProductoPresentacion.activo == True,
                )
            )
            if buscar_cond is not None:
                count_stmt = count_stmt.where(buscar_cond)
            total = (await self.session.execute(count_stmt)).scalar() or 0

            offset = (pagina - 1) * por_pagina
            result = await self.session.execute(stmt_base.offset(offset).limit(por_pagina))
            return result.scalars().all(), total
        except SQLAlchemyError as e:
            raise Exception(f"Error al listar presentaciones: {str(e)}")

    async def obtener_por_id(
        self, presentacion_id: int, empresa_id: int | None = None
    ) -> ProductoPresentacion | None:
        stmt = (
            select(ProductoPresentacion)
            .join(Producto, ProductoPresentacion.producto_id == Producto.id)
            .options(
                selectinload(ProductoPresentacion.unidad_medida),
                selectinload(ProductoPresentacion.producto).selectinload(Producto.unidad_medida),
            )
            .where(ProductoPresentacion.id == presentacion_id)
        )
        if empresa_id is not None:
            stmt = stmt.where(Producto.empresa_id == empresa_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def obtener_por_nombre(
        self, producto_id: int, nombre: str
    ) -> ProductoPresentacion | None:
        stmt = select(ProductoPresentacion).where(
            ProductoPresentacion.producto_id == producto_id,
            ProductoPresentacion.nombre == nombre,
            ProductoPresentacion.activo == True,
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def crear(
        self,
        producto_id: int,
        nombre: str,
        cantidad_contenida: Decimal,
        unidad_medida_id: int,
        precio_costo: float | None = None,
        precio_venta: float | None = None,
        permite_venta_unidad: bool = True,
        permite_venta_presentacion: bool = True,
    ) -> ProductoPresentacion:
        try:
            nueva = ProductoPresentacion(
                producto_id=producto_id,
                nombre=nombre,
                cantidad_contenida=cantidad_contenida,
                unidad_medida_id=unidad_medida_id,
                precio_costo=precio_costo,
                precio_venta=precio_venta,
                permite_venta_unidad=permite_venta_unidad,
                permite_venta_presentacion=permite_venta_presentacion,
                activo=True,
            )
            self.session.add(nueva)
            await self.session.commit()
            await self.session.refresh(nueva)
            return nueva
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al crear presentación: {str(e)}")

    async def actualizar(
        self,
        presentacion_id: int,
        empresa_id: int,
        **datos,
    ) -> ProductoPresentacion | None:
        try:
            presentacion = await self.obtener_por_id(presentacion_id, empresa_id)
            if not presentacion:
                return None
            if not datos:
                return presentacion
            stmt = (
                update(ProductoPresentacion)
                .where(ProductoPresentacion.id == presentacion_id)
                .values(**datos)
            )
            await self.session.execute(stmt)
            await self.session.commit()
            return await self.obtener_por_id(presentacion_id, empresa_id)
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al actualizar presentación: {str(e)}")

    async def eliminar(self, presentacion_id: int, empresa_id: int) -> bool:
        try:
            presentacion = await self.obtener_por_id(presentacion_id, empresa_id)
            if not presentacion:
                return False
            stmt = (
                update(ProductoPresentacion)
                .where(ProductoPresentacion.id == presentacion_id)
                .values(activo=False)
            )
            await self.session.execute(stmt)
            await self.session.commit()
            return True
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al eliminar presentación: {str(e)}")
