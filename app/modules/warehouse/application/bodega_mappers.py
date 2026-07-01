"""Mapeo bodega ORM → DTO."""
from __future__ import annotations

from typing import Any

from app.domain.services.display_helpers import format_empresa_nombre


def serializar_bodega_lista(b: Any) -> dict:
    return {
        "id": b.id,
        "nombre": b.nombre,
        "empresa_id": b.empresa_id,
        "empresa_nombre": format_empresa_nombre(b.empresa),
        "codigo": b.codigo,
        "activo": b.activo,
    }


def serializar_bodega_detalle(b: Any) -> dict:
    return {
        "id": b.id,
        "empresa_id": b.empresa_id,
        "nombre": b.nombre,
        "codigo": b.codigo,
        "activo": b.activo,
    }
