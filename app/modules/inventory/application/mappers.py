"""Mapeo ORM → DTO de respuesta."""
from __future__ import annotations

from typing import Any

from app.shared.locale_formatting import serializar_timestamp
from app.shared.orm_state import relacion_cargada


def _nombre_zona(zona: Any) -> str | None:
    if zona is None:
        return None
    tipo = relacion_cargada(zona, "tipo_zona")
    if tipo:
        return zona.nombre or tipo.nombre
    return zona.nombre


def serializar_movimiento(m: Any) -> dict:
    producto = relacion_cargada(m, "producto")
    usuario = relacion_cargada(m, "usuario")
    zona_origen = relacion_cargada(m, "zona_origen")
    zona_destino = relacion_cargada(m, "zona_destino")
    return {
        "id": m.id,
        "tipo": m.tipo,
        "producto_id": m.producto_id,
        "producto_sku": producto.sku if producto else None,
        "producto_nombre": producto.nombre if producto else None,
        "cantidad": float(m.cantidad),
        "presentacion_id": m.presentacion_id,
        "venta_por_presentacion": m.venta_por_presentacion,
        "zona_origen_id": m.zona_origen_id,
        "zona_origen_nombre": _nombre_zona(zona_origen),
        "zona_destino_id": m.zona_destino_id,
        "zona_destino_nombre": _nombre_zona(zona_destino),
        "documento_tipo": m.documento_tipo,
        "documento_folio": m.documento_folio,
        "observaciones": m.observaciones,
        "usuario_id": m.usuario_id,
        "usuario_email": usuario.email if usuario else None,
        "creado_at": m.creado_at.isoformat() if m.creado_at else None,
        "creado_at_local": serializar_timestamp(m.creado_at),
    }
