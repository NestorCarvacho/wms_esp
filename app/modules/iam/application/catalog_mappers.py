"""Mapeo catálogo RBAC a DTOs."""
from __future__ import annotations

from typing import Any

from app.shared.formatting import format_empresa_nombre
from app.shared.orm_state import relacion_cargada


def serializar_rol_lista(r: Any) -> dict:
    return {
        "id": r.id,
        "nombre": r.nombre,
        "descripcion": r.descripcion,
        "activo": r.activo,
        "empresa_id": r.empresa_id,
        "empresa_nombre": format_empresa_nombre(relacion_cargada(r, "empresa")),
    }


def serializar_rol_detalle(rol: Any) -> dict:
    return {
        "id": rol.id,
        "empresa_id": rol.empresa_id,
        "nombre": rol.nombre,
        "descripcion": rol.descripcion,
        "activo": rol.activo,
    }


def serializar_permiso_lista(p: Any) -> dict:
    return {
        "id": p.id,
        "empresa_id": p.empresa_id,
        "empresa_nombre": format_empresa_nombre(relacion_cargada(p, "empresa")),
        "codigo": p.codigo,
        "descripcion": p.descripcion,
        "activo": p.activo,
    }


def serializar_cargo_lista(c: Any) -> dict:
    return {
        "id": c.id,
        "nombre": c.nombre,
        "empresa_id": c.empresa_id,
        "empresa_nombre": format_empresa_nombre(relacion_cargada(c, "empresa")),
    }
