"""Handlers de perfil de usuario."""
from __future__ import annotations

from typing import Any

from app.modules.iam.application.commands_perfil import ActualizarPerfilCommand
from app.modules.iam.application.perfil_mappers import serializar_perfil
from app.modules.iam.domain.ports import IPerfilUsuarioRepository, IUserCrudRepository


class ObtenerPerfilQueryHandler:
    def __init__(
        self,
        usuarios: IUserCrudRepository,
        perfiles: IPerfilUsuarioRepository,
    ):
        self._usuarios = usuarios
        self._perfiles = perfiles

    async def handle(
        self, usuario_id: int, empresa_id: int | None
    ) -> dict[str, Any]:
        usuario = await self._usuarios.obtener_por_id(usuario_id, empresa_id)
        if not usuario:
            raise ValueError("Usuario no encontrado")
        perfil = await self._perfiles.obtener_por_usuario_id(usuario_id)
        if not perfil:
            raise ValueError("Perfil de usuario no encontrado")
        return serializar_perfil(perfil)


class ActualizarPerfilHandler:
    def __init__(
        self,
        usuarios: IUserCrudRepository,
        perfiles: IPerfilUsuarioRepository,
    ):
        self._usuarios = usuarios
        self._perfiles = perfiles

    async def handle(self, cmd: ActualizarPerfilCommand) -> tuple[dict[str, Any], str]:
        usuario = await self._usuarios.obtener_por_id(cmd.usuario_id, cmd.empresa_id)
        if not usuario:
            raise ValueError("Usuario no encontrado")

        datos = cmd.datos
        rut = datos.get("rut")
        if rut:
            perfil_con_rut = await self._perfiles.obtener_por_rut(rut)
            if perfil_con_rut and perfil_con_rut.usuario_id != cmd.usuario_id:
                raise ValueError(f"El RUT {rut} ya está registrado en otro perfil")

        perfil = await self._perfiles.obtener_por_usuario_id(cmd.usuario_id)
        if perfil:
            actualizado = await self._perfiles.actualizar(cmd.usuario_id, **datos)
            if not actualizado:
                raise ValueError("No se pudo actualizar el perfil")
            return serializar_perfil(actualizado), "Perfil actualizado exitosamente"

        creado = await self._perfiles.crear(usuario_id=cmd.usuario_id, **datos)
        return serializar_perfil(creado), "Perfil creado exitosamente"
