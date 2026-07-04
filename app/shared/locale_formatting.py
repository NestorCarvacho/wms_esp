"""Formateo centralizado de fechas, números y moneda según contexto del request."""
from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from app.core.request_context import DEFAULT_TIMEZONE, get_request_locale


def _zone() -> ZoneInfo:
    tz_name = get_request_locale().timezone
    try:
        return ZoneInfo(tz_name)
    except ZoneInfoNotFoundError:
        return ZoneInfo(DEFAULT_TIMEZONE)


def utc_a_local(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(_zone())


def formatear_fecha(dt: datetime | None) -> str | None:
    if dt is None:
        return None
    local = utc_a_local(dt)
    if local is None:
        return None
    return local.strftime("%d/%m/%Y %H:%M")


def formatear_numero(value: int | float | Decimal, fraction_digits: int = 2) -> str:
    num = float(value)
    locale = get_request_locale().locale
    if locale.startswith("en"):
        return f"{num:,.{fraction_digits}f}"
    return (
        f"{num:,.{fraction_digits}f}".replace(",", "X").replace(".", ",").replace("X", ".")
    )


def formatear_moneda(value: int | float | Decimal, currency: str | None = None) -> str:
    code = currency or get_request_locale().currency
    num = float(value)
    zero_dec = code in ("CLP", "JPY")
    formatted = formatear_numero(num, 0 if zero_dec else 2)
    return f"{code} {formatted}"


def serializar_timestamp(dt: datetime | None) -> dict | None:
    """Serializa un timestamp UTC con representación local para auditoría."""
    if dt is None:
        return None
    local = utc_a_local(dt)
    ctx = get_request_locale()
    utc_dt = dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt.astimezone(timezone.utc)
    return {
        "utc": utc_dt.isoformat(),
        "local": local.isoformat() if local else None,
        "local_formatted": formatear_fecha(dt),
        "timezone": ctx.timezone,
    }
