"""Servicio CRUD de Unidades de Medida — fachada módulo catalog."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.catalog_container import build_catalog_handlers
from app.modules.catalog.application.commands import (
    ActualizarUnidadMedidaCommand,
    CrearUnidadMedidaCommand,
)


class UnidadMedidaService:
    def __init__(self, session: AsyncSession):
        self._handlers = build_catalog_handlers(session)

    async def listar_unidades_medida(
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
        return await self._handlers.listar_unidades_medida.handle(
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

    async def obtener_unidad_medida(
        self, unidad_medida_id: int, empresa_id: int | None = None
    ) -> dict[str, Any]:
        return await self._handlers.obtener_unidad_medida.handle(unidad_medida_id, empresa_id)

    async def crear_unidad_medida(
        self,
        empresa_id: int,
        nombre: str,
        codigo: str,
        activo: bool = True,
    ) -> dict[str, Any]:
        return await self._handlers.crear_unidad_medida.handle(
            CrearUnidadMedidaCommand(
                empresa_id=empresa_id, nombre=nombre, codigo=codigo, activo=activo
            )
        )

    async def actualizar_unidad_medida(
        self,
        unidad_medida_id: int,
        empresa_id: int,
        nombre: str | None = None,
        codigo: str | None = None,
        activo: int | None = None,
    ) -> dict[str, Any]:
        activo_bool = None if activo is None else bool(activo)
        return await self._handlers.actualizar_unidad_medida.handle(
            ActualizarUnidadMedidaCommand(
                unidad_medida_id=unidad_medida_id,
                empresa_id=empresa_id,
                nombre=nombre,
                codigo=codigo,
                activo=activo_bool,
            )
        )

    async def eliminar_unidad_medida(
        self, unidad_medida_id: int, empresa_id: int
    ) -> dict[str, Any]:
        return await self._handlers.eliminar_unidad_medida.handle(unidad_medida_id, empresa_id)
