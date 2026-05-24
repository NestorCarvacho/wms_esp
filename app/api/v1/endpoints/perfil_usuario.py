"""
Endpoints para perfil de usuario.
Maneja los datos personales asociados a la cuenta de usuario.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import obtener_usuario_autenticado, es_super_admin
from app.infrastructure.database import get_db_session
from app.infrastructure.repositories.perfil_usuario_crud_repository import PerfilUsuarioCRUDRepository
from app.infrastructure.repositories.usuario_crud_repository import UsuarioCRUDRepository
from app.schemas.usuario import (
    PerfilUsuarioActualizarDTO,
    PerfilUsuarioRespuestaDTO,
    RespuestaAPIDTO,
)


router = APIRouter(prefix="/api/v1/usuarios", tags=["Perfil Usuario"])


async def obtener_repositories(session: AsyncSession = Depends(get_db_session)):
    return {
        "usuarios": UsuarioCRUDRepository(session),
        "perfiles": PerfilUsuarioCRUDRepository(session),
    }


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
    repositories: dict = Depends(obtener_repositories),
):
    empresa_id = None if es_admin else usuario_autenticado.get("empresa_id")
    usuario = await repositories["usuarios"].obtener_por_id(id, empresa_id)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    perfil = await repositories["perfiles"].obtener_por_usuario_id(id)
    if not perfil:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de usuario no encontrado",
        )

    return RespuestaAPIDTO(
        exito=True,
        datos=PerfilUsuarioRespuestaDTO.model_validate(perfil).model_dump(),
        mensaje="Perfil recuperado exitosamente",
    ).dict()


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
    repositories: dict = Depends(obtener_repositories),
):
    """
    Actualiza los datos personales del usuario.
    Si el perfil no existe, lo crea.
    """
    try:
        empresa_id = None if es_admin else usuario_autenticado.get("empresa_id")
        usuario = await repositories["usuarios"].obtener_por_id(id, empresa_id)
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado",
            )

        datos = perfil_dto.model_dump(exclude_unset=True)

        rut = datos.get("rut")
        if rut:
            perfil_con_rut = await repositories["perfiles"].obtener_por_rut(rut)
            if perfil_con_rut and perfil_con_rut.usuario_id != id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El RUT {rut} ya está registrado en otro perfil",
                )

        perfil = await repositories["perfiles"].obtener_por_usuario_id(id)
        if perfil:
            perfil = await repositories["perfiles"].actualizar(id, **datos)
            mensaje = "Perfil actualizado exitosamente"
        else:
            perfil = await repositories["perfiles"].crear(usuario_id=id, **datos)
            mensaje = "Perfil creado exitosamente"

        return RespuestaAPIDTO(
            exito=True,
            datos=PerfilUsuarioRespuestaDTO.model_validate(perfil).model_dump(),
            mensaje=mensaje,
        ).dict()
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
