"""Dependencias FastAPI del módulo IAM."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.container import IamHandlers, build_iam_handlers
from app.domain.services.auth_service import AuthService
from app.domain.services.permiso_cargo_service import PermisoCargoService
from app.domain.services.rol_permiso_service import RolPermisoService
from app.domain.services.usuario_rol_service import UsuarioRolService
from app.domain.services.usuario_service import UsuarioService
from app.infrastructure.database import get_db_session
from app.infrastructure.repositories.permiso_cargo_crud_repository import PermisoCargoCRUDRepository
from app.infrastructure.repositories.usuario_crud_repository import UsuarioCRUDRepository
from app.infrastructure.repositories.usuario_rol_crud_repository import UsuarioRolCRUDRepository


async def obtener_iam_handlers(
    session: AsyncSession = Depends(get_db_session),
) -> IamHandlers:
    return build_iam_handlers(session)


async def obtener_auth_service(
    session: AsyncSession = Depends(get_db_session),
) -> AuthService:
    return AuthService(session)


async def obtener_usuario_service(
    session: AsyncSession = Depends(get_db_session),
) -> UsuarioService:
    return UsuarioService(
        UsuarioCRUDRepository(session),
        UsuarioRolCRUDRepository(session),
    )


async def obtener_usuario_rol_service(
    session: AsyncSession = Depends(get_db_session),
) -> UsuarioRolService:
    return UsuarioRolService(UsuarioRolCRUDRepository(session))


async def obtener_rol_permiso_service(
    session: AsyncSession = Depends(get_db_session),
) -> RolPermisoService:
    return RolPermisoService(session=session)


async def obtener_permiso_cargo_service(
    session: AsyncSession = Depends(get_db_session),
) -> PermisoCargoService:
    return PermisoCargoService(PermisoCargoCRUDRepository(session))

