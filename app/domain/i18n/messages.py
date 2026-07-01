"""Traducciones de mensajes del backend para eventos y notificaciones."""
from __future__ import annotations

MESSAGES: dict[str, dict[str, str]] = {
    "stock.critical": {
        "es-CL": "Stock crítico",
        "es-MX": "Stock crítico",
        "en-US": "Critical stock alert",
        "pt-BR": "Estoque crítico",
    },
    "stock.movement.recepcion": {
        "es-CL": "Recepción registrada: {producto} (+{cantidad} u.)",
        "es-MX": "Recepción registrada: {producto} (+{cantidad} u.)",
        "en-US": "Receipt recorded: {producto} (+{cantidad} units)",
        "pt-BR": "Recepção registrada: {producto} (+{cantidad} un.)",
    },
    "stock.movement.traslado": {
        "es-CL": "Traslado: {producto} ({cantidad} u.)",
        "es-MX": "Traslado: {producto} ({cantidad} u.)",
        "en-US": "Transfer: {producto} ({cantidad} units)",
        "pt-BR": "Transferência: {producto} ({cantidad} un.)",
    },
    "stock.movement.despacho": {
        "es-CL": "Despacho: {producto} (-{cantidad} u.)",
        "es-MX": "Despacho: {producto} (-{cantidad} u.)",
        "en-US": "Dispatch: {producto} (-{cantidad} units)",
        "pt-BR": "Expedição: {producto} (-{cantidad} un.)",
    },
}

_LOCALE_FALLBACK = ("es-CL", "es-MX", "en-US", "pt-BR")


def translate(key: str, locale: str, **params) -> str:
    bucket = MESSAGES.get(key, {})
    text = bucket.get(locale)
    if text is None:
        prefix = locale.split("-")[0]
        for candidate in _LOCALE_FALLBACK:
            if candidate.startswith(prefix) and candidate in bucket:
                text = bucket[candidate]
                break
    if text is None:
        text = bucket.get("es-CL", key)
    try:
        return text.format(**params)
    except KeyError:
        return text
