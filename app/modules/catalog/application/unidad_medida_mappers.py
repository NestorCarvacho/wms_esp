"""Mapeo unidad medida dominio → DTO."""
from __future__ import annotations

from app.modules.catalog.domain.entities import UnidadMedida


def serializar_unidad_medida_lista(u: UnidadMedida) -> dict:
    return {
        "id": u.id,
        "empresa_id": u.empresa_id,
        "empresa_nombre": u.empresa_nombre,
        "nombre": u.nombre,
        "codigo": u.codigo,
        "activo": u.activo,
    }


def serializar_unidad_medida_detalle(u: UnidadMedida) -> dict:
    return {
        "id": u.id,
        "empresa_id": u.empresa_id,
        "nombre": u.nombre,
        "codigo": u.codigo,
        "activo": u.activo,
    }
