"""Endpoints del centro de ayuda."""
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.v1.dependencies import obtener_usuario_autenticado, requiere_permiso
from app.api.v1.empresa_contexto import ContextoEmpresa, contexto_requiere_permiso
from app.api.v1.listado_query import orden_listado
from app.bootstrap.soporte_container import SoporteHandlers
from app.modules.soporte.application.commands import (
    ActorTicket,
    CambiarEstadoTicketCommand,
    CrearTicketCommand,
    ResponderTicketCommand,
)
from app.modules.soporte.presentation.http.dependencies import obtener_soporte_handlers
from app.schemas.ticket import RespuestaAPIDTO, TicketCrearDTO, TicketEstadoDTO, TicketMensajeDTO

router = APIRouter(prefix="/api/v1/tickets", tags=["Soporte"])


def _actor(ctx: ContextoEmpresa, usuario: dict, puede_gestionar: bool | None = None) -> ActorTicket:
    permisos = usuario.get("permisos") or []
    gestiona = "tickets.gestionar" in permisos if puede_gestionar is None else puede_gestionar
    return ActorTicket(
        usuario_id=int(usuario["usuario_id"]),
        empresa_id=int(ctx.empresa_usuario_id),
        es_empresa_maestra=bool(ctx.es_empresa_maestra),
        puede_gestionar=gestiona,
        empresas_scope_ids=ctx.empresas_scope_ids(),
        empresa_id_filtro=ctx.empresa_id_filtro,
    )


def _error_caso_uso(exc: Exception) -> HTTPException:
    if isinstance(exc, PermissionError):
        return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))
    if isinstance(exc, ValueError):
        detalle = str(exc)
        codigo = status.HTTP_404_NOT_FOUND if "no encontrado" in detalle.lower() else status.HTTP_400_BAD_REQUEST
        return HTTPException(status_code=codigo, detail=detalle)
    return HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))


@router.get("/tipos", response_model=RespuestaAPIDTO)
async def listar_tipos_solicitud(
    usuario: dict = Depends(requiere_permiso("tickets.leer", "tickets.crear", "tickets.gestionar")),
    handlers: SoporteHandlers = Depends(obtener_soporte_handlers),
):
    try:
        datos = await handlers.listar_tipos.handle()
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Tipos de solicitud").dict()
    except Exception as exc:
        raise _error_caso_uso(exc) from exc


@router.get("", response_model=RespuestaAPIDTO)
async def listar_tickets(
    pagina: int = 1,
    por_pagina: int = 10,
    buscar: str | None = None,
    es_abierto: bool | None = Query(None, description="true abiertos, false cerrados"),
    solo_propios: bool = Query(False, description="Forzar tickets del usuario autenticado"),
    orden_params: dict = Depends(orden_listado),
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("tickets.leer", "tickets.gestionar")),
    usuario: dict = Depends(obtener_usuario_autenticado),
    handlers: SoporteHandlers = Depends(obtener_soporte_handlers),
):
    try:
        datos = await handlers.listar_tickets.handle(
            actor=_actor(ctx, usuario),
            pagina=pagina,
            por_pagina=por_pagina,
            buscar=buscar,
            es_abierto=es_abierto,
            solo_propios=solo_propios,
            **orden_params,
        )
        return RespuestaAPIDTO(
            exito=True,
            datos=datos,
            mensaje=f"Se encontraron {datos['total']} tickets",
        ).dict()
    except Exception as exc:
        raise _error_caso_uso(exc) from exc


@router.post("", response_model=RespuestaAPIDTO, status_code=status.HTTP_201_CREATED)
async def crear_ticket(
    dto: TicketCrearDTO,
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("tickets.crear")),
    usuario: dict = Depends(obtener_usuario_autenticado),
    handlers: SoporteHandlers = Depends(obtener_soporte_handlers),
):
    try:
        datos = await handlers.crear_ticket.handle(
            CrearTicketCommand(
                actor=_actor(ctx, usuario, puede_gestionar=False),
                tipo_solicitud_id=dto.tipo_solicitud_id,
                mensaje=dto.mensaje,
                asunto=dto.asunto,
            )
        )
        return RespuestaAPIDTO(
            exito=True,
            datos=datos,
            mensaje="Su solicitud está siendo procesada y asignada.",
        ).dict()
    except Exception as exc:
        raise _error_caso_uso(exc) from exc


@router.get("/{ticket_id}", response_model=RespuestaAPIDTO)
async def obtener_ticket(
    ticket_id: int,
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("tickets.leer", "tickets.gestionar")),
    usuario: dict = Depends(obtener_usuario_autenticado),
    handlers: SoporteHandlers = Depends(obtener_soporte_handlers),
):
    try:
        datos = await handlers.obtener_ticket.handle(ticket_id, _actor(ctx, usuario))
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Ticket recuperado").dict()
    except Exception as exc:
        raise _error_caso_uso(exc) from exc


@router.post("/{ticket_id}/mensajes", response_model=RespuestaAPIDTO)
async def responder_ticket(
    ticket_id: int,
    dto: TicketMensajeDTO,
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("tickets.responder", "tickets.gestionar")),
    usuario: dict = Depends(obtener_usuario_autenticado),
    handlers: SoporteHandlers = Depends(obtener_soporte_handlers),
):
    try:
        datos = await handlers.responder_ticket.handle(
            ResponderTicketCommand(
                actor=_actor(ctx, usuario),
                ticket_id=ticket_id,
                mensaje=dto.mensaje,
            )
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Mensaje enviado").dict()
    except Exception as exc:
        raise _error_caso_uso(exc) from exc


@router.patch("/{ticket_id}/estado", response_model=RespuestaAPIDTO)
async def cambiar_estado_ticket(
    ticket_id: int,
    dto: TicketEstadoDTO,
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("tickets.gestionar")),
    usuario: dict = Depends(obtener_usuario_autenticado),
    handlers: SoporteHandlers = Depends(obtener_soporte_handlers),
):
    try:
        datos = await handlers.cambiar_estado.handle(
            CambiarEstadoTicketCommand(
                actor=_actor(ctx, usuario, puede_gestionar=True),
                ticket_id=ticket_id,
                estado_codigo=dto.estado_codigo,
            )
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Estado actualizado").dict()
    except Exception as exc:
        raise _error_caso_uso(exc) from exc


@router.post("/{ticket_id}/tomar", response_model=RespuestaAPIDTO)
async def tomar_ticket(
    ticket_id: int,
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("tickets.gestionar")),
    usuario: dict = Depends(obtener_usuario_autenticado),
    handlers: SoporteHandlers = Depends(obtener_soporte_handlers),
):
    try:
        datos = await handlers.tomar_ticket.handle(ticket_id, _actor(ctx, usuario, puede_gestionar=True))
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Ticket asignado").dict()
    except Exception as exc:
        raise _error_caso_uso(exc) from exc
