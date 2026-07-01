"""Handlers de asignación RBAC (usuario↔rol, rol↔permiso, cargo↔rol)."""
from __future__ import annotations

from typing import Any

from app.modules.iam.application.commands_rbac import (
    SincronizarPermisosRolCommand,
    SincronizarRolesCargoCommand,
    SincronizarRolesUsuarioCommand,
)
from app.modules.iam.domain.ports import (
    IPermisoCargoRepository,
    IRolPermisoRepository,
    ITenantAccessValidator,
    IUsuarioRolRepository,
)
from app.modules.iam.domain.services.rol_access_policy import resolver_empresa_efectiva_rol


class ListarRolesUsuarioQueryHandler:
    def __init__(self, repo: IUsuarioRolRepository):
        self.repo = repo

    async def _resolver_usuario(
        self, usuario_id: int, empresa_id_caller: int, es_maestra: bool
    ) -> Any:
        usuario = await self.repo.obtener_usuario(
            usuario_id, None if es_maestra else empresa_id_caller
        )
        if not usuario:
            raise ValueError("Usuario no encontrado")
        if not es_maestra and usuario.empresa_id != empresa_id_caller:
            raise ValueError("No autorizado para gestionar roles de este usuario")
        return usuario

    async def handle(
        self, usuario_id: int, empresa_id_caller: int, es_maestra: bool = False
    ) -> dict:
        usuario = await self._resolver_usuario(usuario_id, empresa_id_caller, es_maestra)
        rol_ids = await self.repo.listar_roles_por_usuario(usuario_id, usuario.empresa_id)
        return {"usuario_id": usuario_id, "rol_ids": rol_ids}


class SincronizarRolesUsuarioHandler:
    def __init__(self, repo: IUsuarioRolRepository):
        self.repo = repo

    async def handle(self, cmd: SincronizarRolesUsuarioCommand) -> dict:
        usuario = await self.repo.obtener_usuario(
            cmd.usuario_id, None if cmd.es_maestra else cmd.empresa_id_caller
        )
        if not usuario:
            raise ValueError("Usuario no encontrado")
        if not cmd.es_maestra and usuario.empresa_id != cmd.empresa_id_caller:
            raise ValueError("No autorizado para gestionar roles de este usuario")
        ids = await self.repo.sincronizar_roles_usuario(
            cmd.usuario_id, usuario.empresa_id, cmd.rol_ids
        )
        return {"usuario_id": cmd.usuario_id, "rol_ids": ids}


class ListarPermisosRolQueryHandler:
    def __init__(self, repo: IRolPermisoRepository, tenant: ITenantAccessValidator):
        self.repo = repo
        self.tenant = tenant

    async def handle(self, rol_id: int, usuario: dict[str, Any]) -> dict:
        rol = await self.repo.obtener_rol(rol_id)
        if not rol:
            raise ValueError("Rol no encontrado")
        empresa_id = await resolver_empresa_efectiva_rol(rol, usuario, self.tenant)
        rows = await self.repo.listar_por_rol(rol_id, empresa_id)
        return {
            "rol_id": rol_id,
            "permiso_ids": [permiso.id for _, permiso in rows],
            "permisos": [
                {
                    "permiso_id": permiso.id,
                    "codigo": permiso.codigo,
                    "descripcion": permiso.descripcion,
                }
                for _, permiso in rows
            ],
        }


class SincronizarPermisosRolHandler:
    def __init__(self, repo: IRolPermisoRepository, tenant: ITenantAccessValidator):
        self.repo = repo
        self.tenant = tenant

    async def handle(self, cmd: SincronizarPermisosRolCommand) -> dict:
        rol = await self.repo.obtener_rol(cmd.rol_id)
        if not rol:
            raise ValueError("Rol no encontrado")
        empresa_id = await resolver_empresa_efectiva_rol(rol, cmd.usuario, self.tenant)
        ids = await self.repo.sincronizar(cmd.rol_id, empresa_id, cmd.permiso_ids)
        return {"rol_id": cmd.rol_id, "permiso_ids": ids}


class ListarRolesCargoQueryHandler:
    def __init__(self, repo: IPermisoCargoRepository):
        self.repo = repo

    async def handle(
        self, cargo_id: int, empresa_id: int, es_super_admin: bool = False
    ) -> dict:
        filtro = None if es_super_admin else empresa_id
        cargo = await self.repo.obtener_cargo(cargo_id, filtro)
        if not cargo:
            raise ValueError("Cargo no encontrado")
        if not es_super_admin and cargo.empresa_id != empresa_id:
            raise ValueError("No tiene permiso para consultar roles de otro cargo")
        rol_ids = await self.repo.listar_roles_por_cargo(cargo_id, cargo.empresa_id)
        return {"cargo_id": cargo_id, "rol_ids": rol_ids}


class SincronizarRolesCargoHandler:
    def __init__(self, repo: IPermisoCargoRepository):
        self.repo = repo

    async def handle(self, cmd: SincronizarRolesCargoCommand) -> dict:
        filtro = None if cmd.es_super_admin else cmd.empresa_id
        cargo = await self.repo.obtener_cargo(cmd.cargo_id, filtro)
        if not cargo:
            raise ValueError("Cargo no encontrado")
        if not cmd.es_super_admin and cargo.empresa_id != cmd.empresa_id:
            raise ValueError("No tiene permiso para modificar roles de otro cargo")
        ids = await self.repo.sincronizar_roles_cargo(
            cmd.cargo_id, cargo.empresa_id, cmd.rol_ids
        )
        return {"cargo_id": cmd.cargo_id, "rol_ids": ids}
