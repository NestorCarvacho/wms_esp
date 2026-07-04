"""Adaptador SQLAlchemy para acceso multi-tenant."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.tenant.infrastructure.empresa_administrada import EmpresaAdministradaRepository


class SqlAlchemyTenantRepository:
    def __init__(self, session: AsyncSession):
        self._repo = EmpresaAdministradaRepository(session)

    async def es_empresa_maestra(self, empresa_id: int) -> bool:
        return await self._repo.es_empresa_maestra(empresa_id)

    async def validar_acceso(self, empresa_maestra_id: int, empresa_objetivo_id: int) -> None:
        if not await self._repo.puede_administrar(empresa_maestra_id, empresa_objetivo_id):
            raise ValueError("No tiene permiso para operar sobre esta empresa")

    async def empresa_esta_operativa(self, empresa_id: int) -> bool:
        return await self._repo.empresa_esta_operativa(empresa_id)

    async def listar_empresas_administradas(
        self, empresa_maestra_id: int, *, solo_activas: bool = True
    ) -> list[Any]:
        return await self._repo.listar_empresas_administradas(
            empresa_maestra_id, solo_activas=solo_activas
        )

    async def ids_empresas_administradas_activas(self, empresa_maestra_id: int) -> list[int]:
        return await self._repo.ids_empresas_administradas_activas(empresa_maestra_id)


class TenantAccessAdapter:
    """Implementa ITenantAccessValidator para consumo desde IAM."""

    def __init__(self, session: AsyncSession):
        self._tenant = SqlAlchemyTenantRepository(session)

    async def validar_acceso(self, empresa_maestra_id: int, empresa_objetivo_id: int) -> None:
        await self._tenant.validar_acceso(empresa_maestra_id, empresa_objetivo_id)
