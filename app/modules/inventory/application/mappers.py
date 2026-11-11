"""Mapeo ORM → DTO de respuesta."""
from __future__ import annotations

from typing import Any

from app.shared.locale_formatting import serializar_timestamp


def serializar_movimiento(m: Any) -> dict:
    return {
        "id": m.id,
        "tipo": m.tipo,
        "producto_id": m.producto_id,
        "producto_sku": m.producto.sku if m.producto else None,
        "producto_nombre": m.producto.nombre if m.producto else None,
        "cantidad": float(m.cantidad),
        "presentacion_id": m.presentacion_id,
        "venta_por_presentacion": m.venta_por_presentacion,
        "zona_origen_id": m.zona_origen_id,
        "zona_origen_nombre": (
            (m.zona_origen.nombre or m.zona_origen.tipo_zona.nombre)
            if m.zona_origen and m.zona_origen.tipo_zona
            else (m.zona_origen.nombre if m.zona_origen else None)
        ),
        "zona_destino_id": m.zona_destino_id,
        "zona_destino_nombre": (
            (m.zona_destino.nombre or m.zona_destino.tipo_zona.nombre)
            if m.zona_destino and getattr(m.zona_destino, "tipo_zona", None)
            else (m.zona_destino.nombre if m.zona_destino else None)
        ),
        "documento_tipo": m.documento_tipo,
        "documento_folio": m.documento_folio,
        "observaciones": m.observaciones,
        "usuario_id": m.usuario_id,
        "usuario_email": m.usuario.email if m.usuario else None,
        "creado_at": m.creado_at.isoformat() if m.creado_at else None,
        "creado_at_local": serializar_timestamp(m.creado_at),
    }
