"""Dependencias FastAPI del módulo IAM."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.container import IamHandlers, build_iam_handlers
from app.infrastructure.database import get_db_session


async def obtener_iam_handlers(
    session: AsyncSession = Depends(get_db_session),
) -> IamHandlers:
    return build_iam_handlers(session)
