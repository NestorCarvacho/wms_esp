"""WebSocket de eventos de inventario con resolución de idioma por cliente."""
from __future__ import annotations

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query

from app.core.request_context import parse_accept_language, normalize_timezone
from app.core.security import decode_access_token
from app.infrastructure.ws.inventario_event_bus import inventario_event_bus

router = APIRouter(prefix="/api/v1/ws", tags=["WebSocket"])


@router.websocket("/inventario")
async def ws_inventario(
    websocket: WebSocket,
    token: str = Query(..., description="JWT access token"),
    locale: str | None = Query(None, description="Override de locale del cliente"),
    timezone: str | None = Query(None, alias="tz", description="Override de timezone IANA"),
):
    payload = decode_access_token(token)
    if not payload:
        await websocket.close(code=4401)
        return

    empresa_id = payload.get("empresa_id")
    if not empresa_id:
        await websocket.close(code=4403)
        return

    client_locale = locale or parse_accept_language(websocket.headers.get("accept-language"))
    client_tz = normalize_timezone(timezone or websocket.headers.get("x-time-zone"))

    await inventario_event_bus.connect(
        websocket=websocket,
        empresa_id=int(empresa_id),
        locale=client_locale,
        timezone=client_tz,
    )

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        await inventario_event_bus.disconnect(websocket, int(empresa_id))
