"""Construcción de respuesta de sesión (login)."""
from __future__ import annotations

from typing import Any

from app.domain.services.display_helpers import format_empresa_nombre
from app.modules.iam.domain.services.locale_preferences import resolver_preferencias_locale
from app.schemas.usuario import UsuarioRespuestaDTO


def construir_respuesta_sesion(
    usuario: Any,
    permisos: list[str],
    roles: list[str],
    access_token: str,
) -> dict[str, Any]:
    es_empresa_maestra = bool(getattr(usuario.empresa, "es_empresa_maestra", False))
    usuario_dto = UsuarioRespuestaDTO.model_validate(usuario)
    usuario_data = usuario_dto.model_dump()
    usuario_data["empresa_nombre"] = format_empresa_nombre(usuario.empresa)
    usuario_data["cargo_nombre"] = usuario.cargo.nombre if usuario.cargo else None
    usuario_data["es_empresa_maestra"] = es_empresa_maestra
    usuario_data["roles"] = roles
    usuario_data["permisos"] = permisos
    usuario_data["preferencias_locale"] = resolver_preferencias_locale(usuario)
    return {
        "acceso_token": access_token,
        "token_type": "bearer",
        "usuario": usuario_data,
    }
