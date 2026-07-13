"""Adaptadores IAM → tenant (acceso multi-empresa y lookup de empresa)."""
from __future__ import annotations

from typing import Any

from app.modules.iam.domain.ports import IEmpresaLookupPort, ITenantAccessPort
from app.modules.tenant.infrastructure.empresa_crud import EmpresaCRUDRepository
from app.modules.tenant.infrastructure.tenant_access_adapter import TenantAccessAdapter


class TenantEmpresaLookupAdapter:
    def __init__(self, session):
        self._repo = EmpresaCRUDRepository(session)

    async def obtener_por_id(self, empresa_id: int) -> Any | None:
        return await self._repo.obtener_por_id(empresa_id)


class TenantAccessPortAdapter:
    def __init__(self, session):
        self._adapter = TenantAccessAdapter(session)

    async def validar_acceso(self, empresa_maestra_id: int, empresa_objetivo_id: int) -> None:
        await self._adapter.validar_acceso(empresa_maestra_id, empresa_objetivo_id)
