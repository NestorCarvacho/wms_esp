"""Rate limiting en memoria (una instancia). En producción multi-nodo use Redis o el WAF."""
from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta
from threading import Lock

from fastapi import HTTPException, Request, status

_buckets: dict[str, list[datetime]] = defaultdict(list)
_lock = Lock()


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


def enforce_rate_limit(
    request: Request,
    *,
    scope: str,
    max_requests: int,
    window_minutes: int,
) -> None:
    """Sliding window por IP. Lanza 429 si se supera el límite."""
    if max_requests <= 0:
        return

    key = f"{scope}:{_client_ip(request)}"
    now = datetime.utcnow()
    cutoff = now - timedelta(minutes=window_minutes)

    with _lock:
        timestamps = [ts for ts in _buckets[key] if ts > cutoff]
        if len(timestamps) >= max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Demasiadas solicitudes. Intente más tarde.",
            )
        timestamps.append(now)
        _buckets[key] = timestamps
