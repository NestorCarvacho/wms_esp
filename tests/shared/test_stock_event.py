"""Tests StockEventV1."""
import json

from app.shared.events.stock_event import StockEventV1


def test_stock_event_roundtrip():
    event = StockEventV1(
        event_type="DESPACHO",
        empresa_id=3,
        payload={"producto_nombre": "A", "cantidad": 1},
        usuario_id=7,
        email_to=["ops@example.com"],
    )
    restored = StockEventV1.from_json(event.to_json())
    assert restored.event_type == "DESPACHO"
    assert restored.empresa_id == 3
    assert restored.usuario_id == 7
    assert restored.email_to == ["ops@example.com"]
    assert restored.payload["producto_nombre"] == "A"


def test_stock_event_omits_optional_fields():
    raw = json.dumps(
        {"version": "1", "event_type": "RECEPCION", "empresa_id": 1, "payload": {}}
    )
    event = StockEventV1.from_json(raw)
    assert event.usuario_id is None
    assert event.email_to is None
