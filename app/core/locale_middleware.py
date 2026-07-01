"""Middleware global: captura Accept-Language y X-Time-Zone en contextvars."""
from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.request_context import (
    RequestLocaleContext,
    parse_accept_language,
    normalize_timezone,
    reset_request_locale,
    set_request_locale,
    DEFAULT_CURRENCY,
)


class LocaleMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        locale = parse_accept_language(request.headers.get("accept-language"))
        timezone = normalize_timezone(request.headers.get("x-time-zone"))
        currency = request.headers.get("x-currency") or DEFAULT_CURRENCY

        token = set_request_locale(
            RequestLocaleContext(locale=locale, timezone=timezone, currency=currency.upper()[:3])
        )
        try:
            response = await call_next(request)
            response.headers["Content-Language"] = locale
            return response
        finally:
            reset_request_locale(token)
