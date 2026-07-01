"""Mapeo de entidades usuario a DTOs de respuesta."""
from __future__ import annotations

from typing import Any

from app.domain.services.display_helpers import format_empresa_nombre
from app.schemas.usuario import UsuarioListaDTO, UsuarioRespuestaDTO


def serializar_usuario_lista(u: Any) -> dict:
    dto = UsuarioListaDTO.model_validate(u)
    data = dto.model_dump()
    data["empresa_nombre"] = format_empresa_nombre(u.empresa)
    data["cargo_nombre"] = u.cargo.nombre if u.cargo else None
    return data


def serializar_usuario_detalle(usuario: Any) -> dict:
    dto = UsuarioRespuestaDTO.model_validate(usuario)
    data = dto.model_dump()
    data["empresa_nombre"] = usuario.empresa.razon_social if usuario.empresa else None
    data["cargo_nombre"] = usuario.cargo.nombre if usuario.cargo else None
    return data


def serializar_usuario_creado(usuario: Any) -> dict:
    return {
        "id": usuario.id,
        "empresa_id": usuario.empresa_id,
        "email": usuario.email,
        "cargo_id": usuario.cargo_id,
        "activo": usuario.activo,
        "fecha_creacion": usuario.fecha_creacion,
    }
