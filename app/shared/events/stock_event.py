"""Contrato de eventos de stock entre monolito y notification-service (v1)."""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass(frozen=True)
class StockEventV1:
    """Mensaje publicado en Redis (`wms:stock-events`)."""

    event_type: str
    empresa_id: int
    payload: dict[str, Any]
    version: str = "1"
    usuario_id: int | None = None
    email_to: list[str] | None = None

    def to_json(self) -> str:
        data = asdict(self)
        if data["email_to"] is None:
            del data["email_to"]
        if data["usuario_id"] is None:
            del data["usuario_id"]
        return json.dumps(data, default=str)

    @classmethod
    def from_json(cls, raw: str | bytes) -> StockEventV1:
        if isinstance(raw, bytes):
            raw = raw.decode("utf-8")
        data = json.loads(raw)
        email = data.get("email_to")
        if email is not None and not isinstance(email, list):
            email = [email]
        return cls(
            version=data.get("version", "1"),
            event_type=data["event_type"],
            empresa_id=int(data["empresa_id"]),
            payload=data.get("payload") or {},
            usuario_id=data.get("usuario_id"),
            email_to=email,
        )
