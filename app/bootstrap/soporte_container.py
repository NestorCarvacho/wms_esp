"""Composition root del módulo soporte."""
from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.soporte.application.handlers.ticket_handlers import (
    CambiarEstadoTicketHandler,
    CrearTicketHandler,
    ListarTicketsQueryHandler,
    ListarTiposSolicitudQueryHandler,
    ObtenerTicketQueryHandler,
    ResponderTicketHandler,
    TomarTicketHandler,
)
from app.modules.soporte.infrastructure.ticket_repository import SqlAlchemyTicketRepository


@dataclass
class SoporteHandlers:
    listar_tipos: ListarTiposSolicitudQueryHandler
    crear_ticket: CrearTicketHandler
    listar_tickets: ListarTicketsQueryHandler
    obtener_ticket: ObtenerTicketQueryHandler
    responder_ticket: ResponderTicketHandler
    cambiar_estado: CambiarEstadoTicketHandler
    tomar_ticket: TomarTicketHandler


def build_soporte_handlers(session: AsyncSession) -> SoporteHandlers:
    repo = SqlAlchemyTicketRepository(session)
    return SoporteHandlers(
        listar_tipos=ListarTiposSolicitudQueryHandler(repo),
        crear_ticket=CrearTicketHandler(repo),
        listar_tickets=ListarTicketsQueryHandler(repo),
        obtener_ticket=ObtenerTicketQueryHandler(repo),
        responder_ticket=ResponderTicketHandler(repo),
        cambiar_estado=CambiarEstadoTicketHandler(repo),
        tomar_ticket=TomarTicketHandler(repo),
    )
