"""Servicio CRUD de Tipos de Producto — fachada módulo catalog."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.catalog_container import build_catalog_handlers
from app.modules.catalog.application.commands import ActualizarTipoProductoCommand, CrearTipoProductoCommand


class TipoProductoService:
    def __init__(self, session: AsyncSession):
        self._handlers = build_catalog_handlers(session)

    async def listar_tipos_producto(
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
    ) -> dict[str, Any]:
        return await self._handlers.listar_tipos_producto.handle(
            empresa_id=empresa_id,
            pagina=pagina,
            por_pagina=por_pagina,
            es_super_admin=es_super_admin,
            empresa_id_filtro=empresa_id_filtro,
            empresas_scope_ids=empresas_scope_ids,
            buscar=buscar,
            ordenar_por=ordenar_por,
            orden=orden,
        )

    async def obtener_tipo_producto(
        self, tipo_producto_id: int, empresa_id: int | None = None
    ) -> dict[str, Any]:
        return await self._handlers.obtener_tipo_producto.handle(tipo_producto_id, empresa_id)

    async def crear_tipo_producto(
        self, empresa_id: int, nombre: str, activo: bool = True
    ) -> dict[str, Any]:
        return await self._handlers.crear_tipo_producto.handle(
            CrearTipoProductoCommand(empresa_id=empresa_id, nombre=nombre, activo=activo)
        )

    async def actualizar_tipo_producto(
        self,
        tipo_producto_id: int,
        empresa_id: int,
        nombre: str | None = None,
        activo: bool | None = None,
    ) -> dict[str, Any]:
        return await self._handlers.actualizar_tipo_producto.handle(
            ActualizarTipoProductoCommand(
                tipo_producto_id=tipo_producto_id,
                empresa_id=empresa_id,
                nombre=nombre,
                activo=activo,
            )
        )

    async def eliminar_tipo_producto(
        self, tipo_producto_id: int, empresa_id: int
    ) -> dict[str, Any]:
        return await self._handlers.eliminar_tipo_producto.handle(tipo_producto_id, empresa_id)
