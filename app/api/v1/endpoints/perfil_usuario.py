"""
Endpoints para perfil de usuario.
Maneja los datos personales asociados a la cuenta de usuario.
"""
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.v1.dependencies import obtener_usuario_autenticado, es_super_admin
from app.bootstrap.container import IamHandlers
from app.modules.iam.application.commands_perfil import ActualizarPerfilCommand
from app.modules.iam.presentation.http.dependencies import obtener_iam_handlers
from app.schemas.usuario import (
    PerfilUsuarioActualizarDTO,
    RespuestaAPIDTO,
)


router = APIRouter(prefix="/api/v1/usuarios", tags=["Perfil Usuario"])


@router.get(
    "/{id}/perfil",
    response_model=RespuestaAPIDTO,
    summary="Obtener perfil de usuario",
    status_code=status.HTTP_200_OK,
)
async def obtener_perfil_usuario(
    id: int,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    es_admin: bool = Depends(es_super_admin),
    handlers: IamHandlers = Depends(obtener_iam_handlers),
):
    empresa_id = None if es_admin else usuario_autenticado.get("empresa_id")
    try:
        datos = await handlers.obtener_perfil.handle(id, empresa_id)
        return RespuestaAPIDTO(
            exito=True,
            datos=datos,
            mensaje="Perfil recuperado exitosamente",
        ).dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put(
    "/{id}/perfil",
    response_model=RespuestaAPIDTO,
    summary="Actualizar perfil de usuario",
    status_code=status.HTTP_200_OK,
)
async def actualizar_perfil_usuario(
    id: int,
    perfil_dto: PerfilUsuarioActualizarDTO,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    es_admin: bool = Depends(es_super_admin),
    handlers: IamHandlers = Depends(obtener_iam_handlers),
):
    try:
        empresa_id = None if es_admin else usuario_autenticado.get("empresa_id")
        datos_dict, mensaje = await handlers.actualizar_perfil.handle(
            ActualizarPerfilCommand(
                usuario_id=id,
                empresa_id=empresa_id,
                datos=perfil_dto.model_dump(exclude_unset=True),
            )
        )
        return RespuestaAPIDTO(exito=True, datos=datos_dict, mensaje=mensaje).dict()
    except ValueError as e:
        msg = str(e)
        code = status.HTTP_400_BAD_REQUEST if "RUT" in msg else status.HTTP_404_NOT_FOUND
        raise HTTPException(status_code=code, detail=msg)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
