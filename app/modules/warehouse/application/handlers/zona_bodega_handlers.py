"""Handlers CRUD de zonas de bodega."""
from __future__ import annotations

from typing import Any

from app.modules.warehouse.application.commands import (
    ActualizarZonaBodegaCommand,
    CrearZonaBodegaCommand,
)
from app.modules.warehouse.application.zona_bodega_mappers import serializar_zona_bodega
from app.modules.warehouse.domain.ports import (
    IBodegaRepository,
    ITipoZonaRepository,
    IZonaBodegaRepository,
)


async def _validar_relaciones(
    bodegas: IBodegaRepository,
    tipos: ITipoZonaRepository,
    bodega_id: int,
    tipo_zona_id: int,
    empresa_id: int,
    es_super_admin: bool = False,
) -> tuple[Any, Any]:
    filtro = None if es_super_admin else empresa_id
    bodega = await bodegas.obtener_por_id(bodega_id, filtro)
    if not bodega or not bodega.activo:
        raise ValueError("Bodega no encontrada")
    tipo = await tipos.obtener_por_id(tipo_zona_id, filtro)
    if not tipo or not tipo.activo:
        raise ValueError("Tipo de zona no encontrado")
    if bodega.empresa_id != tipo.empresa_id:
        raise ValueError("La bodega y el tipo de zona deben pertenecer a la misma empresa")
    if not es_super_admin and bodega.empresa_id != empresa_id:
        raise ValueError("No tiene permiso para operar en otra empresa")
    return bodega, tipo


class ListarZonasBodegaQueryHandler:
    def __init__(self, repo: IZonaBodegaRepository):
        self.repo = repo

    async def handle(self, **kwargs: Any) -> dict:
        pagina = kwargs.get("pagina", 1)
        por_pagina = kwargs.get("por_pagina", 10)
        zonas, total = await self.repo.listar(**kwargs)
        return {
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "zonas_bodega": [serializar_zona_bodega(z) for z in zonas],
        }


class ObtenerZonaBodegaQueryHandler:
    def __init__(self, repo: IZonaBodegaRepository):
        self.repo = repo

    async def handle(self, zona_id: int, empresa_id: int | None = None) -> dict:
        zona = await self.repo.obtener_por_id(zona_id, empresa_id)
        if not zona:
            raise ValueError("Zona de bodega no encontrada")
        return serializar_zona_bodega(zona)


class CrearZonaBodegaHandler:
    def __init__(
        self,
        repo: IZonaBodegaRepository,
        bodegas: IBodegaRepository,
        tipos: ITipoZonaRepository,
    ):
        self.repo = repo
        self.bodegas = bodegas
        self.tipos = tipos

    async def handle(self, cmd: CrearZonaBodegaCommand) -> dict:
        await _validar_relaciones(
            self.bodegas,
            self.tipos,
            cmd.bodega_id,
            cmd.tipo_zona_id,
            cmd.empresa_id,
            cmd.es_super_admin,
        )
        nueva = await self.repo.crear(
            cmd.bodega_id, cmd.tipo_zona_id, cmd.nombre, cmd.activo
        )
        return serializar_zona_bodega(nueva)


class ActualizarZonaBodegaHandler:
    def __init__(
        self,
        repo: IZonaBodegaRepository,
        bodegas: IBodegaRepository,
        tipos: ITipoZonaRepository,
    ):
        self.repo = repo
        self.bodegas = bodegas
        self.tipos = tipos

    async def handle(self, cmd: ActualizarZonaBodegaCommand) -> dict:
        filtro = None if cmd.es_super_admin else cmd.empresa_id
        existente = await self.repo.obtener_por_id(cmd.zona_id, filtro)
        if not existente:
            raise ValueError("Zona de bodega no encontrada")

        new_bodega_id = cmd.bodega_id if cmd.bodega_id is not None else existente.bodega_id
        new_tipo_id = cmd.tipo_zona_id if cmd.tipo_zona_id is not None else existente.tipo_zona_id
        await _validar_relaciones(
            self.bodegas,
            self.tipos,
            new_bodega_id,
            new_tipo_id,
            cmd.empresa_id,
            cmd.es_super_admin,
        )

        actualizada = await self.repo.actualizar(
            cmd.zona_id,
            filtro if filtro is not None else existente.bodega.empresa_id,
            bodega_id=cmd.bodega_id,
            tipo_zona_id=cmd.tipo_zona_id,
            nombre=cmd.nombre,
            activo=cmd.activo,
        )
        if not actualizada:
            raise ValueError("Error al actualizar zona de bodega")
        return serializar_zona_bodega(actualizada)


class EliminarZonaBodegaHandler:
    def __init__(self, repo: IZonaBodegaRepository):
        self.repo = repo

    async def handle(
        self,
        zona_id: int,
        empresa_id: int | None = None,
        es_super_admin: bool = False,
    ) -> dict:
        filtro = None if es_super_admin else empresa_id
        zona = await self.repo.obtener_por_id(zona_id, filtro)
        if not zona:
            raise ValueError("Zona de bodega no encontrada")
        empresa_eliminar = filtro or (zona.bodega.empresa_id if zona.bodega else empresa_id)
        if not await self.repo.eliminar(zona_id, empresa_eliminar):
            raise ValueError("Error al eliminar zona de bodega")
        label = zona.nombre or f"#{zona.id}"
        return {"mensaje": f"Zona '{label}' eliminada", "zona_bodega_id": zona_id}
