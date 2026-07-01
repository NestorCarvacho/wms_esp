"""Mapeo tipo producto ORM → DTO."""
from __future__ import annotations

from typing import Any

from app.domain.services.display_helpers import format_empresa_nombre


def serializar_tipo_producto_lista(t: Any) -> dict:
    return {
        "id": t.id,
        "nombre": t.nombre,
        "empresa_id": t.empresa_id,
        "empresa_nombre": format_empresa_nombre(t.empresa),
        "activo": t.activo,
    }


def serializar_tipo_producto_detalle(t: Any) -> dict:
    return {
        "id": t.id,
        "nombre": t.nombre,
        "empresa_id": t.empresa_id,
        "activo": t.activo,
    }
