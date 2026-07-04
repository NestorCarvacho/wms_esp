"""Dependencias FastAPI del módulo tenant."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.tenant_container import TenantHandlers, build_tenant_handlers
from app.infrastructure.database import get_db_session


async def obtener_tenant_handlers(
    session: AsyncSession = Depends(get_db_session),
) -> TenantHandlers:
    return build_tenant_handlers(session)
