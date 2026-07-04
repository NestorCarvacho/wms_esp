"""Mappers perfil usuario."""
from __future__ import annotations

from typing import Any


def serializar_perfil(perfil: Any) -> dict[str, Any]:
    from app.schemas.usuario import PerfilUsuarioRespuestaDTO

    return PerfilUsuarioRespuestaDTO.model_validate(perfil).model_dump()
