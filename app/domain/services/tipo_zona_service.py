"""Servicio CRUD de Tipos de Zona — fachada módulo warehouse."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.warehouse_container import build_warehouse_handlers
from app.modules.warehouse.application.commands import ActualizarTipoZonaCommand, CrearTipoZonaCommand


class TipoZonaService:
    def __init__(self, session: AsyncSession):
        self._handlers = build_warehouse_handlers(session)

    async def listar_tipos_zona(
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
        return await self._handlers.listar_tipos_zona.handle(
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

    async def obtener_tipo_zona(
        self, tipo_zona_id: int, empresa_id: int | None = None
    ) -> dict[str, Any]:
        return await self._handlers.obtener_tipo_zona.handle(tipo_zona_id, empresa_id)

    async def crear_tipo_zona(
        self, empresa_id: int, nombre: str, activo: bool = True
    ) -> dict[str, Any]:
        return await self._handlers.crear_tipo_zona.handle(
            CrearTipoZonaCommand(empresa_id=empresa_id, nombre=nombre, activo=activo)
        )

    async def actualizar_tipo_zona(
        self,
        tipo_zona_id: int,
        empresa_id: int,
        nombre: str | None = None,
        activo: bool | None = None,
    ) -> dict[str, Any]:
        return await self._handlers.actualizar_tipo_zona.handle(
            ActualizarTipoZonaCommand(
                tipo_zona_id=tipo_zona_id,
                empresa_id=empresa_id,
                nombre=nombre,
                activo=activo,
            )
        )

    async def eliminar_tipo_zona(self, tipo_zona_id: int, empresa_id: int) -> dict[str, Any]:
        return await self._handlers.eliminar_tipo_zona.handle(tipo_zona_id, empresa_id)
