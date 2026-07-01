"""Contexto de localización por request (locale, timezone, moneda)."""
from __future__ import annotations

from contextvars import ContextVar, Token
from dataclasses import dataclass


DEFAULT_LOCALE = "es-CL"
DEFAULT_TIMEZONE = "America/Santiago"
DEFAULT_CURRENCY = "CLP"


@dataclass(frozen=True)
class RequestLocaleContext:
    locale: str = DEFAULT_LOCALE
    timezone: str = DEFAULT_TIMEZONE
    currency: str = DEFAULT_CURRENCY


_request_locale: ContextVar[RequestLocaleContext] = ContextVar(
    "request_locale",
    default=RequestLocaleContext(),
)


def get_request_locale() -> RequestLocaleContext:
    return _request_locale.get()


def set_request_locale(ctx: RequestLocaleContext) -> Token:
    return _request_locale.set(ctx)


def reset_request_locale(token: Token) -> None:
    _request_locale.reset(token)


def parse_accept_language(header: str | None) -> str:
    """Extrae el locale preferido del header Accept-Language."""
    if not header:
        return DEFAULT_LOCALE
    for part in header.split(","):
        token = part.strip().split(";")[0].strip()
        if not token:
            continue
        if token == "*":
            continue
        normalized = token.replace("_", "-")
        if len(normalized) == 2:
            region_map = {"es": "es-CL", "en": "en-US", "pt": "pt-BR"}
            return region_map.get(normalized.lower(), f"{normalized.lower()}-CL")
        return normalized
    return DEFAULT_LOCALE


def normalize_timezone(tz: str | None) -> str:
    if not tz or not tz.strip():
        return DEFAULT_TIMEZONE
    return tz.strip()
