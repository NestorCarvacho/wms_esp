"""Handlers CRUD de tipos de zona."""
from __future__ import annotations

from typing import Any

from app.modules.warehouse.application.commands import ActualizarTipoZonaCommand, CrearTipoZonaCommand
from app.modules.warehouse.application.tipo_zona_mappers import (
    serializar_tipo_zona_detalle,
    serializar_tipo_zona_lista,
)
from app.modules.warehouse.domain.ports import ITipoZonaRepository


class ListarTiposZonaQueryHandler:
    def __init__(self, repo: ITipoZonaRepository):
        self.repo = repo

    async def handle(self, **kwargs: Any) -> dict:
        pagina = kwargs.get("pagina", 1)
        por_pagina = kwargs.get("por_pagina", 10)
        tipos, total = await self.repo.listar(**kwargs)
        return {
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "tipos_zona": [serializar_tipo_zona_lista(t) for t in tipos],
        }


class ObtenerTipoZonaQueryHandler:
    def __init__(self, repo: ITipoZonaRepository):
        self.repo = repo

    async def handle(self, tipo_zona_id: int, empresa_id: int | None = None) -> dict:
        tipo = await self.repo.obtener_por_id(tipo_zona_id, empresa_id)
        if not tipo:
            raise ValueError("Tipo de zona no encontrado")
        return serializar_tipo_zona_detalle(tipo)


class CrearTipoZonaHandler:
    def __init__(self, repo: ITipoZonaRepository):
        self.repo = repo

    async def handle(self, cmd: CrearTipoZonaCommand) -> dict:
        if not cmd.nombre or not cmd.nombre.strip():
            raise ValueError("El nombre no puede estar vacío")
        nombre = cmd.nombre.strip()
        if await self.repo.obtener_por_nombre(nombre, cmd.empresa_id):
            raise ValueError(f"Ya existe un tipo de zona con el nombre '{nombre}'")
        nuevo = await self.repo.crear(cmd.empresa_id, nombre, cmd.activo)
        return serializar_tipo_zona_detalle(nuevo)


class ActualizarTipoZonaHandler:
    def __init__(self, repo: ITipoZonaRepository):
        self.repo = repo

    async def handle(self, cmd: ActualizarTipoZonaCommand) -> dict:
        nombre = cmd.nombre
        if nombre is not None and nombre.strip():
            nombre = nombre.strip()
            existente = await self.repo.obtener_por_nombre(nombre, cmd.empresa_id)
            if existente and existente.id != cmd.tipo_zona_id:
                raise ValueError(f"Ya existe un tipo de zona con el nombre '{nombre}'")
        actualizado = await self.repo.actualizar(
            cmd.tipo_zona_id, cmd.empresa_id, nombre, cmd.activo
        )
        if not actualizado:
            raise ValueError("Tipo de zona no encontrado")
        return serializar_tipo_zona_detalle(actualizado)


class EliminarTipoZonaHandler:
    def __init__(self, repo: ITipoZonaRepository):
        self.repo = repo

    async def handle(self, tipo_zona_id: int, empresa_id: int) -> dict:
        tipo = await self.repo.obtener_por_id(tipo_zona_id, empresa_id)
        if not tipo:
            raise ValueError("Tipo de zona no encontrado")
        if not await self.repo.eliminar(tipo_zona_id, empresa_id):
            raise ValueError("Error al eliminar tipo de zona")
        return {"mensaje": f"Tipo de zona '{tipo.nombre}' eliminado", "tipo_zona_id": tipo_zona_id}
