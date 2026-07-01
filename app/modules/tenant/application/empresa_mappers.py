"""Mapeo empresa ORM → DTO."""
from __future__ import annotations

from typing import Any


def serializar_empresa(e: Any) -> dict:
    return {
        "id": e.id,
        "codigo": e.codigo,
        "razon_social": e.razon_social,
        "nombre_fantasia": e.nombre_fantasia,
        "rut": e.rut,
        "giro": e.giro,
        "telefono": e.telefono,
        "correo": e.correo,
        "sitio_web": e.sitio_web,
        "esta_activa": e.esta_activa,
        "es_empresa_maestra": bool(getattr(e, "es_empresa_maestra", False)),
        "creado_at": e.creado_at,
        "direccion": e.direccion,
        "region_id": e.region_id,
        "ciudad_id": e.ciudad_id,
        "comuna_id": e.comuna_id,
        "locale": getattr(e, "locale", "es-CL") or "es-CL",
        "timezone": getattr(e, "timezone", "America/Santiago") or "America/Santiago",
        "moneda_codigo": getattr(e, "moneda_codigo", "CLP") or "CLP",
    }
