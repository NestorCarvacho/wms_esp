"""Reglas de visibilidad de tickets (hijo vs mesa de ayuda)."""
from __future__ import annotations


def es_mesa_de_ayuda(es_empresa_maestra: bool, puede_gestionar: bool) -> bool:
    return bool(es_empresa_maestra and puede_gestionar)


def puede_ver_ticket(
    *,
    ticket_usuario_id: int,
    ticket_empresa_id: int,
    usuario_id: int,
    empresa_id: int,
    es_empresa_maestra: bool,
    puede_gestionar: bool,
    empresas_scope_ids: list[int] | None,
) -> bool:
    if es_mesa_de_ayuda(es_empresa_maestra, puede_gestionar):
        if empresas_scope_ids:
            return ticket_empresa_id in empresas_scope_ids or ticket_empresa_id == empresa_id
        return ticket_empresa_id == empresa_id
    return ticket_usuario_id == usuario_id and ticket_empresa_id == empresa_id
