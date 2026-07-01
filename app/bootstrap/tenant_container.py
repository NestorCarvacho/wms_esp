"""Composition root del módulo tenant."""
from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.tenant.infrastructure.tenant_access_adapter import SqlAlchemyTenantRepository


@dataclass
class TenantHandlers:
    tenant: SqlAlchemyTenantRepository


def build_tenant_handlers(session: AsyncSession) -> TenantHandlers:
    return TenantHandlers(tenant=SqlAlchemyTenantRepository(session))
