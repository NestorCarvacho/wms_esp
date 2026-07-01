"""Mapeo notificación ORM → DTO."""
from __future__ import annotations

from typing import Any


def serializar_notificacion(n: Any) -> dict:
    return {
        "id": n.id,
        "empresa_id": n.empresa_id,
        "tipo": n.tipo,
        "titulo": n.titulo,
        "mensaje": n.mensaje,
        "payload": n.payload_json,
        "leida": bool(n.leida),
        "creado_at": n.creado_at,
        "leida_at": n.leida_at,
    }
