"""Casos de uso del centro de ayuda."""
from __future__ import annotations

from typing import Any

from app.modules.soporte.application.commands import (
    ActorTicket,
    CambiarEstadoTicketCommand,
    CrearTicketCommand,
    ResponderTicketCommand,
)
from app.modules.soporte.domain.acceso import es_mesa_de_ayuda, puede_ver_ticket
from app.modules.soporte.domain.ports import ITicketRepository

MENSAJE_PROCESADA = "Su solicitud está siendo procesada y asignada."
CODIGO_EN_PROCESO = "en_proceso"
CODIGO_CERRADO = "cerrado"


def _exigir_mesa(actor: ActorTicket) -> None:
    if not es_mesa_de_ayuda(actor.es_empresa_maestra, actor.puede_gestionar):
        raise PermissionError("Solo la mesa de ayuda de la empresa maestra puede realizar esta acción")


def _asunto(asunto: str | None, mensaje: str) -> str:
    texto = (asunto or "").strip() or mensaje.strip().splitlines()[0]
    texto = " ".join(texto.split())
    if len(texto) > 160:
        return texto[:157] + "..."
    return texto


class ListarTiposSolicitudQueryHandler:
    def __init__(self, repo: ITicketRepository):
        self.repo = repo

    async def handle(self) -> dict:
        tipos = await self.repo.listar_tipos()
        return {"tipos": tipos}


class CrearTicketHandler:
    def __init__(self, repo: ITicketRepository):
        self.repo = repo

    async def handle(self, command: CrearTicketCommand) -> dict:
        mensaje = command.mensaje.strip()
        if not mensaje:
            raise ValueError("Debe describir el problema")

        tipo = await self.repo.obtener_tipo_activo(command.tipo_solicitud_id)
        if not tipo:
            raise ValueError("El tipo de solicitud no es válido")
        if await self.repo.tipo_tiene_hijos_activos(command.tipo_solicitud_id):
            raise ValueError("Debe elegir un subtipo de solicitud")

        estado = await self.repo.obtener_estado_por_codigo(CODIGO_EN_PROCESO)
        if not estado:
            raise ValueError("No está configurado el estado inicial del ticket")

        solicitante = await self.repo.datos_solicitante(command.actor.usuario_id)
        if not solicitante or solicitante["empresa_id"] != command.actor.empresa_id:
            raise ValueError("No se pudo resolver el usuario solicitante")

        ticket_id = await self.repo.crear(
            empresa_id=command.actor.empresa_id,
            usuario_id=command.actor.usuario_id,
            tipo_solicitud_id=tipo["id"],
            estado_ticket_id=estado["id"],
            asunto=_asunto(command.asunto, mensaje),
            nombre_solicitante=solicitante["nombre_solicitante"],
            nombre_empresa=solicitante["nombre_empresa"],
            mensaje=mensaje,
            mensaje_sistema=MENSAJE_PROCESADA,
        )
        detalle = await self.repo.obtener(ticket_id)
        if not detalle:
            raise ValueError("No se pudo crear el ticket")
        return _con_autor(detalle, command.actor.usuario_id)


class ListarTicketsQueryHandler:
    def __init__(self, repo: ITicketRepository):
        self.repo = repo

    async def handle(
        self,
        actor: ActorTicket,
        pagina: int = 1,
        por_pagina: int = 10,
        buscar: str | None = None,
        es_abierto: bool | None = None,
        ordenar_por: str | None = None,
        orden: str | None = None,
        solo_propios: bool = False,
    ) -> dict:
        mesa = es_mesa_de_ayuda(actor.es_empresa_maestra, actor.puede_gestionar) and not solo_propios
        tickets, total = await self.repo.listar(
            empresa_id=actor.empresa_id,
            usuario_id=actor.usuario_id,
            es_mesa=mesa,
            empresa_id_filtro=actor.empresa_id_filtro,
            empresas_scope_ids=actor.empresas_scope_ids,
            pagina=pagina,
            por_pagina=por_pagina,
            buscar=buscar,
            es_abierto=es_abierto,
            ordenar_por=ordenar_por,
            orden=orden,
        )
        return {
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "tickets": tickets,
        }


