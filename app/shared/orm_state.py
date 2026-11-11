"""Lectura de relaciones ORM sin disparar lazy load en sesión async."""
from __future__ import annotations

from typing import Any

from sqlalchemy.orm import attributes
from sqlalchemy.orm.exc import UnmappedInstanceError


def relacion_cargada(parent: Any, nombre: str) -> Any | None:
    """Devuelve la relación solo si ya está en memoria.

    En AsyncSession, acceder a una relación no cargada emite un SELECT perezoso
    y SQLAlchemy lanza MissingGreenlet. Los listados que necesitan el dato deben
    usar selectinload; este helper evita la consulta implícita en el resto de casos.
    """
    if parent is None:
        return None
    try:
        state = attributes.instance_state(parent)
    except UnmappedInstanceError:
        return getattr(parent, nombre, None)
    if nombre in state.unloaded or nombre in state.expired_attributes:
        return None
    return getattr(parent, nombre, None)
