"""Handlers CRUD de usuarios."""
from __future__ import annotations

from typing import Any

from app.modules.iam.application.commands_rbac import ActualizarUsuarioCommand, CrearUsuarioCommand
from app.modules.iam.application.usuario_mappers import (
    serializar_usuario_creado,
    serializar_usuario_detalle,
    serializar_usuario_lista,
)
from app.modules.iam.domain.ports import IUserCrudRepository, IUsuarioRolRepository


class ListarUsuariosQueryHandler:
    def __init__(self, repo: IUserCrudRepository):
        self.repo = repo

    async def handle(self, empresa_id: int, **kwargs: Any) -> dict:
        usuarios, total = await self.repo.listar(empresa_id=empresa_id, **kwargs)
        pagina = kwargs.get("pagina", 1)
        por_pagina = kwargs.get("por_pagina", 10)
        return {
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "usuarios": [serializar_usuario_lista(u) for u in usuarios],
        }


class ObtenerUsuarioQueryHandler:
    def __init__(self, repo: IUserCrudRepository):
        self.repo = repo

    async def handle(self, usuario_id: int, empresa_id: int | None = None) -> dict:
        usuario = await self.repo.obtener_por_id(usuario_id, empresa_id)
        if not usuario:
            raise ValueError("Usuario no encontrado")
        return serializar_usuario_detalle(usuario)


class CrearUsuarioHandler:
    def __init__(
        self,
        repo: IUserCrudRepository,
        rol_repo: IUsuarioRolRepository | None = None,
    ):
        self.repo = repo
        self.rol_repo = rol_repo

    async def handle(self, cmd: CrearUsuarioCommand) -> dict:
        existente = await self.repo.obtener_por_email(cmd.email, cmd.empresa_id)
        if existente:
            raise ValueError(f"El email {cmd.email} ya está registrado en esta empresa")

        nuevo = await self.repo.crear(
            empresa_id=cmd.empresa_id,
            email=cmd.email,
            contrasena=cmd.contrasena,
            cargo_id=cmd.cargo_id,
        )
        if self.rol_repo and cmd.cargo_id:
            await self.rol_repo.heredar_roles_desde_cargo(
                nuevo.id, cmd.cargo_id, cmd.empresa_id
            )
        return serializar_usuario_creado(nuevo)


class ActualizarUsuarioHandler:
    def __init__(
        self,
        repo: IUserCrudRepository,
        rol_repo: IUsuarioRolRepository | None = None,
    ):
        self.repo = repo
        self.rol_repo = rol_repo

    async def handle(self, cmd: ActualizarUsuarioCommand) -> dict:
        campos = cmd.campos or {}
        filtro_empresa = None if cmd.es_super_admin else cmd.empresa_id
        usuario_actual = await self.repo.obtener_por_id(cmd.usuario_id, filtro_empresa)
        if not usuario_actual:
            raise ValueError("Usuario no encontrado")

        target_empresa_id = usuario_actual.empresa_id
        email = campos.get("email")
        if email and email != usuario_actual.email:
            existente = await self.repo.obtener_por_email(email, target_empresa_id)
            if existente and existente.id != cmd.usuario_id:
                raise ValueError(f"El email {email} ya está registrado en esta empresa")

        actualizado = await self.repo.actualizar(
            cmd.usuario_id, target_empresa_id, **campos
        )
        if not actualizado:
            raise ValueError("Usuario no encontrado")

        nuevo_cargo_id = campos.get("cargo_id")
        if self.rol_repo and nuevo_cargo_id is not None:
            await self.rol_repo.heredar_roles_desde_cargo(
                cmd.usuario_id, nuevo_cargo_id, target_empresa_id
            )
        return serializar_usuario_creado(actualizado)


class DesactivarUsuarioHandler:
    def __init__(self, repo: IUserCrudRepository):
        self.repo = repo

    async def handle(self, usuario_id: int, empresa_id: int) -> dict:
        if not await self.repo.eliminar(usuario_id, empresa_id):
            raise ValueError("Usuario no encontrado")
        return {"id": usuario_id, "mensaje": "Usuario desactivado correctamente"}


class ReactivarUsuarioHandler:
    def __init__(self, repo: IUserCrudRepository):
        self.repo = repo

    async def handle(self, usuario_id: int, empresa_id: int) -> dict:
        usuario = await self.repo.reactivar(usuario_id, empresa_id)
        if not usuario:
            raise ValueError("Usuario no encontrado")
        return {
            "id": usuario.id,
            "email": usuario.email,
            "activo": usuario.activo,
            "mensaje": "Usuario reactivado correctamente",
        }
