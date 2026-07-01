"""Servicio CRUD de Productos — fachada módulo catalog."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.catalog_container import build_catalog_handlers
from app.modules.catalog.application.commands import ActualizarProductoCommand, CrearProductoCommand


class ProductoService:
    def __init__(self, session: AsyncSession):
        self._handlers = build_catalog_handlers(session)

    async def listar_productos(
        self,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 10,
        es_super_admin: bool = False,
        empresa_id_filtro: int | None = None,
        empresas_scope_ids: list[int] | None = None,
        buscar: str | None = None,
        unidad_medida_id: int | None = None,
        tipo_producto_id: int | None = None,
        ordenar_por: str | None = None,
        orden: str | None = None,
    ) -> dict[str, Any]:
        return await self._handlers.listar_productos.handle(
            empresa_id=empresa_id,
            pagina=pagina,
            por_pagina=por_pagina,
            es_super_admin=es_super_admin,
            empresa_id_filtro=empresa_id_filtro,
            empresas_scope_ids=empresas_scope_ids,
            buscar=buscar,
            unidad_medida_id=unidad_medida_id,
            tipo_producto_id=tipo_producto_id,
            ordenar_por=ordenar_por,
            orden=orden,
        )

    async def obtener_producto(self, producto_id: int, empresa_id: int | None = None) -> dict[str, Any]:
        return await self._handlers.obtener_producto.handle(producto_id, empresa_id)

    async def crear_producto(
        self,
        empresa_id: int,
        nombre: str,
        sku: str,
        activo: bool = True,
        unidad_medida_id: int | None = None,
        tipo_producto_id: int | None = None,
        precio_costo: float | None = None,
        serializado: bool = False,
        stock_minimo: float | None = None,
    ) -> dict[str, Any]:
        return await self._handlers.crear_producto.handle(
            CrearProductoCommand(
                empresa_id=empresa_id,
                nombre=nombre,
                sku=sku,
                activo=activo,
                unidad_medida_id=unidad_medida_id,
                tipo_producto_id=tipo_producto_id,
                precio_costo=precio_costo,
                serializado=serializado,
                stock_minimo=stock_minimo,
            )
        )

    async def actualizar_producto(
        self,
        producto_id: int,
        empresa_id: int,
        nombre: str | None = None,
        sku: str | None = None,
        unidad_medida_id: int | None = None,
        tipo_producto_id: int | None = None,
        actualizar_tipo_producto: bool = False,
        precio_costo: float | None = None,
        activo: bool | None = None,
        serializado: bool | None = None,
        stock_minimo: float | None = None,
        actualizar_stock_minimo: bool = False,
    ) -> dict[str, Any]:
        return await self._handlers.actualizar_producto.handle(
            ActualizarProductoCommand(
                producto_id=producto_id,
                empresa_id=empresa_id,
                nombre=nombre,
                sku=sku,
                activo=activo,
                unidad_medida_id=unidad_medida_id,
                tipo_producto_id=tipo_producto_id,
                actualizar_tipo_producto=actualizar_tipo_producto,
                precio_costo=precio_costo,
                serializado=serializado,
                stock_minimo=stock_minimo,
                actualizar_stock_minimo=actualizar_stock_minimo,
            )
        )

    async def eliminar_producto(self, producto_id: int, empresa_id: int) -> dict[str, Any]:
        return await self._handlers.eliminar_producto.handle(producto_id, empresa_id)
