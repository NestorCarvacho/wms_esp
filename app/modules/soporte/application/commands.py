"""Comandos del módulo de soporte."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ActorTicket:
    usuario_id: int
    empresa_id: int
    es_empresa_maestra: bool
    puede_gestionar: bool
    empresas_scope_ids: list[int] | None = None
    empresa_id_filtro: int | None = None


@dataclass(frozen=True)
class CrearTicketCommand:
    actor: ActorTicket
    tipo_solicitud_id: int
    mensaje: str
    asunto: str | None = None


@dataclass(frozen=True)
class ResponderTicketCommand:
    actor: ActorTicket
    ticket_id: int
    mensaje: str


@dataclass(frozen=True)
class CambiarEstadoTicketCommand:
    actor: ActorTicket
    ticket_id: int
    estado_codigo: str
