"""Preferencias regionales efectivas del usuario."""
from __future__ import annotations

from typing import Any


def resolver_preferencias_locale(usuario: Any) -> dict[str, str]:
    empresa = usuario.empresa
    perfil = usuario.perfil
    locale = (
        perfil.locale_override
        if perfil and perfil.locale_override
        else getattr(empresa, "locale", None) or "es-CL"
    )
    timezone = (
        perfil.timezone_override
        if perfil and perfil.timezone_override
        else getattr(empresa, "timezone", None) or "America/Santiago"
    )
    currency = getattr(empresa, "moneda_codigo", None) or "CLP"
    return {
        "locale": locale,
        "timezone": timezone,
        "currency": currency,
    }
