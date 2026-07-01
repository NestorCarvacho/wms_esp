"""Servicio de asignación usuario ↔ rol — fachada IAM."""
from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.container import build_iam_handlers
from app.infrastructure.repositories.usuario_rol_crud_repository import UsuarioRolCRUDRepository
from app.modules.iam.application.commands_rbac import SincronizarRolesUsuarioCommand


class UsuarioRolService:
    def __init__(self, repository: UsuarioRolCRUDRepository | None = None, session: AsyncSession | None = None):
        if session is None and repository is not None:
            session = repository.session
        elif session is None:
            raise ValueError("Se requiere session o repository")
        self._handlers = build_iam_handlers(session)

    async def listar_roles(
        self, usuario_id: int, empresa_id_caller: int, es_maestra: bool = False
    ) -> dict:
        return await self._handlers.listar_roles_usuario.handle(
            usuario_id, empresa_id_caller, es_maestra
        )

    async def sincronizar(
        self,
        usuario_id: int,
        empresa_id_caller: int,
        rol_ids: list[int],
        es_maestra: bool = False,
    ) -> dict:
        return await self._handlers.sincronizar_roles_usuario.handle(
            SincronizarRolesUsuarioCommand(
                usuario_id=usuario_id,
                empresa_id_caller=empresa_id_caller,
                rol_ids=rol_ids,
                es_maestra=es_maestra,
            )
        )
