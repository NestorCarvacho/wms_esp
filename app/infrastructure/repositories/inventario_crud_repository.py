"""Repositorio de stock por zona y movimientos de inventario."""
from datetime import date, datetime, timedelta
from decimal import Decimal
from sqlalchemy import select, update, insert, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import SQLAlchemyError
from app.infrastructure.repositories.listado_helpers import aplicar_orden, filtro_empresa
from app.infrastructure.models.usuario import (
    StockZona,
    MovimientoInventario,
    BodegaConfig,
    ZonaBodega,
    Bodega,
    Producto,
    ProductoPresentacion,
    TipoZona,
)


class InventarioCRUDRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def obtener_zona(self, zona_id: int, empresa_id: int | None = None) -> ZonaBodega | None:
        stmt = (
            select(ZonaBodega)
            .join(Bodega, ZonaBodega.bodega_id == Bodega.id)
            .options(
                selectinload(ZonaBodega.bodega),
                selectinload(ZonaBodega.tipo_zona),
            )
            .where(ZonaBodega.id == zona_id, ZonaBodega.activo == True)
        )
        if empresa_id is not None:
            stmt = stmt.where(Bodega.empresa_id == empresa_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def obtener_producto(self, producto_id: int, empresa_id: int) -> Producto | None:
        stmt = select(Producto).where(
            Producto.id == producto_id,
            Producto.empresa_id == empresa_id,
            Producto.activo == True,
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def obtener_presentacion(
        self, presentacion_id: int, producto_id: int
    ) -> ProductoPresentacion | None:
        stmt = select(ProductoPresentacion).where(
            ProductoPresentacion.id == presentacion_id,
            ProductoPresentacion.producto_id == producto_id,
            ProductoPresentacion.activo == True,
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_stock(self, zona_bodega_id: int, producto_id: int) -> Decimal:
        stmt = select(StockZona.cantidad).where(
            StockZona.zona_bodega_id == zona_bodega_id,
            StockZona.producto_id == producto_id,
        )
        result = await self.session.execute(stmt)
        val = result.scalar()
        return Decimal(str(val)) if val is not None else Decimal("0")

    async def ajustar_stock(
        self, zona_bodega_id: int, producto_id: int, delta: Decimal
    ) -> Decimal:
        actual = await self.get_stock(zona_bodega_id, producto_id)
        nuevo = actual + delta
        if nuevo < 0:
            raise ValueError("Stock insuficiente en la ubicación de origen")
        try:
            stmt = select(StockZona).where(
                StockZona.zona_bodega_id == zona_bodega_id,
                StockZona.producto_id == producto_id,
            )
            row = (await self.session.execute(stmt)).scalars().first()
            if row:
                row.cantidad = nuevo
            else:
                if nuevo == 0:
                    return Decimal("0")
                self.session.add(
                    StockZona(
                        zona_bodega_id=zona_bodega_id,
                        producto_id=producto_id,
                        cantidad=nuevo,
                    )
                )
            await self.session.flush()
            return nuevo
        except SQLAlchemyError as e:
            raise Exception(f"Error al ajustar stock: {str(e)}") from e

    async def registrar_movimiento(self, datos: dict) -> MovimientoInventario:
        mov = MovimientoInventario(**datos)
        self.session.add(mov)
        await self.session.flush()
        await self.session.refresh(mov)
        return await self.cargar_movimiento(mov.id)

    async def cargar_movimiento(self, mov_id: int) -> MovimientoInventario | None:
        stmt = (
            select(MovimientoInventario)
            .options(
                selectinload(MovimientoInventario.producto),
                selectinload(MovimientoInventario.usuario),
                selectinload(MovimientoInventario.zona_origen).selectinload(ZonaBodega.tipo_zona),
                selectinload(MovimientoInventario.zona_destino).selectinload(ZonaBodega.tipo_zona),
            )
            .where(MovimientoInventario.id == mov_id)
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def commit(self):
        await self.session.commit()

    async def rollback(self):
        await self.session.rollback()

    async def listar_stock(
        self,
        empresa_id: int,
        bodega_id: int | None = None,
        producto_id: int | None = None,
        zona_bodega_id: int | None = None,
        pagina: int = 1,
        por_pagina: int = 50,
        es_super_admin: bool = False,
        empresa_id_filtro: int | None = None,
        empresas_scope_ids: list[int] | None = None,
        ordenar_por: str | None = None,
        orden: str | None = None,
    ) -> tuple[list[dict], int]:
        stmt_base = (
            select(StockZona)
            .join(ZonaBodega, StockZona.zona_bodega_id == ZonaBodega.id)
            .join(Bodega, ZonaBodega.bodega_id == Bodega.id)
            .join(Producto, StockZona.producto_id == Producto.id)
            .options(
                selectinload(StockZona.zona_bodega).selectinload(ZonaBodega.tipo_zona),
                selectinload(StockZona.zona_bodega).selectinload(ZonaBodega.bodega),
                selectinload(StockZona.producto).selectinload(Producto.unidad_medida),
            )
            .where(StockZona.cantidad > 0)
        )
        empresa_cond = filtro_empresa(
            Bodega, empresa_id, es_super_admin, empresa_id_filtro, empresas_scope_ids
        )
        if empresa_cond is not None:
            stmt_base = stmt_base.where(empresa_cond)
        if bodega_id is not None:
            stmt_base = stmt_base.where(Bodega.id == bodega_id)
        if producto_id is not None:
            stmt_base = stmt_base.where(Producto.id == producto_id)
        if zona_bodega_id is not None:
            stmt_base = stmt_base.where(ZonaBodega.id == zona_bodega_id)

        count_stmt = select(func.count()).select_from(stmt_base.subquery())
        total = (await self.session.execute(count_stmt)).scalar() or 0

        stmt_base = aplicar_orden(
            stmt_base,
            columnas={
                "producto": Producto.nombre,
                "cantidad": StockZona.cantidad,
                "sku": Producto.sku,
                "bodega": Bodega.nombre,
                "zona": ZonaBodega.nombre,
            },
            ordenar_por=ordenar_por,
            orden=orden,
            default=Producto.nombre,
        )

        offset = (pagina - 1) * por_pagina
        rows = (await self.session.execute(stmt_base.offset(offset).limit(por_pagina))).scalars().all()

        items = []
        for s in rows:
            z = s.zona_bodega
            p = s.producto
            items.append(
                {
                    "zona_bodega_id": z.id,
                    "zona_nombre": z.nombre or z.tipo_zona.nombre if z.tipo_zona else "",
                    "bodega_id": z.bodega_id,
                    "bodega_nombre": z.bodega.nombre if z.bodega else None,
                    "tipo_zona_nombre": z.tipo_zona.nombre if z.tipo_zona else None,
                    "producto_id": p.id,
                    "producto_sku": p.sku,
                    "producto_nombre": p.nombre,
                    "unidad_medida_nombre": p.unidad_medida.nombre if p.unidad_medida else None,
                    "cantidad": float(s.cantidad),
                }
            )
        return items, total

    async def listar_movimientos(
        self,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 50,
        producto_id: int | None = None,
        tipo: str | None = None,
        es_super_admin: bool = False,
        empresa_id_filtro: int | None = None,
        empresas_scope_ids: list[int] | None = None,
        ordenar_por: str | None = None,
        orden: str | None = None,
    ) -> tuple[list[MovimientoInventario], int]:
        stmt = (
            select(MovimientoInventario)
            .join(Producto, MovimientoInventario.producto_id == Producto.id)
            .options(
                selectinload(MovimientoInventario.producto),
                selectinload(MovimientoInventario.usuario),
                selectinload(MovimientoInventario.zona_origen).selectinload(ZonaBodega.tipo_zona),
                selectinload(MovimientoInventario.zona_destino).selectinload(ZonaBodega.tipo_zona),
            )
            .where(MovimientoInventario.activo == True)
        )
        empresa_cond = filtro_empresa(
            MovimientoInventario,
            empresa_id,
            es_super_admin,
            empresa_id_filtro,
            empresas_scope_ids,
        )
        if empresa_cond is not None:
            stmt = stmt.where(empresa_cond)
        if producto_id is not None:
            stmt = stmt.where(MovimientoInventario.producto_id == producto_id)
        if tipo:
            stmt = stmt.where(MovimientoInventario.tipo == tipo)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await self.session.execute(count_stmt)).scalar() or 0

        stmt = aplicar_orden(
            stmt,
            columnas={
                "fecha": MovimientoInventario.creado_at,
                "tipo": MovimientoInventario.tipo,
                "cantidad": MovimientoInventario.cantidad,
                "producto": Producto.nombre,
            },
            ordenar_por=ordenar_por,
            orden=orden,
            default=MovimientoInventario.creado_at,
            default_orden="desc",
        )

        offset = (pagina - 1) * por_pagina
        rows = (await self.session.execute(stmt.offset(offset).limit(por_pagina))).scalars().all()
        return rows, total

    def _stock_stmt_base(
        self,
        empresa_id: int,
        es_super_admin: bool = False,
        empresa_id_filtro: int | None = None,
        empresas_scope_ids: list[int] | None = None,
    ):
        stmt = (
            select(StockZona)
            .join(ZonaBodega, StockZona.zona_bodega_id == ZonaBodega.id)
            .join(Bodega, ZonaBodega.bodega_id == Bodega.id)
            .join(Producto, StockZona.producto_id == Producto.id)
            .where(StockZona.cantidad > 0)
        )
        empresa_cond = filtro_empresa(
            Bodega, empresa_id, es_super_admin, empresa_id_filtro, empresas_scope_ids
        )
        if empresa_cond is not None:
            stmt = stmt.where(empresa_cond)
        return stmt

    def _mov_stmt_base(
        self,
        empresa_id: int,
        es_super_admin: bool = False,
        empresa_id_filtro: int | None = None,
        empresas_scope_ids: list[int] | None = None,
    ):
        stmt = select(MovimientoInventario).where(MovimientoInventario.activo == True)
        empresa_cond = filtro_empresa(
            MovimientoInventario,
            empresa_id,
            es_super_admin,
            empresa_id_filtro,
            empresas_scope_ids,
        )
        if empresa_cond is not None:
            stmt = stmt.where(empresa_cond)
        return stmt

    async def histograma_movimientos(
        self,
        empresa_id: int,
        dias: int = 30,
        es_super_admin: bool = False,
        empresa_id_filtro: int | None = None,
        empresas_scope_ids: list[int] | None = None,
    ) -> list[dict]:
        hoy_inicio = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        desde = hoy_inicio - timedelta(days=dias - 1)
        tipos = ("RECEPCION", "TRASLADO", "DESPACHO")

        stmt = (
            select(
                func.date(MovimientoInventario.creado_at).label("fecha"),
                MovimientoInventario.tipo,
                func.count().label("cnt"),
            )
            .where(
                MovimientoInventario.activo == True,
                MovimientoInventario.creado_at >= desde,
            )
        )
        empresa_cond = filtro_empresa(
            MovimientoInventario,
            empresa_id,
            es_super_admin,
            empresa_id_filtro,
            empresas_scope_ids,
        )
        if empresa_cond is not None:
            stmt = stmt.where(empresa_cond)
        stmt = stmt.group_by(
            func.date(MovimientoInventario.creado_at),
            MovimientoInventario.tipo,
        )

        rows = (await self.session.execute(stmt)).all()
        por_fecha: dict[date, dict[str, int]] = {}
        for i in range(dias):
            d = (desde + timedelta(days=i)).date()
            por_fecha[d] = {t: 0 for t in tipos}

        for fecha, tipo, cnt in rows:
            fd = fecha if isinstance(fecha, date) else fecha
            if fd in por_fecha and tipo in por_fecha[fd]:
                por_fecha[fd][tipo] = int(cnt)

        return [
            {
                "fecha": d.isoformat(),
                "recepcion": por_fecha[d]["RECEPCION"],
                "traslado": por_fecha[d]["TRASLADO"],
                "despacho": por_fecha[d]["DESPACHO"],
                "total": sum(por_fecha[d].values()),
            }
            for d in sorted(por_fecha.keys())
        ]

    async def distribucion_stock(
        self,
        empresa_id: int,
        bodega_id: int | None = None,
        es_super_admin: bool = False,
        empresa_id_filtro: int | None = None,
        empresas_scope_ids: list[int] | None = None,
    ) -> dict:
        empresa_cond = filtro_empresa(
            Bodega, empresa_id, es_super_admin, empresa_id_filtro, empresas_scope_ids
        )

        if bodega_id is not None:
            stmt = (
                select(
                    ZonaBodega.id.label("id"),
                    func.coalesce(ZonaBodega.nombre, TipoZona.nombre, "Sin nombre").label(
                        "etiqueta"
                    ),
                    func.sum(StockZona.cantidad).label("cantidad"),
                    func.count(StockZona.id).label("lineas"),
                )
                .select_from(StockZona)
                .join(ZonaBodega, StockZona.zona_bodega_id == ZonaBodega.id)
                .join(Bodega, ZonaBodega.bodega_id == Bodega.id)
                .outerjoin(TipoZona, ZonaBodega.tipo_zona_id == TipoZona.id)
                .where(StockZona.cantidad > 0, Bodega.id == bodega_id)
                .group_by(ZonaBodega.id, ZonaBodega.nombre, TipoZona.nombre)
                .order_by(func.sum(StockZona.cantidad).desc())
            )
            nivel = "ubicacion"
        else:
            stmt = (
                select(
                    Bodega.id.label("id"),
                    Bodega.nombre.label("etiqueta"),
                    func.sum(StockZona.cantidad).label("cantidad"),
                    func.count(StockZona.id).label("lineas"),
                )
                .select_from(StockZona)
                .join(ZonaBodega, StockZona.zona_bodega_id == ZonaBodega.id)
                .join(Bodega, ZonaBodega.bodega_id == Bodega.id)
                .where(StockZona.cantidad > 0)
                .group_by(Bodega.id, Bodega.nombre)
                .order_by(func.sum(StockZona.cantidad).desc())
            )
            nivel = "bodega"

        if empresa_cond is not None:
            stmt = stmt.where(empresa_cond)

        rows = (await self.session.execute(stmt)).all()
        total = sum(float(r.cantidad or 0) for r in rows)
        items = [
            {
                "id": int(r.id),
                "etiqueta": r.etiqueta,
                "cantidad": float(r.cantidad or 0),
                "lineas": int(r.lineas or 0),
                "porcentaje": round(float(r.cantidad or 0) / total * 100, 1) if total > 0 else 0.0,
            }
            for r in rows
        ]
        return {
            "nivel": nivel,
            "bodega_id": bodega_id,
            "total_cantidad": total,
            "items": items,
        }

    async def resumen_dashboard(
        self,
        empresa_id: int,
        dias: int = 30,
        bodega_id: int | None = None,
        es_super_admin: bool = False,
        empresa_id_filtro: int | None = None,
        empresas_scope_ids: list[int] | None = None,
    ) -> dict:
        stock_sub = self._stock_stmt_base(
            empresa_id, es_super_admin, empresa_id_filtro, empresas_scope_ids
        ).subquery()

        lineas_stock = (
            await self.session.execute(select(func.count()).select_from(stock_sub))
        ).scalar() or 0

        productos_con_stock = (
            await self.session.execute(
                select(func.count(func.distinct(stock_sub.c.producto_id)))
            )
        ).scalar() or 0

        ubicaciones_con_stock = (
            await self.session.execute(
                select(func.count(func.distinct(stock_sub.c.zona_bodega_id)))
            )
        ).scalar() or 0

        hoy_inicio = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        semana_inicio = hoy_inicio - timedelta(days=7)

        mov_base = self._mov_stmt_base(
            empresa_id, es_super_admin, empresa_id_filtro, empresas_scope_ids
        )

        movimientos_hoy = (
            await self.session.execute(
                select(func.count()).select_from(
                    mov_base.where(MovimientoInventario.creado_at >= hoy_inicio).subquery()
                )
            )
        ).scalar() or 0

        mov_semana_stmt = mov_base.where(MovimientoInventario.creado_at >= semana_inicio)
        movimientos_semana = (
            await self.session.execute(
                select(func.count()).select_from(mov_semana_stmt.subquery())
            )
        ).scalar() or 0

        mov_semana_sub = mov_semana_stmt.subquery()
        por_tipo_rows = (
            await self.session.execute(
                select(mov_semana_sub.c.tipo, func.count())
                .group_by(mov_semana_sub.c.tipo)
            )
        ).all()

        movimientos_por_tipo = {tipo: int(cnt) for tipo, cnt in por_tipo_rows}

        ultimos, _ = await self.listar_movimientos(
            empresa_id=empresa_id,
            pagina=1,
            por_pagina=8,
            es_super_admin=es_super_admin,
            empresa_id_filtro=empresa_id_filtro,
            empresas_scope_ids=empresas_scope_ids,
            ordenar_por="fecha",
            orden="desc",
        )

        filtros = {
            "es_super_admin": es_super_admin,
            "empresa_id_filtro": empresa_id_filtro,
            "empresas_scope_ids": empresas_scope_ids,
        }
        histograma = await self.histograma_movimientos(
            empresa_id=empresa_id, dias=dias, **filtros
        )
        stock_distribucion = await self.distribucion_stock(
            empresa_id=empresa_id, bodega_id=bodega_id, **filtros
        )

        return {
            "lineas_stock": int(lineas_stock),
            "productos_con_stock": int(productos_con_stock),
            "ubicaciones_con_stock": int(ubicaciones_con_stock),
            "movimientos_hoy": int(movimientos_hoy),
            "movimientos_semana": int(movimientos_semana),
            "movimientos_por_tipo_semana": movimientos_por_tipo,
            "histograma_movimientos": histograma,
            "stock_distribucion": stock_distribucion,
            "ultimos_movimientos": ultimos,
        }

    async def get_bodega_config(self, bodega_id: int) -> BodegaConfig | None:
        result = await self.session.execute(
            select(BodegaConfig).where(BodegaConfig.bodega_id == bodega_id)
        )
        return result.scalars().first()

    async def upsert_bodega_config(self, bodega_id: int, zona_recepcion_default_id: int | None):
        cfg = await self.get_bodega_config(bodega_id)
        if cfg:
            cfg.zona_recepcion_default_id = zona_recepcion_default_id
        else:
            self.session.add(
                BodegaConfig(
                    bodega_id=bodega_id,
                    zona_recepcion_default_id=zona_recepcion_default_id,
                )
            )
        await self.session.flush()
