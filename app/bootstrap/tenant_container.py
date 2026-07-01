"""Composition root del módulo tenant."""
from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.tenant.application.handlers.empresa_handlers import (
    ActualizarEmpresaHandler,
    CrearEmpresaHandler,
    InhabilitarEmpresaHandler,
    ListarEmpresasQueryHandler,
    ObtenerEmpresaQueryHandler,
)
from app.modules.tenant.infrastructure.empresa_repository import SqlAlchemyEmpresaRepository
from app.modules.tenant.infrastructure.tenant_access_adapter import SqlAlchemyTenantRepository


@dataclass
class TenantHandlers:
    tenant: SqlAlchemyTenantRepository
    listar_empresas: ListarEmpresasQueryHandler
    obtener_empresa: ObtenerEmpresaQueryHandler
    crear_empresa: CrearEmpresaHandler
    actualizar_empresa: ActualizarEmpresaHandler
    inhabilitar_empresa: InhabilitarEmpresaHandler


def build_tenant_handlers(session: AsyncSession) -> TenantHandlers:
    tenant = SqlAlchemyTenantRepository(session)
    empresas = SqlAlchemyEmpresaRepository(session)
    return TenantHandlers(
        tenant=tenant,
        listar_empresas=ListarEmpresasQueryHandler(empresas),
        obtener_empresa=ObtenerEmpresaQueryHandler(empresas),
        crear_empresa=CrearEmpresaHandler(empresas),
        actualizar_empresa=ActualizarEmpresaHandler(empresas),
        inhabilitar_empresa=InhabilitarEmpresaHandler(empresas),
    )
