"""Handlers CRUD de empresas."""
from __future__ import annotations

from typing import Any

from app.modules.tenant.application.commands import ActualizarEmpresaCommand, CrearEmpresaCommand
from app.modules.tenant.application.empresa_mappers import serializar_empresa
from app.modules.tenant.domain.ports import IEmpresaRepository


class ListarEmpresasQueryHandler:
    def __init__(self, repo: IEmpresaRepository):
        self.repo = repo

    async def handle(self, **kwargs: Any) -> dict:
        empresas, total = await self.repo.listar(**kwargs)
        pagina = kwargs.get("pagina", 1)
        por_pagina = kwargs.get("por_pagina", 10)
        return {
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "empresas": [serializar_empresa(e) for e in empresas],
        }


class ObtenerEmpresaQueryHandler:
    def __init__(self, repo: IEmpresaRepository):
        self.repo = repo

    async def handle(self, empresa_id: int) -> dict:
        empresa = await self.repo.obtener_por_id(empresa_id)
        if not empresa:
            raise ValueError("Empresa no encontrada")
        return serializar_empresa(empresa)


class CrearEmpresaHandler:
    def __init__(self, repo: IEmpresaRepository):
        self.repo = repo

    async def handle(self, cmd: CrearEmpresaCommand) -> dict:
        if await self.repo.obtener_por_codigo(cmd.codigo):
            raise ValueError(f"El código de empresa '{cmd.codigo}' ya existe")
        empresa = await self.repo.crear(cmd.codigo, cmd.razon_social, **cmd.campos)
        return serializar_empresa(empresa)


class ActualizarEmpresaHandler:
    def __init__(self, repo: IEmpresaRepository):
        self.repo = repo

    async def handle(self, cmd: ActualizarEmpresaCommand) -> dict:
        empresa = await self.repo.actualizar(cmd.empresa_id, **cmd.campos)
        if not empresa:
            raise ValueError("Empresa no encontrada")
        return serializar_empresa(empresa)


class InhabilitarEmpresaHandler:
    def __init__(self, repo: IEmpresaRepository):
        self.repo = repo

    async def handle(self, empresa_id: int) -> dict:
        if not await self.repo.eliminar(empresa_id):
            raise ValueError("Empresa no encontrada")
        return {"mensaje": f"Empresa con ID {empresa_id} inhabilitada correctamente"}
