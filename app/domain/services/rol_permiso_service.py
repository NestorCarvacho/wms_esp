"""Servicio de asignación rol ↔ permiso — fachada IAM."""
from typing import Any, Dict

from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.container import build_iam_handlers
from app.infrastructure.repositories.rol_permiso_crud_repository import RolPermisoCRUDRepository
from app.modules.iam.application.commands_rbac import SincronizarPermisosRolCommand


class RolPermisoService:
    def __init__(
        self,
        repository: RolPermisoCRUDRepository | None = None,
        session: AsyncSession | None = None,
    ):
        if session is None and repository is not None:
            session = repository.session
        elif session is None:
            raise ValueError("Se requiere session o repository")
        self._handlers = build_iam_handlers(session)

    async def listar_por_rol(self, rol_id: int, usuario: dict) -> Dict[str, Any]:
        return await self._handlers.listar_permisos_rol.handle(rol_id, usuario)

    async def sincronizar(
        self, rol_id: int, usuario: dict, permiso_ids: list[int]
    ) -> Dict[str, Any]:
        return await self._handlers.sincronizar_permisos_rol.handle(
            SincronizarPermisosRolCommand(
                rol_id=rol_id, usuario=usuario, permiso_ids=permiso_ids
            )
        )
