"""Lógica multiempresa — fachada módulo tenant."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.tenant_container import build_tenant_handlers
from app.domain.services.display_helpers import format_empresa_nombre
from app.infrastructure.repositories.empresa_administrada_repository import (
    EmpresaAdministradaRepository,
)


class EmpresaMaestraService:
    def __init__(
        self,
        repository: EmpresaAdministradaRepository | None = None,
        session: AsyncSession | None = None,
    ):
        if session is None and repository is not None:
            session = repository.session
        elif session is None:
            raise ValueError("Se requiere session o repository")
        self._tenant = build_tenant_handlers(session).tenant

    async def usuario_es_empresa_maestra(self, empresa_id: int) -> bool:
        return await self._tenant.es_empresa_maestra(empresa_id)

    async def listar_administradas(
        self, empresa_maestra_id: int, *, incluir_inactivas: bool = False
    ) -> dict[str, Any]:
        es_maestra = await self._tenant.es_empresa_maestra(empresa_maestra_id)
        if not es_maestra and empresa_maestra_id != 1:
            raise ValueError("La empresa no está configurada como maestra")
        empresas = await self._tenant.listar_empresas_administradas(
            empresa_maestra_id, solo_activas=not incluir_inactivas
        )
        return {
            "total": len(empresas),
            "empresas": [
                {
                    "id": e.id,
                    "codigo": e.codigo,
                    "razon_social": e.razon_social,
                    "rut": e.rut,
                    "esta_activa": e.esta_activa,
                    "es_empresa_maestra": bool(e.es_empresa_maestra),
                    "empresa_nombre": format_empresa_nombre(e),
                }
                for e in empresas
            ],
        }

    async def assert_operativa_para_escritura(self, empresa_id: int) -> None:
        if not await self._tenant.empresa_esta_operativa(empresa_id):
            raise ValueError(
                "La empresa está inhabilitada. Actívela desde Configuración → Empresas "
                "para crear o modificar registros."
            )

    async def validar_acceso(self, empresa_maestra_id: int, empresa_objetivo_id: int) -> None:
        await self._tenant.validar_acceso(empresa_maestra_id, empresa_objetivo_id)

    async def ids_administradas(self, empresa_maestra_id: int) -> list[int]:
        if not await self._tenant.es_empresa_maestra(empresa_maestra_id):
            return [empresa_maestra_id]
        ids = await self._tenant.ids_empresas_administradas_activas(empresa_maestra_id)
        return ids or [empresa_maestra_id]
