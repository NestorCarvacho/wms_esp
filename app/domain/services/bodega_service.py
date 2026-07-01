"""Servicio CRUD de Bodegas — fachada módulo warehouse."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.warehouse_container import build_warehouse_handlers
from app.modules.warehouse.application.commands import ActualizarBodegaCommand, CrearBodegaCommand


class BodegaService:
    def __init__(self, session: AsyncSession):
        self._handlers = build_warehouse_handlers(session)

    async def listar_bodegas(
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
        return await self._handlers.listar_bodegas.handle(
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

    async def obtener_bodega(self, bodega_id: int, empresa_id: int | None = None) -> dict[str, Any]:
        return await self._handlers.obtener_bodega.handle(bodega_id, empresa_id)

    async def crear_bodega(
        self,
        empresa_id: int,
        nombre: str,
        codigo: str,
        activo: bool = True,
    ) -> dict[str, Any]:
        return await self._handlers.crear_bodega.handle(
            CrearBodegaCommand(
                empresa_id=empresa_id,
                nombre=nombre,
                codigo=codigo,
                activo=activo,
            )
        )

    async def actualizar_bodega(
        self,
        bodega_id: int,
        empresa_id: int,
        nombre: str | None = None,
        codigo: str | None = None,
        activo: bool | None = None,
    ) -> dict[str, Any]:
        return await self._handlers.actualizar_bodega.handle(
            ActualizarBodegaCommand(
                bodega_id=bodega_id,
                empresa_id=empresa_id,
                nombre=nombre,
                codigo=codigo,
                activo=activo,
            )
        )

    async def eliminar_bodega(self, bodega_id: int, empresa_id: int) -> dict[str, Any]:
        return await self._handlers.eliminar_bodega.handle(bodega_id, empresa_id)
