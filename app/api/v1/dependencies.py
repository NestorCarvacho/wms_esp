"""
Dependencias compartidas para los endpoints.
Inyección de sesiones, servicios y validaciones.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database import get_db_session
from app.infrastructure.repositories.usuario_repository import UsuarioRepository
from app.domain.services.auth_service import AuthService
from app.core.security import decode_access_token
from app.schemas.usuario import TokenPayload

security = HTTPBearer()
credentials: HTTPAuthorizationCredentials = Depends(security)

async def obtener_usuario_autenticado(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_db_session)
) -> dict:
    """
    Valida el token JWT y retorna los datos del usuario autenticado.
    
    Uso en endpoints:
        @router.get("/perfil")
        async def mi_perfil(usuario: dict = Depends(obtener_usuario_autenticado)):
            return usuario
    
    Raises:
        HTTPException: Si el token es inválido o está expirado
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return TokenPayload(**payload).model_dump()


async def obtener_empresa_id(
    usuario: dict = Depends(obtener_usuario_autenticado)
) -> int:
    """Extrae y retorna el empresa_id del usuario autenticado."""
    return usuario.get("empresa_id")


async def obtener_id(
    usuario: dict = Depends(obtener_usuario_autenticado)
) -> int:
    """Extrae y retorna el id del usuario autenticado."""
    return usuario.get("usuario_id")


def es_super_admin(usuario: dict = Depends(obtener_usuario_autenticado)) -> bool:
    """
    Verifica si el usuario es super admin (empresa_id == 1).
    Los super admins pueden ver TODOS los usuarios de todas las empresas.
    """
    return usuario.get("empresa_id") == 1


async def validar_permisos(
    roles_requeridos: list[str],
    usuario: dict = Depends(obtener_usuario_autenticado)
) -> dict:
    """
    Valida que el usuario tenga al menos uno de los roles requeridos.
    
    Uso:
        async def validar_admin(usuario = Depends(validar_permisos(["admin"]))):
            ...
    """
    usuario_roles = usuario.get("roles", [])
    
    if not any(rol in usuario_roles for rol in roles_requeridos):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Permisos insuficientes. Se requiere uno de: {roles_requeridos}"
        )
    
    return usuario


async def obtener_auth_service(
    session: AsyncSession = Depends(get_db_session)
) -> AuthService:
    """Factory para obtener el servicio de autenticación."""
    usuario_repo = UsuarioRepository(session)
    return AuthService(usuario_repo)
