"""Consulta detallada de producto por SKU o código de barras."""
from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.domain.services.producto_presentacion_service import _serializar_presentacion
from app.infrastructure.models.usuario import Producto, SerieProducto
from app.infrastructure.repositories.inventario_crud_repository import InventarioCRUDRepository
from app.infrastructure.repositories.producto_crud_repository import ProductoCRUDRepository
from app.infrastructure.repositories.producto_presentacion_crud_repository import (
    ProductoPresentacionCRUDRepository,
)
from app.domain.services.display_helpers import format_empresa_nombre


class ProductoConsultaService:
    def __init__(
        self,
        producto_repo: ProductoCRUDRepository,
        presentacion_repo: ProductoPresentacionCRUDRepository,
        inventario_repo: InventarioCRUDRepository,
    ):
        self.producto_repo = producto_repo
        self.presentacion_repo = presentacion_repo
        self.inventario_repo = inventario_repo

    async def consultar_por_codigo(
        self,
        codigo: str,
        empresas_ids: list[int],
    ) -> dict[str, Any]:
        term = codigo.strip()
        if not term:
            raise ValueError("Ingrese un SKU o código de barras")

        presentacion_match = None
        producto = None
        via: str | None = None

        for empresa_id in empresas_ids:
            presentacion_match = await self.presentacion_repo.buscar_por_codigo_barras(empresa_id, term)
            if presentacion_match:
                producto = presentacion_match.producto
                via = "codigo_barras"
                break

        if producto is None:
            for empresa_id in empresas_ids:
                producto = await self.producto_repo.obtener_por_sku(term, empresa_id)
                if producto:
                    via = "sku"
                    break
        if producto is None:
            producto = await self._buscar_sku_insensitive(term, empresas_ids)
            if producto:
                via = "sku"

        # Último recurso: buscar por número de serie registrada
        if producto is None:
            for empresa_id in empresas_ids:
                serie_match = await self._buscar_por_numero_serie(term, empresa_id)
                if serie_match:
                    producto = serie_match
                    via = "numero_serie"
                    break

        if not producto:
            raise ValueError(f"No se encontró producto con SKU o código de barras «{term}»")

        empresa_id = producto.empresa_id
        producto_full = await self._cargar_producto(producto.id, empresa_id)
        if not producto_full:
            raise ValueError("Producto no encontrado")

        presentaciones_data = await self.presentacion_repo.listar_por_producto(
            producto.id, empresa_id, pagina=1, por_pagina=500
        )
        presentaciones = [_serializar_presentacion(p) for p in presentaciones_data[0]]

        stock_items, _ = await self.inventario_repo.listar_stock(
            empresa_id=empresa_id,
            producto_id=producto.id,
            pagina=1,
            por_pagina=500,
            es_super_admin=False,
        )
        stock_total = sum(float(s["cantidad"]) for s in stock_items)

        series_resumen: list[dict[str, Any]] = []
        series_total = 0
        if bool(producto_full.serializado):
            series_resumen, series_total = await self._resumen_series(producto.id, empresa_id)

        matched_presentacion = None
        if via == "codigo_barras" and presentacion_match:
            matched_presentacion = _serializar_presentacion(presentacion_match)

        return {
            "via": via,
            "codigo_consultado": term,
            "presentacion_coincidente": matched_presentacion,
            "producto": {
                "id": producto_full.id,
                "empresa_id": producto_full.empresa_id,
                "empresa_nombre": format_empresa_nombre(producto_full.empresa),
                "sku": producto_full.sku,
                "nombre": producto_full.nombre,
                "activo": producto_full.activo,
                "serializado": bool(producto_full.serializado),
                "unidad_medida_id": producto_full.unidad_medida_id,
                "unidad_medida_nombre": (
                    producto_full.unidad_medida.nombre if producto_full.unidad_medida else None
                ),
                "tipo_producto_id": producto_full.tipo_producto_id,
                "tipo_producto_nombre": (
                    producto_full.tipo_producto.nombre if producto_full.tipo_producto else None
                ),
                "precio_costo": (
                    float(producto_full.precio_costo) if producto_full.precio_costo is not None else None
                ),
            },
            "presentaciones": presentaciones,
            "stock": {
                "total_unidades_base": stock_total,
                "por_zona": stock_items,
            },
            "series": {
                "total_en_bodega": series_total,
                "por_zona": series_resumen,
            },
        }

    async def _buscar_sku_insensitive(self, sku: str, empresas_ids: list[int]) -> Producto | None:
        lower = sku.lower()
        stmt = (
            select(Producto)
            .where(Producto.empresa_id.in_(empresas_ids), Producto.activo == True)
        )
        result = await self.producto_repo.session.execute(stmt)
        for p in result.scalars().all():
            if p.sku.lower() == lower:
                return p
        return None

    async def _cargar_producto(self, producto_id: int, empresa_id: int) -> Producto | None:
        stmt = (
            select(Producto)
            .options(
                selectinload(Producto.empresa),
                selectinload(Producto.unidad_medida),
                selectinload(Producto.tipo_producto),
            )
            .where(Producto.id == producto_id, Producto.empresa_id == empresa_id, Producto.activo == True)
        )
        result = await self.producto_repo.session.execute(stmt)
        return result.scalars().first()

    async def _buscar_por_numero_serie(
        self, numero_serie: str, empresa_id: int
    ) -> "Producto | None":
        from app.infrastructure.models.usuario import SerieProducto as SP

        stmt = (
            select(SP)
            .options(selectinload(SP.producto))
            .where(
                SP.empresa_id == empresa_id,
                SP.numero_serie == numero_serie,
            )
            .limit(1)
        )
        result = await self.producto_repo.session.execute(stmt)
        serie = result.scalars().first()
        return serie.producto if serie and serie.producto and serie.producto.activo else None

    async def _resumen_series(
        self, producto_id: int, empresa_id: int
    ) -> tuple[list[dict[str, Any]], int]:
        from sqlalchemy import func

        stmt = (
            select(
                SerieProducto.zona_bodega_id,
                func.count(SerieProducto.id),
            )
            .where(
                SerieProducto.empresa_id == empresa_id,
                SerieProducto.producto_id == producto_id,
                SerieProducto.estado == "EN_BODEGA",
            )
            .group_by(SerieProducto.zona_bodega_id)
        )
        rows = (await self.producto_repo.session.execute(stmt)).all()
        if not rows:
            return [], 0

        zona_ids = [r[0] for r in rows if r[0] is not None]
        zonas_map: dict[int, str] = {}
        if zona_ids:
            from app.infrastructure.models.usuario import ZonaBodega

            z_stmt = select(ZonaBodega).where(ZonaBodega.id.in_(zona_ids))
            zonas = (await self.producto_repo.session.execute(z_stmt)).scalars().all()
            for z in zonas:
                zonas_map[z.id] = z.nombre or str(z.id)

        resumen = []
        total = 0
        for zona_id, cantidad in rows:
            cant = int(cantidad)
            total += cant
            resumen.append(
                {
                    "zona_bodega_id": zona_id,
                    "zona_nombre": zonas_map.get(zona_id, "Sin zona") if zona_id else "Sin ubicación",
                    "cantidad": cant,
                }
            )
        return resumen, total
