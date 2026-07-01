"""Mapeo catálogo RBAC a DTOs."""
from __future__ import annotations

from typing import Any

from app.domain.services.display_helpers import format_empresa_nombre


def serializar_rol_lista(r: Any) -> dict:
    return {
        "id": r.id,
        "nombre": r.nombre,
        "descripcion": r.descripcion,
        "activo": r.activo,
        "empresa_id": r.empresa_id,
        "empresa_nombre": format_empresa_nombre(r.empresa),
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
        "empresa_nombre": format_empresa_nombre(p.empresa),
        "codigo": p.codigo,
        "descripcion": p.descripcion,
        "activo": p.activo,
    }


def serializar_cargo_lista(c: Any) -> dict:
    return {
        "id": c.id,
        "nombre": c.nombre,
        "empresa_id": c.empresa_id,
        "empresa_nombre": format_empresa_nombre(c.empresa),
    }
