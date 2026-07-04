"""Preferencias regionales efectivas del usuario."""
from __future__ import annotations

from app.modules.iam.domain.entities import UsuarioAuth


def resolver_preferencias_locale(usuario: UsuarioAuth) -> dict[str, str]:
    locale = usuario.perfil_locale_override or usuario.empresa_locale or "es-CL"
    timezone = usuario.perfil_timezone_override or usuario.empresa_timezone or "America/Santiago"
    return {
        "locale": locale,
        "timezone": timezone,
        "currency": usuario.empresa_moneda or "CLP",
    }
