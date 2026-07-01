"""Provisiona permisos y roles estándar — fachada IAM."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.container import build_iam_handlers
from app.infrastructure.repositories.empresa_crud_repository import EmpresaCRUDRepository
from app.infrastructure.repositories.empresa_rbac_bootstrap_repository import (
    EmpresaRbacBootstrapRepository,
)
from app.modules.iam.application.commands_catalog import ProvisionarRbacCommand


class EmpresaRbacBootstrapService:
    def __init__(
        self,
        repository: EmpresaRbacBootstrapRepository | None = None,
        empresa_repository: EmpresaCRUDRepository | None = None,
        session: AsyncSession | None = None,
    ):
        if session is None and repository is not None:
            session = repository.session
        elif session is None:
            raise ValueError("Se requiere session o repository")
        self._handlers = build_iam_handlers(session)

    async def provisionar(
        self,
        empresa_destino_id: int,
        usuario: dict | None = None,
        empresa_plantilla_id: int = 1,
        es_super_admin: bool = False,
        empresa_maestra_id: int | None = None,
    ) -> dict[str, Any]:
        return await self._handlers.provisionar_rbac.handle(
            ProvisionarRbacCommand(
                empresa_destino_id=empresa_destino_id,
                usuario=usuario,
                empresa_plantilla_id=empresa_plantilla_id,
                es_super_admin=es_super_admin,
                empresa_maestra_id=empresa_maestra_id,
            )
        )
