"""Mappers geo → DTO."""
from __future__ import annotations

from app.modules.geo.domain.entities import Ciudad, Comuna, Region


def region_a_dict(r: Region) -> dict:
    return {"id": r.id, "nombre": r.nombre, "codigo": r.codigo}


def ciudad_a_dict(c: Ciudad) -> dict:
    return {"id": c.id, "region_id": c.region_id, "nombre": c.nombre}


def comuna_a_dict(c: Comuna) -> dict:
    return {"id": c.id, "region_id": c.region_id, "ciudad_id": c.ciudad_id, "nombre": c.nombre}
