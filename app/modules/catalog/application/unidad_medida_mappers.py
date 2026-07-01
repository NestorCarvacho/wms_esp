"""Mapeo unidad medida ORM → DTO."""
from __future__ import annotations

from typing import Any

from app.domain.services.display_helpers import format_empresa_nombre


def serializar_unidad_medida_lista(u: Any) -> dict:
    return {
        "id": u.id,
        "empresa_id": u.empresa_id,
        "empresa_nombre": format_empresa_nombre(u.empresa),
        "nombre": u.nombre,
        "codigo": u.codigo,
        "activo": u.activo,
    }


def serializar_unidad_medida_detalle(u: Any) -> dict:
    return {
        "id": u.id,
        "empresa_id": u.empresa_id,
        "nombre": u.nombre,
        "codigo": u.codigo,
        "activo": u.activo,
    }
