"""Adaptador SQLAlchemy del puerto de tickets."""
from app.modules.soporte.infrastructure.ticket_crud import TicketCRUDRepository


class SqlAlchemyTicketRepository(TicketCRUDRepository):
    pass
