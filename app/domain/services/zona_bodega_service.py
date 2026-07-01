"""Servicio CRUD de Zonas de Bodega — fachada módulo warehouse."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.warehouse_container import build_warehouse_handlers
from app.modules.warehouse.application.commands import (
    ActualizarZonaBodegaCommand,
    CrearZonaBodegaCommand,
)


class ZonaBodegaService:
    def __init__(self, session: AsyncSession):
        self._handlers = build_warehouse_handlers(session)

    async def listar_zonas_bodega(
        self,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 10,
        es_super_admin: bool = False,
        empresa_id_filtro: int | None = None,
        empresas_scope_ids: list[int] | None = None,
        bodega_id: int | None = None,
        buscar: str | None = None,
        ordenar_por: str | None = None,
        orden: str | None = None,
    ) -> dict[str, Any]:
        return await self._handlers.listar_zonas_bodega.handle(
            empresa_id=empresa_id,
            pagina=pagina,
            por_pagina=por_pagina,
            es_super_admin=es_super_admin,
            empresa_id_filtro=empresa_id_filtro,
            empresas_scope_ids=empresas_scope_ids,
            bodega_id=bodega_id,
            buscar=buscar,
            ordenar_por=ordenar_por,
            orden=orden,
        )

    async def obtener_zona_bodega(
        self,
        zona_id: int,
        empresa_id: int | None = None,
    ) -> dict[str, Any]:
        return await self._handlers.obtener_zona_bodega.handle(zona_id, empresa_id)

    async def crear_zona_bodega(
        self,
        empresa_id: int,
        bodega_id: int,
        tipo_zona_id: int,
        nombre: str | None = None,
        activo: bool = True,
        es_super_admin: bool = False,
    ) -> dict[str, Any]:
        return await self._handlers.crear_zona_bodega.handle(
            CrearZonaBodegaCommand(
                empresa_id=empresa_id,
                bodega_id=bodega_id,
                tipo_zona_id=tipo_zona_id,
                nombre=nombre,
                activo=activo,
                es_super_admin=es_super_admin,
            )
        )

    async def actualizar_zona_bodega(
        self,
        zona_id: int,
        empresa_id: int,
        bodega_id: int | None = None,
        tipo_zona_id: int | None = None,
        nombre: str | None = None,
        activo: bool | None = None,
        es_super_admin: bool = False,
    ) -> dict[str, Any]:
        return await self._handlers.actualizar_zona_bodega.handle(
            ActualizarZonaBodegaCommand(
                zona_id=zona_id,
                empresa_id=empresa_id,
                bodega_id=bodega_id,
                tipo_zona_id=tipo_zona_id,
                nombre=nombre,
                activo=activo,
                es_super_admin=es_super_admin,
            )
        )

    async def eliminar_zona_bodega(
        self,
        zona_id: int,
        empresa_id: int | None = None,
        es_super_admin: bool = False,
    ) -> dict[str, Any]:
        return await self._handlers.eliminar_zona_bodega.handle(
            zona_id, empresa_id, es_super_admin
        )
