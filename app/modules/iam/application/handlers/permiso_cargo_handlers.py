"""Handlers CRUD de permiso cargo (asignación cargo↔rol)."""
from __future__ import annotations

from typing import Any

from app.modules.iam.application.commands_rbac import (
    ActualizarPermisoCargoCommand,
    CrearPermisoCargoCommand,
    EliminarPermisoCargoCommand,
)
from app.modules.iam.domain.ports import IPermisoCargoRepository
from app.shared.formatting import format_empresa_nombre


class ListarPermisosCargoQueryHandler:
    def __init__(self, repo: IPermisoCargoRepository):
        self._repo = repo

    async def handle(
        self,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 10,
        es_super_admin: bool = False,
    ) -> dict[str, Any]:
        rows, total = await self._repo.listar(
            empresa_id=empresa_id,
            pagina=pagina,
            por_pagina=por_pagina,
            es_super_admin=es_super_admin,
        )
        return {
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "permisos_cargo": [
                {
                    "cargo_id": permiso.cargo_id,
                    "rol_id": permiso.rol_id,
                    "activo": permiso.activo,
                    "cargo_nombre": cargo.nombre,
                    "rol_nombre": rol.nombre,
                    "empresa_id": cargo.empresa_id,
                    "empresa_nombre": format_empresa_nombre(empresa),
                }
                for permiso, cargo, rol, empresa in rows
            ],
        }


class CrearPermisoCargoHandler:
    def __init__(self, repo: IPermisoCargoRepository):
        self._repo = repo

    async def handle(self, cmd: CrearPermisoCargoCommand) -> dict[str, Any]:
        filtro = None if cmd.es_super_admin else cmd.empresa_id
        cargo = await self._repo.obtener_cargo(cmd.cargo_id, filtro)
        if not cargo:
            raise ValueError("Cargo no encontrado")
        rol = await self._repo.obtener_rol(cmd.rol_id, filtro)
        if not rol:
            raise ValueError("Rol no encontrado")
        if cargo.empresa_id != rol.empresa_id:
            raise ValueError("El cargo y el rol deben pertenecer a la misma empresa")
        if not cmd.es_super_admin and cargo.empresa_id != cmd.empresa_id:
            raise ValueError("No tiene permiso para asignar permisos en otra empresa")
        permiso = await self._repo.crear(cmd.cargo_id, cmd.rol_id, cmd.activo)
        return {
            "cargo_id": permiso.cargo_id,
            "rol_id": permiso.rol_id,
            "activo": permiso.activo,
            "cargo_nombre": cargo.nombre,
            "rol_nombre": rol.nombre,
            "empresa_id": cargo.empresa_id,
        }


class ActualizarPermisoCargoHandler:
    def __init__(self, repo: IPermisoCargoRepository):
        self._repo = repo

    async def handle(self, cmd: ActualizarPermisoCargoCommand) -> dict[str, Any]:
        filtro = None if cmd.es_super_admin else cmd.empresa_id
        row = await self._repo.obtener(cmd.cargo_id, cmd.rol_id, filtro)
        if not row:
            raise ValueError("Permiso cargo no encontrado")
        permiso, cargo, rol = row
        if not cmd.es_super_admin and cargo.empresa_id != cmd.empresa_id:
            raise ValueError("No tiene permiso para modificar permisos de otra empresa")
        actualizado = await self._repo.actualizar(cmd.cargo_id, cmd.rol_id, cmd.activo)
        if not actualizado:
            raise ValueError("Error al actualizar permiso cargo")
        return {
            "cargo_id": actualizado.cargo_id,
            "rol_id": actualizado.rol_id,
            "activo": actualizado.activo,
            "cargo_nombre": cargo.nombre,
            "rol_nombre": rol.nombre,
            "empresa_id": cargo.empresa_id,
        }


class EliminarPermisoCargoHandler:
    def __init__(self, repo: IPermisoCargoRepository):
        self._repo = repo

    async def handle(self, cmd: EliminarPermisoCargoCommand) -> dict[str, str]:
        filtro = None if cmd.es_super_admin else cmd.empresa_id
        row = await self._repo.obtener(cmd.cargo_id, cmd.rol_id, filtro)
        if not row:
            raise ValueError("Permiso cargo no encontrado")
        _, cargo, _ = row
        if not cmd.es_super_admin and cargo.empresa_id != cmd.empresa_id:
            raise ValueError("No tiene permiso para eliminar permisos de otra empresa")
        if not await self._repo.eliminar(cmd.cargo_id, cmd.rol_id):
            raise ValueError("Error al eliminar permiso cargo")
        return {"mensaje": "Permiso cargo eliminado exitosamente"}
