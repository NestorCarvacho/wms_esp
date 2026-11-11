"""Mapeo zona bodega ORM → DTO."""
from __future__ import annotations

from typing import Any

from app.shared.formatting import format_empresa_nombre
from app.shared.orm_state import relacion_cargada


def serializar_zona_bodega(z: Any) -> dict:
    bodega = relacion_cargada(z, "bodega")
    tipo = relacion_cargada(z, "tipo_zona")
    return {
        "id": z.id,
        "bodega_id": z.bodega_id,
        "bodega_nombre": bodega.nombre if bodega else None,
        "tipo_zona_id": z.tipo_zona_id,
        "tipo_zona_nombre": tipo.nombre if tipo else None,
        "nombre": z.nombre,
        "activo": z.activo,
        "empresa_id": bodega.empresa_id if bodega else None,
        "empresa_nombre": format_empresa_nombre(relacion_cargada(bodega, "empresa")) if bodega else None,
    }