class ObtenerTicketQueryHandler:
    def __init__(self, repo: ITicketRepository):
        self.repo = repo

    async def handle(self, ticket_id: int, actor: ActorTicket) -> dict:
        ticket = await self.repo.obtener(ticket_id)
        if not ticket or not _visible(ticket, actor):
            raise ValueError("Ticket no encontrado")
        return _con_autor(ticket, actor.usuario_id)


class ResponderTicketHandler:
    def __init__(self, repo: ITicketRepository):
        self.repo = repo

    async def handle(self, command: ResponderTicketCommand) -> dict:
        mensaje = command.mensaje.strip()
        if not mensaje:
            raise ValueError("El mensaje no puede estar vacío")

        ticket = await self.repo.obtener(command.ticket_id)
        if not ticket or not _visible(ticket, command.actor):
            raise ValueError("Ticket no encontrado")
        if not ticket["es_abierto"]:
            raise ValueError("El ticket está cerrado y no admite nuevos mensajes")

        await self.repo.agregar_mensaje(
            command.ticket_id,
            mensaje,
            usuario_id=command.actor.usuario_id,
            es_sistema=False,
        )
        detalle = await self.repo.obtener(command.ticket_id)
        return _con_autor(detalle, command.actor.usuario_id)


class CambiarEstadoTicketHandler:
    def __init__(self, repo: ITicketRepository):
        self.repo = repo

    async def handle(self, command: CambiarEstadoTicketCommand) -> dict:
        _exigir_mesa(command.actor)
        codigo = command.estado_codigo.strip().lower()
        if codigo not in (CODIGO_EN_PROCESO, CODIGO_CERRADO):
            raise ValueError("Estado de ticket no válido")

        ticket = await self.repo.obtener(command.ticket_id)
        if not ticket or not _visible(ticket, command.actor):
            raise ValueError("Ticket no encontrado")

        estado = await self.repo.obtener_estado_por_codigo(codigo)
        if not estado:
            raise ValueError("Estado de ticket no configurado")

        if ticket["estado_codigo"] != codigo:
            await self.repo.cambiar_estado(
                command.ticket_id,
                estado["id"],
                cerrado=codigo == CODIGO_CERRADO,
            )
            await self.repo.agregar_mensaje(
                command.ticket_id,
                f"El estado del ticket cambió a {estado['nombre']}.",
                usuario_id=None,
                es_sistema=True,
            )

        detalle = await self.repo.obtener(command.ticket_id)
        return _con_autor(detalle, command.actor.usuario_id)


class TomarTicketHandler:
    def __init__(self, repo: ITicketRepository):
        self.repo = repo

    async def handle(self, ticket_id: int, actor: ActorTicket) -> dict:
        _exigir_mesa(actor)
        ticket = await self.repo.obtener(ticket_id)
        if not ticket or not _visible(ticket, actor):
            raise ValueError("Ticket no encontrado")
        if ticket["asignado_usuario_id"] != actor.usuario_id:
            await self.repo.tomar(ticket_id, actor.usuario_id)
            await self.repo.agregar_mensaje(
                ticket_id,
                "El ticket fue tomado por mesa de ayuda.",
                usuario_id=None,
                es_sistema=True,
            )
        detalle = await self.repo.obtener(ticket_id)
        return _con_autor(detalle, actor.usuario_id)


def _visible(ticket: dict[str, Any], actor: ActorTicket) -> bool:
    return puede_ver_ticket(
        ticket_usuario_id=ticket["usuario_id"],
        ticket_empresa_id=ticket["empresa_id"],
        usuario_id=actor.usuario_id,
        empresa_id=actor.empresa_id,
        es_empresa_maestra=actor.es_empresa_maestra,
        puede_gestionar=actor.puede_gestionar,
        empresas_scope_ids=actor.empresas_scope_ids,
    )


def _con_autor(ticket: dict[str, Any] | None, usuario_id: int) -> dict:
    if not ticket:
        raise ValueError("Ticket no encontrado")
    mensajes = []
    for mensaje in ticket.get("mensajes") or []:
        item = dict(mensaje)
        item["es_propio"] = item.get("usuario_id") == usuario_id and not item.get("es_sistema")
        mensajes.append(item)
    return {**ticket, "mensajes": mensajes}
