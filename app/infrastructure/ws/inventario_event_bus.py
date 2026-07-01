"""Bus de eventos de inventario con broadcast WebSocket por locale de cliente."""
from __future__ import annotations

import asyncio
import json
from dataclasses import dataclass, field
from typing import Any

from fastapi import WebSocket

from app.domain.i18n.messages import translate


@dataclass
class InventarioClient:
    websocket: WebSocket
    empresa_id: int
    locale: str
    timezone: str


@dataclass
class InventarioEventBus:
    """Gestiona conexiones WS y emite eventos traducidos por cliente."""

    _clients: dict[int, list[InventarioClient]] = field(default_factory=dict)
    _lock: asyncio.Lock = field(default_factory=asyncio.Lock)

    async def connect(
        self,
        websocket: WebSocket,
        empresa_id: int,
        locale: str,
        timezone: str,
    ) -> None:
        await websocket.accept()
        client = InventarioClient(
            websocket=websocket,
            empresa_id=empresa_id,
            locale=locale,
            timezone=timezone,
        )
        async with self._lock:
            self._clients.setdefault(empresa_id, []).append(client)

    async def disconnect(self, websocket: WebSocket, empresa_id: int) -> None:
        async with self._lock:
            pool = self._clients.get(empresa_id, [])
            self._clients[empresa_id] = [c for c in pool if c.websocket is not websocket]
            if not self._clients[empresa_id]:
                del self._clients[empresa_id]

    async def broadcast_stock_event(
        self,
        empresa_id: int,
        event_type: str,
        payload: dict[str, Any],
    ) -> None:
        async with self._lock:
            clients = list(self._clients.get(empresa_id, []))

        message_key = f"stock.movement.{event_type.lower()}"
        if event_type == "STOCK_CRITICO":
            message_key = "stock.critical"

        dead: list[tuple[WebSocket, int]] = []
        for client in clients:
            localized = {
                **payload,
                "event_type": event_type,
                "mensaje": translate(
                    message_key,
                    client.locale,
                    producto=payload.get("producto_nombre", ""),
                    cantidad=payload.get("cantidad", ""),
                ),
                "locale": client.locale,
                "timezone": client.timezone,
            }
            try:
                await client.websocket.send_text(json.dumps(localized, default=str))
            except Exception:
                dead.append((client.websocket, client.empresa_id))

        for ws, eid in dead:
            await self.disconnect(ws, eid)


inventario_event_bus = InventarioEventBus()
