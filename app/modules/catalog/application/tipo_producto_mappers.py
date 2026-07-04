"""Mapeo tipo producto dominio → DTO."""
from __future__ import annotations

from app.modules.catalog.domain.entities import TipoProducto


def serializar_tipo_producto_lista(t: TipoProducto) -> dict:
    return {
        "id": t.id,
        "nombre": t.nombre,
        "empresa_id": t.empresa_id,
        "empresa_nombre": t.empresa_nombre,
        "activo": t.activo,
    }


def serializar_tipo_producto_detalle(t: TipoProducto) -> dict:
    return {
        "id": t.id,
        "nombre": t.nombre,
        "empresa_id": t.empresa_id,
        "activo": t.activo,
    }
