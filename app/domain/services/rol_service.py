"""Servicio CRUD de Roles — fachada IAM."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.container import build_iam_handlers
from app.infrastructure.repositories.rol_crud_repository import RolCRUDRepository
from app.modules.iam.application.commands_catalog import ActualizarRolCommand, CrearRolCommand


class RolService:
    def __init__(self, repository: RolCRUDRepository | None = None, session: AsyncSession | None = None):
        if session is None and repository is not None:
            session = repository.session
        elif session is None:
            raise ValueError("Se requiere session o repository")
        self._handlers = build_iam_handlers(session)

    async def listar_roles(self, empresa_id: int, **kwargs: Any) -> dict[str, Any]:
        return await self._handlers.listar_roles.handle(empresa_id, **kwargs)

    async def obtener_rol(self, rol_id: int, empresa_id: int = None) -> dict[str, Any]:
        return await self._handlers.obtener_rol.handle(rol_id, empresa_id)

    async def crear_rol(
        self,
        empresa_id: int,
        nombre: str,
        descripcion: str = None,
        activo: bool = True,
    ) -> dict[str, Any]:
        return await self._handlers.crear_rol.handle(
            CrearRolCommand(
                empresa_id=empresa_id,
                nombre=nombre,
                descripcion=descripcion,
                activo=activo,
            )
        )

    async def actualizar_rol(
        self,
        rol_id: int,
        empresa_id: int,
        nombre: str = None,
        descripcion: str = None,
        activo: bool = None,
    ) -> dict[str, Any]:
        return await self._handlers.actualizar_rol.handle(
            ActualizarRolCommand(
                rol_id=rol_id,
                empresa_id=empresa_id,
                nombre=nombre,
                descripcion=descripcion,
                activo=activo,
            )
        )

    async def eliminar_rol(self, rol_id: int, empresa_id: int) -> dict[str, Any]:
        return await self._handlers.eliminar_rol.handle(rol_id, empresa_id)
