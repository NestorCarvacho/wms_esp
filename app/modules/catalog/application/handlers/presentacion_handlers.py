"""Handlers de presentaciones comerciales."""
from __future__ import annotations

from decimal import Decimal
from typing import Any

from app.modules.catalog.domain.ports import IProductoPresentacionService


class PresentacionHandlers:
    """Agrupa casos de uso de presentaciones (facilita inyección)."""

    def __init__(self, service: IProductoPresentacionService):
        self._service = service

    async def resolver_empresa_producto(
        self,
        producto_id: int,
        empresa_usuario_id: int,
        es_maestra: bool,
        empresas_administradas_ids: list[int],
    ) -> int:
        return await self._service.resolver_empresa_para_producto(
            producto_id, empresa_usuario_id, es_maestra, empresas_administradas_ids
        )

    async def resolver_empresa_presentacion(
        self,
        presentacion_id: int,
        empresa_usuario_id: int,
        es_maestra: bool,
        empresas_administradas_ids: list[int],
    ) -> int:
        return await self._service.resolver_empresa_para_presentacion(
            presentacion_id, empresa_usuario_id, es_maestra, empresas_administradas_ids
        )

    async def listar(
        self,
        producto_id: int,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 50,
        buscar: str | None = None,
    ) -> dict[str, Any]:
        return await self._service.listar_presentaciones(
            producto_id, empresa_id, pagina, por_pagina, buscar
        )

    async def buscar_barcode(self, empresa_id: int, codigo: str) -> dict[str, Any] | None:
        return await self._service.buscar_por_barcode(empresa_id, codigo)

    async def crear(
        self,
        producto_id: int,
        empresa_id: int,
        nombre: str,
        cantidad_contenida: Decimal,
        unidad_medida_id: int,
        **kwargs: Any,
    ) -> dict[str, Any]:
        return await self._service.crear_presentacion(
            producto_id=producto_id,
            empresa_id=empresa_id,
            nombre=nombre,
            cantidad_contenida=cantidad_contenida,
            unidad_medida_id=unidad_medida_id,
            **kwargs,
        )

    async def actualizar(
        self, presentacion_id: int, empresa_id: int, **datos: Any
    ) -> dict[str, Any]:
        return await self._service.actualizar_presentacion(
            presentacion_id, empresa_id, **datos
        )

    async def eliminar(self, presentacion_id: int, empresa_id: int) -> dict[str, Any]:
        return await self._service.eliminar_presentacion(presentacion_id, empresa_id)

    async def calcular_descuento(
        self,
        presentacion_id: int,
        empresa_id: int,
        cantidad: Decimal,
        venta_por_presentacion: bool,
    ) -> dict[str, Any]:
        return await self._service.calcular_descuento_stock(
            presentacion_id, empresa_id, cantidad, venta_por_presentacion
        )
