"""Handlers CRUD de tipos de producto."""
from __future__ import annotations

from typing import Any

from app.modules.catalog.application.commands import ActualizarTipoProductoCommand, CrearTipoProductoCommand
from app.modules.catalog.application.tipo_producto_mappers import (
    serializar_tipo_producto_detalle,
    serializar_tipo_producto_lista,
)
from app.modules.catalog.domain.ports import ITipoProductoRepository


class ListarTiposProductoQueryHandler:
    def __init__(self, repo: ITipoProductoRepository):
        self.repo = repo

    async def handle(self, **kwargs: Any) -> dict:
        pagina = kwargs.get("pagina", 1)
        por_pagina = kwargs.get("por_pagina", 10)
        tipos, total = await self.repo.listar(**kwargs)
        return {
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "tipos_producto": [serializar_tipo_producto_lista(t) for t in tipos],
        }


class ObtenerTipoProductoQueryHandler:
    def __init__(self, repo: ITipoProductoRepository):
        self.repo = repo

    async def handle(self, tipo_producto_id: int, empresa_id: int | None = None) -> dict:
        tipo = await self.repo.obtener_por_id(tipo_producto_id, empresa_id)
        if not tipo:
            raise ValueError("Tipo de producto no encontrado")
        return serializar_tipo_producto_detalle(tipo)


class CrearTipoProductoHandler:
    def __init__(self, repo: ITipoProductoRepository):
        self.repo = repo

    async def handle(self, cmd: CrearTipoProductoCommand) -> dict:
        if not cmd.nombre or not cmd.nombre.strip():
            raise ValueError("El nombre no puede estar vacío")
        nombre = cmd.nombre.strip()
        if await self.repo.obtener_por_nombre(nombre, cmd.empresa_id):
            raise ValueError(f"Ya existe un tipo de producto con el nombre '{nombre}'")
        nuevo = await self.repo.crear(cmd.empresa_id, nombre, cmd.activo)
        return serializar_tipo_producto_detalle(nuevo)


class ActualizarTipoProductoHandler:
    def __init__(self, repo: ITipoProductoRepository):
        self.repo = repo

    async def handle(self, cmd: ActualizarTipoProductoCommand) -> dict:
        nombre = cmd.nombre
        if nombre is not None and nombre.strip():
            nombre = nombre.strip()
            existente = await self.repo.obtener_por_nombre(nombre, cmd.empresa_id)
            if existente and existente.id != cmd.tipo_producto_id:
                raise ValueError(f"Ya existe un tipo de producto con el nombre '{nombre}'")
        actualizado = await self.repo.actualizar(
            cmd.tipo_producto_id, cmd.empresa_id, nombre, cmd.activo
        )
        if not actualizado:
            raise ValueError("Tipo de producto no encontrado")
        return serializar_tipo_producto_detalle(actualizado)


class EliminarTipoProductoHandler:
    def __init__(self, repo: ITipoProductoRepository):
        self.repo = repo

    async def handle(self, tipo_producto_id: int, empresa_id: int) -> dict:
        tipo = await self.repo.obtener_por_id(tipo_producto_id, empresa_id)
        if not tipo:
            raise ValueError("Tipo de producto no encontrado")
        if not await self.repo.eliminar(tipo_producto_id, empresa_id):
            raise ValueError("Error al eliminar tipo de producto")
        return {
            "mensaje": f"Tipo de producto '{tipo.nombre}' eliminado",
            "tipo_producto_id": tipo_producto_id,
        }
