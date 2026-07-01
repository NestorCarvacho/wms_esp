"""Handlers CRUD de bodegas."""
from __future__ import annotations

from typing import Any

from app.modules.warehouse.application.bodega_mappers import (
    serializar_bodega_detalle,
    serializar_bodega_lista,
)
from app.modules.warehouse.application.commands import ActualizarBodegaCommand, CrearBodegaCommand
from app.modules.warehouse.domain.ports import IBodegaRepository


class ListarBodegasQueryHandler:
    def __init__(self, repo: IBodegaRepository):
        self.repo = repo

    async def handle(self, **kwargs: Any) -> dict:
        pagina = kwargs.get("pagina", 1)
        por_pagina = kwargs.get("por_pagina", 10)
        bodegas, total = await self.repo.listar(**kwargs)
        return {
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "bodegas": [serializar_bodega_lista(b) for b in bodegas],
        }


class ObtenerBodegaQueryHandler:
    def __init__(self, repo: IBodegaRepository):
        self.repo = repo

    async def handle(self, bodega_id: int, empresa_id: int | None = None) -> dict:
        bodega = await self.repo.obtener_por_id(bodega_id, empresa_id)
        if not bodega:
            raise ValueError("Bodega no encontrada")
        return serializar_bodega_detalle(bodega)


class CrearBodegaHandler:
    def __init__(self, repo: IBodegaRepository):
        self.repo = repo

    async def handle(self, cmd: CrearBodegaCommand) -> dict:
        if not cmd.nombre or not cmd.nombre.strip():
            raise ValueError("El nombre de la bodega no puede estar vacío")
        if not cmd.codigo or not cmd.codigo.strip():
            raise ValueError("El código de la bodega no puede estar vacío")
        nombre = cmd.nombre.strip()
        codigo = cmd.codigo.strip()
        if await self.repo.obtener_por_nombre(nombre, cmd.empresa_id):
            raise ValueError(f"Ya existe una bodega con el nombre '{nombre}' en esta empresa")
        nueva = await self.repo.crear(cmd.empresa_id, nombre, codigo, cmd.activo)
        return serializar_bodega_detalle(nueva)


class ActualizarBodegaHandler:
    def __init__(self, repo: IBodegaRepository):
        self.repo = repo

    async def handle(self, cmd: ActualizarBodegaCommand) -> dict:
        existente = await self.repo.obtener_por_id(cmd.bodega_id, cmd.empresa_id)
        if not existente:
            raise ValueError("Bodega no encontrada")

        codigo = cmd.codigo
        if codigo is not None and codigo.strip():
            codigo = codigo.strip()
            bodega_con_codigo = await self.repo.obtener_por_codigo(codigo, cmd.empresa_id)
            if bodega_con_codigo and bodega_con_codigo.id != cmd.bodega_id:
                raise ValueError(f"Ya existe una bodega con el código '{codigo}' en esta empresa")

        nombre = cmd.nombre
        if nombre is not None and nombre.strip():
            nombre = nombre.strip()
            bodega_con_nombre = await self.repo.obtener_por_nombre(nombre, cmd.empresa_id)
            if bodega_con_nombre and bodega_con_nombre.id != cmd.bodega_id:
                raise ValueError(f"Ya existe una bodega con el nombre '{nombre}' en esta empresa")

        activo = existente.activo if cmd.activo is None else cmd.activo
        actualizada = await self.repo.actualizar(
            cmd.bodega_id, cmd.empresa_id, nombre, codigo, activo
        )
        if not actualizada:
            raise ValueError("Error al actualizar la bodega")
        return serializar_bodega_detalle(actualizada)


class EliminarBodegaHandler:
    def __init__(self, repo: IBodegaRepository):
        self.repo = repo

    async def handle(self, bodega_id: int, empresa_id: int) -> dict:
        bodega = await self.repo.obtener_por_id(bodega_id, empresa_id)
        if not bodega:
            raise ValueError("Bodega no encontrada")
        if not await self.repo.eliminar(bodega_id, empresa_id):
            raise ValueError("Error al eliminar la bodega")
        return {"mensaje": f"Bodega '{bodega.nombre}' eliminada exitosamente", "bodega_id": bodega_id}
