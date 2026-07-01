"""Handlers CRUD de unidades de medida."""
from __future__ import annotations

from typing import Any

from app.modules.catalog.application.commands import (
    ActualizarUnidadMedidaCommand,
    CrearUnidadMedidaCommand,
)
from app.modules.catalog.application.unidad_medida_mappers import (
    serializar_unidad_medida_detalle,
    serializar_unidad_medida_lista,
)
from app.modules.catalog.domain.ports import IUnidadMedidaRepository


class ListarUnidadesMedidaQueryHandler:
    def __init__(self, repo: IUnidadMedidaRepository):
        self.repo = repo

    async def handle(self, **kwargs: Any) -> dict:
        pagina = kwargs.get("pagina", 1)
        por_pagina = kwargs.get("por_pagina", 10)
        unidades, total = await self.repo.listar(**kwargs)
        return {
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "productos": [serializar_unidad_medida_lista(u) for u in unidades],
        }


class ObtenerUnidadMedidaQueryHandler:
    def __init__(self, repo: IUnidadMedidaRepository):
        self.repo = repo

    async def handle(self, unidad_medida_id: int, empresa_id: int | None = None) -> dict:
        unidad = await self.repo.obtener_por_id(unidad_medida_id, empresa_id)
        if not unidad:
            raise ValueError("Unidad de medida no encontrada")
        return serializar_unidad_medida_detalle(unidad)


class CrearUnidadMedidaHandler:
    def __init__(self, repo: IUnidadMedidaRepository):
        self.repo = repo

    async def handle(self, cmd: CrearUnidadMedidaCommand) -> dict:
        if not cmd.nombre or not cmd.nombre.strip():
            raise ValueError("El nombre de la unidad de medida no puede estar vacío")
        if not cmd.codigo or not cmd.codigo.strip():
            raise ValueError("El código de la unidad de medida no puede estar vacío")
        nombre = cmd.nombre.strip()
        codigo = cmd.codigo.strip()
        if await self.repo.obtener_por_nombre(nombre, cmd.empresa_id):
            raise ValueError(
                f"Ya existe una unidad de medida con el nombre '{nombre}' en esta empresa"
            )
        nuevo = await self.repo.crear(cmd.empresa_id, nombre, codigo, cmd.activo)
        return serializar_unidad_medida_detalle(nuevo)


class ActualizarUnidadMedidaHandler:
    def __init__(self, repo: IUnidadMedidaRepository):
        self.repo = repo

    async def handle(self, cmd: ActualizarUnidadMedidaCommand) -> dict:
        existente = await self.repo.obtener_por_id(cmd.unidad_medida_id, cmd.empresa_id)
        if not existente:
            raise ValueError("Unidad de medida no encontrada")

        nombre = cmd.nombre
        codigo = cmd.codigo
        if codigo is not None and codigo.strip():
            codigo = codigo.strip()
            otro = await self.repo.obtener_por_codigo(codigo, cmd.empresa_id)
            if otro and otro.id != cmd.unidad_medida_id:
                raise ValueError(
                    f"Ya existe una unidad de medida con el código '{codigo}' en esta empresa"
                )
        if nombre is not None and nombre.strip():
            nombre = nombre.strip()
            otro = await self.repo.obtener_por_nombre(nombre, cmd.empresa_id)
            if otro and otro.id != cmd.unidad_medida_id:
                raise ValueError(
                    f"Ya existe una unidad de medida con el nombre '{nombre}' en esta empresa"
                )

        actualizado = await self.repo.actualizar(
            cmd.unidad_medida_id, cmd.empresa_id, nombre, codigo, cmd.activo
        )
        if not actualizado:
            raise ValueError("Error al actualizar la unidad de medida")
        return serializar_unidad_medida_detalle(actualizado)


class EliminarUnidadMedidaHandler:
    def __init__(self, repo: IUnidadMedidaRepository):
        self.repo = repo

    async def handle(self, unidad_medida_id: int, empresa_id: int) -> dict:
        unidad = await self.repo.obtener_por_id(unidad_medida_id, empresa_id)
        if not unidad:
            raise ValueError("Unidad de medida no encontrada")
        if not await self.repo.eliminar(unidad_medida_id, empresa_id):
            raise ValueError("Error al eliminar la unidad de medida")
        return {
            "mensaje": f"Unidad de medida '{unidad.nombre}' eliminada exitosamente",
            "unidad_medida_id": unidad_medida_id,
        }
