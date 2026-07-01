"""Dependencias FastAPI del módulo tenant."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.services.empresa_maestra_service import EmpresaMaestraService
from app.domain.services.empresa_service import EmpresaService
from app.infrastructure.database import get_db_session
from app.infrastructure.repositories.empresa_administrada_repository import (
    EmpresaAdministradaRepository,
)


async def obtener_empresa_maestra_service(
    session: AsyncSession = Depends(get_db_session),
) -> EmpresaMaestraService:
    return EmpresaMaestraService(EmpresaAdministradaRepository(session))


async def obtener_empresa_service(
    session: AsyncSession = Depends(get_db_session),
) -> EmpresaService:
    return EmpresaService(session)
