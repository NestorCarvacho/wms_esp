"""Endpoints REST de bandeja de notificaciones."""
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.v1.dependencies import obtener_usuario_autenticado
from app.bootstrap.notification_container import NotificationHandlers
from app.modules.notifications.presentation.http.dependencies import obtener_notification_handlers
from app.schemas.notificacion import RespuestaAPIDTO

router = APIRouter(prefix="/api/v1/notificaciones", tags=["Notificaciones"])


@router.get("", response_model=RespuestaAPIDTO, status_code=status.HTTP_200_OK)
async def listar_notificaciones(
    pagina: int = 1,
    por_pagina: int = 20,
    leida: bool | None = None,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    handlers: NotificationHandlers = Depends(obtener_notification_handlers),
):
    try:
        resultado = await handlers.listar_notificaciones.handle(
            usuario_autenticado["usuario_id"],
            pagina=pagina,
            por_pagina=por_pagina,
            leida=leida,
        )
        return RespuestaAPIDTO(
            exito=True,
            datos=resultado,
            mensaje=f"{resultado['total']} notificación(es)",
        ).model_dump()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/no-leidas/count", response_model=RespuestaAPIDTO, status_code=status.HTTP_200_OK)
async def contar_no_leidas(
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    handlers: NotificationHandlers = Depends(obtener_notification_handlers),
):
    try:
        resultado = await handlers.contar_no_leidas.handle(usuario_autenticado["usuario_id"])
        return RespuestaAPIDTO(exito=True, datos=resultado, mensaje="Conteo actualizado").model_dump()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.patch("/{id}/leer", response_model=RespuestaAPIDTO, status_code=status.HTTP_200_OK)
async def marcar_leida(
    id: int,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    handlers: NotificationHandlers = Depends(obtener_notification_handlers),
):
    try:
        resultado = await handlers.marcar_leida.handle(id, usuario_autenticado["usuario_id"])
        return RespuestaAPIDTO(exito=True, datos=resultado, mensaje=resultado["mensaje"]).model_dump()
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.patch("/leer-todas", response_model=RespuestaAPIDTO, status_code=status.HTTP_200_OK)
async def marcar_todas_leidas(
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    handlers: NotificationHandlers = Depends(obtener_notification_handlers),
):
    try:
        resultado = await handlers.marcar_todas_leidas.handle(usuario_autenticado["usuario_id"])
        return RespuestaAPIDTO(exito=True, datos=resultado, mensaje=resultado["mensaje"]).model_dump()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
