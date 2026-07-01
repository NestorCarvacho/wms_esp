"""Mapeo zona bodega ORM → DTO."""
from __future__ import annotations

from typing import Any

from app.domain.services.display_helpers import format_empresa_nombre


def serializar_zona_bodega(z: Any) -> dict:
    bodega = z.bodega
    tipo = z.tipo_zona
    return {
        "id": z.id,
        "bodega_id": z.bodega_id,
        "bodega_nombre": bodega.nombre if bodega else None,
        "tipo_zona_id": z.tipo_zona_id,
        "tipo_zona_nombre": tipo.nombre if tipo else None,
        "nombre": z.nombre,
        "activo": z.activo,
        "empresa_id": bodega.empresa_id if bodega else None,
        "empresa_nombre": format_empresa_nombre(bodega.empresa) if bodega else None,
    }
