"""Repositorio CRUD para inventario serializado (serie_producto)."""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import SQLAlchemyError
from app.infrastructure.models.usuario import SerieProducto, Producto, ZonaBodega

ESTADOS_VALIDOS = {"EN_BODEGA", "DESPACHADO", "BAJA"}


def _serializar(s: SerieProducto) -> dict:
    zona = s.zona_bodega
    zona_nombre = None
    if zona:
        zona_nombre = zona.nombre or (zona.tipo_zona.nombre if zona.tipo_zona else None)
    return {
        "id": s.id,
        "empresa_id": s.empresa_id,
        "producto_id": s.producto_id,
        "producto_nombre": s.producto.nombre if s.producto else None,
        "producto_sku": s.producto.sku if s.producto else None,
        "numero_serie": s.numero_serie,
        "zona_bodega_id": s.zona_bodega_id,
        "zona_nombre": zona_nombre,
        "estado": s.estado,
        "creado_at": s.creado_at.isoformat() if s.creado_at else None,
        "actualizado_at": s.actualizado_at.isoformat() if s.actualizado_at else None,
    }


class SerieProductoCRUDRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    def _base_query(self):
        return (
            select(SerieProducto)
            .join(Producto, SerieProducto.producto_id == Producto.id)
            .options(
                selectinload(SerieProducto.producto),
                selectinload(SerieProducto.zona_bodega),
            )
        )

    async def buscar_por_numero_serie(
        self, empresa_id: int, numero_serie: str
    ) -> SerieProducto | None:
        stmt = self._base_query().where(
            SerieProducto.empresa_id == empresa_id,
            SerieProducto.numero_serie == numero_serie,
        )
        return (await self.session.execute(stmt)).scalars().first()

    async def existe(self, empresa_id: int, numero_serie: str) -> bool:
        stmt = select(func.count(SerieProducto.id)).where(
            SerieProducto.empresa_id == empresa_id,
            SerieProducto.numero_serie == numero_serie,
        )
        return ((await self.session.execute(stmt)).scalar() or 0) > 0

    async def listar_por_producto(
        self,
        empresa_id: int,
        producto_id: int,
        estado: str | None = None,
        zona_bodega_id: int | None = None,
        pagina: int = 1,
        por_pagina: int = 50,
    ) -> tuple[list[SerieProducto], int]:
        stmt = self._base_query().where(
            SerieProducto.empresa_id == empresa_id,
            SerieProducto.producto_id == producto_id,
        )
        count_stmt = select(func.count(SerieProducto.id)).where(
            SerieProducto.empresa_id == empresa_id,
            SerieProducto.producto_id == producto_id,
        )
        if estado:
            stmt = stmt.where(SerieProducto.estado == estado)
            count_stmt = count_stmt.where(SerieProducto.estado == estado)
        if zona_bodega_id is not None:
            stmt = stmt.where(SerieProducto.zona_bodega_id == zona_bodega_id)
            count_stmt = count_stmt.where(SerieProducto.zona_bodega_id == zona_bodega_id)

        total = (await self.session.execute(count_stmt)).scalar() or 0
        offset = (pagina - 1) * por_pagina
        rows = (await self.session.execute(stmt.offset(offset).limit(por_pagina))).scalars().all()
        return rows, total

    async def crear(
        self,
        empresa_id: int,
        producto_id: int,
        numero_serie: str,
        zona_bodega_id: int,
    ) -> SerieProducto:
        try:
            nueva = SerieProducto(
                empresa_id=empresa_id,
                producto_id=producto_id,
                numero_serie=numero_serie,
                zona_bodega_id=zona_bodega_id,
                estado="EN_BODEGA",
            )
            self.session.add(nueva)
            await self.session.flush()
            return nueva
        except SQLAlchemyError as e:
            raise Exception(f"Error al crear serie: {str(e)}")

    async def trasladar(self, serie_id: int, zona_destino_id: int) -> None:
        stmt = (
            update(SerieProducto)
            .where(SerieProducto.id == serie_id)
            .values(zona_bodega_id=zona_destino_id, estado="EN_BODEGA")
        )
        await self.session.execute(stmt)

    async def despachar(self, serie_id: int) -> None:
        stmt = (
            update(SerieProducto)
            .where(SerieProducto.id == serie_id)
            .values(zona_bodega_id=None, estado="DESPACHADO")
        )
        await self.session.execute(stmt)

    async def commit(self):
        await self.session.commit()

    async def rollback(self):
        await self.session.rollback()

    def serializar(self, s: SerieProducto) -> dict:
        return _serializar(s)
