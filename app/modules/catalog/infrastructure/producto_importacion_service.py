"""Orquestación de importación masiva de productos desde Excel."""
from __future__ import annotations

from decimal import Decimal
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.models.usuario import ProductoPresentacion
from app.modules.catalog.infrastructure.producto_crud import ProductoCRUDRepository
from app.modules.catalog.infrastructure.producto_importacion_parser import ProductoImportacionParser
from app.modules.catalog.infrastructure.producto_importacion_validador import (
    MAX_FILAS,
    MAX_PRESENTACIONES,
    ProductoImportacionValidador,
)
from app.modules.catalog.infrastructure.producto_presentacion_crud import (
    ProductoPresentacionCRUDRepository,
)
from app.modules.catalog.infrastructure.producto_repository import SqlAlchemyProductoRepository
from app.modules.catalog.infrastructure.tipo_producto_crud import TipoProductoCRUDRepository
from app.modules.catalog.infrastructure.unidad_medida_crud import UnidadMedidaCRUDRepository


class ProductoImportacionService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.producto_repo = ProductoCRUDRepository(session)
        self.producto_lectura = SqlAlchemyProductoRepository(session)
        self.presentacion_repo = ProductoPresentacionCRUDRepository(session)
        self.unidad_repo = UnidadMedidaCRUDRepository(session)
        self.tipo_producto_repo = TipoProductoCRUDRepository(session)
        self.parser = ProductoImportacionParser()
        self.validador = ProductoImportacionValidador(
            self.producto_lectura,
            self.presentacion_repo,
            self.parser,
        )

    async def generar_plantilla(self, empresa_id: int) -> bytes:
        unidades, _ = await self.unidad_repo.listar(
            empresa_id=empresa_id,
            pagina=1,
            por_pagina=500,
            es_super_admin=False,
        )
        tipos, _ = await self.tipo_producto_repo.listar(
            empresa_id=empresa_id,
            pagina=1,
            por_pagina=500,
            es_super_admin=False,
        )
        return self.parser.generar_plantilla(unidades, tipos)

    async def importar_desde_excel(self, contenido: bytes, empresa_id: int) -> dict[str, Any]:
        unidades, _ = await self.unidad_repo.listar(
            empresa_id=empresa_id,
            pagina=1,
            por_pagina=500,
            es_super_admin=False,
        )
        tipos, _ = await self.tipo_producto_repo.listar(
            empresa_id=empresa_id,
            pagina=1,
            por_pagina=500,
            es_super_admin=False,
        )
        unidades_validas = {int(u.id) for u in unidades}
        tipos_validos = {int(t.id) for t in tipos}

        skus_bd, nombres_bd = await self.validador.cargar_existentes(empresa_id)
        barcodes_bd = await self.validador.cargar_barcodes_existentes(empresa_id)

        filas = self.parser.parsear_productos(contenido)
        filas_pres_sheet = self.parser.parsear_presentaciones(contenido)
        if not filas and not filas_pres_sheet:
            raise ValueError(
                "No se encontraron filas en las hojas 'Productos' ni 'Presentaciones'"
            )
        if len(filas) > MAX_FILAS:
            raise ValueError(f"Máximo {MAX_FILAS} productos por archivo")
        if len(filas_pres_sheet) > MAX_PRESENTACIONES:
            raise ValueError(f"Máximo {MAX_PRESENTACIONES} presentaciones por archivo")

        validos, errores = self.validador.validar_filas_productos(
            filas,
            empresa_id,
            unidades_validas,
            tipos_validos,
            skus_bd,
            nombres_bd,
            barcodes_bd,
        )

        creados = 0
        if validos:
            creados = await self.producto_repo.crear_masivo(
                [
                    {
                        "empresa_id": v["empresa_id"],
                        "sku": v["sku"],
                        "nombre": v["nombre"],
                        "unidad_medida_id": v["unidad_medida_id"],
                        "tipo_producto_id": v["tipo_producto_id"],
                        "precio_costo": v["precio_costo"],
                        "serializado": v["serializado"],
                        "activo": v["activo"],
                    }
                    for v in validos
                ]
            )

        skus_archivo = {v["sku"] for v in validos}
        skus_pres = {
            self.parser._celda_texto(f.get("sku"))
            for f in filas_pres_sheet
            if self.parser._celda_texto(f.get("sku"))
        }
        mapa_skus = await self.validador.mapa_skus_empresa(
            empresa_id, skus_archivo | skus_bd | skus_pres
        )

        pres_auto: list[dict[str, Any]] = []
        for v in validos:
            if v.get("codigo_barras"):
                pres_auto.append(
                    {
                        "fila": v["fila"],
                        "sku": v["sku"],
                        "nombre_presentacion": "Unidad",
                        "codigo_barras": v["codigo_barras"],
                        "cantidad_contenida": Decimal("1"),
                        "precio_venta": None,
                        "precio_costo": v.get("precio_costo"),
                    }
                )

        pres_validas, errores_pres = await self.validador.validar_presentaciones(
            filas_pres_sheet + pres_auto,
            mapa_skus,
            barcodes_bd,
            empresa_id,
        )

        presentaciones_creadas = 0
        if pres_validas:
            presentaciones_creadas = await self._crear_presentaciones_masivo(pres_validas)

        return {
            "total_filas": len(filas) + len(filas_pres_sheet),
            "creados": creados,
            "presentaciones_creadas": presentaciones_creadas,
            "con_errores": len(errores) + len(errores_pres),
            "errores": errores,
            "errores_presentaciones": errores_pres,
        }

    async def _crear_presentaciones_masivo(self, items: list[dict[str, Any]]) -> int:
        if not items:
            return 0
        try:
            objetos = [
                ProductoPresentacion(
                    producto_id=item["producto_id"],
                    nombre=item["nombre"],
                    codigo_barras=item["codigo_barras"],
                    cantidad_contenida=item["cantidad_contenida"],
                    unidad_medida_id=item["unidad_medida_id"],
                    precio_costo=item.get("precio_costo"),
                    precio_venta=item.get("precio_venta"),
                    permite_venta_unidad=True,
                    permite_venta_presentacion=True,
                    activo=True,
                )
                for item in items
            ]
            self.session.add_all(objetos)
            await self.session.commit()
            return len(objetos)
        except Exception:
            await self.session.rollback()
            raise
