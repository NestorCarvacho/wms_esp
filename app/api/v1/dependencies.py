"""
Dependencias compartidas para los endpoints.
Inyección de sesiones, servicios y validaciones.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database import get_db_session
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
    Usuario de empresa maestra (puede administrar empresas vinculadas).
    Compatibilidad: si el token no trae el flag, empresa_id == 1.
    """
    if "es_empresa_maestra" in usuario:
        return bool(usuario.get("es_empresa_maestra"))
    return usuario.get("empresa_id") == 1


async def validar_permisos(
    permisos_requeridos: list[str],
    usuario: dict = Depends(obtener_usuario_autenticado)
) -> dict:
    """Valida que el usuario tenga al menos uno de los permisos requeridos."""
    usuario_permisos = usuario.get("permisos", [])
    
    if not any(p in usuario_permisos for p in permisos_requeridos):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Permisos insuficientes. Se requiere uno de: {permisos_requeridos}"
        )
    
    return usuario


def requiere_permiso(*permisos_requeridos: str):
    """
    Dependencia FastAPI: exige al menos uno de los permisos indicados.
    Uso: _auth: dict = Depends(requiere_permiso("productos.leer"))
    """
    async def _validar(usuario: dict = Depends(obtener_usuario_autenticado)) -> dict:
        return await validar_permisos(list(permisos_requeridos), usuario)
    return _validar
