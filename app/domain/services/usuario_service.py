"""Servicio CRUD de Usuarios — fachada sobre handlers IAM."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.container import build_iam_handlers
from app.infrastructure.repositories.usuario_crud_repository import UsuarioCRUDRepository
from app.modules.iam.application.commands_rbac import ActualizarUsuarioCommand, CrearUsuarioCommand


class UsuarioService:
    def __init__(
        self,
        repository: UsuarioCRUDRepository | None = None,
        rol_repository=None,
        session: AsyncSession | None = None,
    ):
        if session is None and repository is not None:
            session = repository.session
        elif session is None:
            raise ValueError("Se requiere session o repository")
        self._handlers = build_iam_handlers(session)

    async def listar_usuarios(self, empresa_id: int, **kwargs: Any) -> dict[str, Any]:
        return await self._handlers.listar_usuarios.handle(empresa_id, **kwargs)

    async def obtener_usuario(self, usuario_id: int, empresa_id: int = None) -> dict[str, Any]:
        return await self._handlers.obtener_usuario.handle(usuario_id, empresa_id)

    async def crear_usuario(
        self,
        empresa_id: int,
        email: str,
        contrasena: str,
        cargo_id: int = None,
    ) -> dict[str, Any]:
        return await self._handlers.crear_usuario.handle(
            CrearUsuarioCommand(
                empresa_id=empresa_id,
                email=email,
                contrasena=contrasena,
                cargo_id=cargo_id,
            )
        )

    async def actualizar_usuario(
        self,
        usuario_id: int,
        empresa_id: int,
        es_super_admin: bool = False,
        **campos,
    ) -> dict[str, Any]:
        return await self._handlers.actualizar_usuario.handle(
            ActualizarUsuarioCommand(
                usuario_id=usuario_id,
                empresa_id=empresa_id,
                es_super_admin=es_super_admin,
                campos=campos,
            )
        )

    async def eliminar_usuario(self, usuario_id: int, empresa_id: int) -> dict[str, Any]:
        return await self._handlers.desactivar_usuario.handle(usuario_id, empresa_id)

    async def reactivar_usuario(self, usuario_id: int, empresa_id: int) -> dict[str, Any]:
        return await self._handlers.reactivar_usuario.handle(usuario_id, empresa_id)
