"""Servicio CRUD de permisos — fachada IAM."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.container import build_iam_handlers
from app.infrastructure.repositories.permiso_crud_repository import PermisoCRUDRepository
from app.modules.iam.application.commands_catalog import ActualizarPermisoCommand, CrearPermisoCommand


class PermisoService:
    def __init__(
        self,
        repository: PermisoCRUDRepository | None = None,
        session: AsyncSession | None = None,
    ):
        if session is None and repository is not None:
            session = repository.session
        elif session is None:
            raise ValueError("Se requiere session o repository")
        self._handlers = build_iam_handlers(session)

    async def listar(self, empresa_id: int, **kwargs: Any) -> dict[str, Any]:
        return await self._handlers.listar_permisos.handle(empresa_id, **kwargs)

    async def crear(
        self,
        empresa_id: int,
        codigo: str,
        descripcion: str | None = None,
        activo: bool = True,
    ) -> dict[str, Any]:
        return await self._handlers.crear_permiso.handle(
            CrearPermisoCommand(
                empresa_id=empresa_id,
                codigo=codigo,
                descripcion=descripcion,
                activo=activo,
            )
        )

    async def actualizar(self, permiso_id: int, empresa_id: int, **campos) -> dict[str, Any]:
        return await self._handlers.actualizar_permiso.handle(
            ActualizarPermisoCommand(
                permiso_id=permiso_id, empresa_id=empresa_id, campos=campos
            )
        )

    async def eliminar(self, permiso_id: int, empresa_id: int) -> dict[str, Any]:
        return await self._handlers.eliminar_permiso.handle(permiso_id, empresa_id)
