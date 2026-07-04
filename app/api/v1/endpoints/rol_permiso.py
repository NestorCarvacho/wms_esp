"""Endpoints de asignación rol ↔ permiso."""
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.v1.dependencies import requiere_permiso
from app.bootstrap.container import IamHandlers
from app.modules.iam.application.commands_rbac import SincronizarPermisosRolCommand
from app.modules.iam.presentation.http.dependencies import obtener_iam_handlers
from app.schemas.permiso import RolPermisoSincronizarDTO
from app.schemas.usuario import RespuestaAPIDTO

router = APIRouter(prefix="/api/v1/roles", tags=["Roles"])


@router.get("/{rol_id}/permisos", response_model=RespuestaAPIDTO)
async def listar_permisos_rol(
    rol_id: int,
    usuario_autenticado: dict = Depends(requiere_permiso("roles.leer")),
    handlers: IamHandlers = Depends(obtener_iam_handlers),
):
    try:
        resultado = await handlers.listar_permisos_rol.handle(rol_id, usuario_autenticado)
        return RespuestaAPIDTO(exito=True, datos=resultado, mensaje="Permisos del rol obtenidos").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{rol_id}/permisos", response_model=RespuestaAPIDTO)
async def sincronizar_permisos_rol(
    rol_id: int,
    dto: RolPermisoSincronizarDTO,
    usuario_autenticado: dict = Depends(requiere_permiso("roles.editar")),
    handlers: IamHandlers = Depends(obtener_iam_handlers),
):
    try:
        resultado = await handlers.sincronizar_permisos_rol.handle(
            SincronizarPermisosRolCommand(
                rol_id=rol_id,
                usuario=usuario_autenticado,
                permiso_ids=dto.permiso_ids,
            )
        )
        return RespuestaAPIDTO(exito=True, datos=resultado, mensaje="Permisos del rol actualizados").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
