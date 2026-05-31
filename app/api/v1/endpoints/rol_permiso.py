"""Endpoints de asignación rol ↔ permiso."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import obtener_usuario_autenticado
from app.domain.services.rol_permiso_service import RolPermisoService
from app.infrastructure.database import get_db_session
from app.infrastructure.repositories.rol_permiso_crud_repository import RolPermisoCRUDRepository
from app.schemas.permiso import RolPermisoSincronizarDTO
from app.schemas.usuario import RespuestaAPIDTO

router = APIRouter(prefix="/api/v1/roles", tags=["Roles"])


async def obtener_rol_permiso_service(session: AsyncSession = Depends(get_db_session)) -> RolPermisoService:
    return RolPermisoService(RolPermisoCRUDRepository(session))


@router.get("/{rol_id}/permisos", response_model=RespuestaAPIDTO)
async def listar_permisos_rol(
    rol_id: int,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    service: RolPermisoService = Depends(obtener_rol_permiso_service),
):
    try:
        resultado = await service.listar_por_rol(rol_id, usuario_autenticado.get("empresa_id"))
        return RespuestaAPIDTO(exito=True, datos=resultado, mensaje="Permisos del rol obtenidos").dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{rol_id}/permisos", response_model=RespuestaAPIDTO)
async def sincronizar_permisos_rol(
    rol_id: int,
    dto: RolPermisoSincronizarDTO,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    service: RolPermisoService = Depends(obtener_rol_permiso_service),
):
    try:
        resultado = await service.sincronizar(rol_id, usuario_autenticado.get("empresa_id"), dto.permiso_ids)
        return RespuestaAPIDTO(exito=True, datos=resultado, mensaje="Permisos del rol actualizados").dict()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
