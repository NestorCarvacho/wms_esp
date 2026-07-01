"""Mapeo producto ORM → DTO."""
from __future__ import annotations

from typing import Any

from app.domain.services.display_helpers import format_empresa_nombre


def serializar_producto_lista(p: Any) -> dict:
    return {
        "id": p.id,
        "nombre": p.nombre,
        "empresa_id": p.empresa_id,
        "empresa_nombre": format_empresa_nombre(p.empresa),
        "sku": p.sku,
        "activo": p.activo,
        "unidad_medida_id": p.unidad_medida_id,
        "unidad_medida_nombre": p.unidad_medida.nombre if p.unidad_medida else None,
        "tipo_producto_id": p.tipo_producto_id,
        "tipo_producto_nombre": p.tipo_producto.nombre if p.tipo_producto else None,
        "precio_costo": float(p.precio_costo) if p.precio_costo is not None else None,
        "serializado": bool(p.serializado),
        "stock_minimo": float(p.stock_minimo) if getattr(p, "stock_minimo", None) is not None else None,
    }


def serializar_producto_detalle(p: Any) -> dict:
    return {
        "id": p.id,
        "empresa_id": p.empresa_id,
        "nombre": p.nombre,
        "sku": p.sku,
        "activo": p.activo,
        "unidad_medida_id": p.unidad_medida_id,
        "tipo_producto_id": p.tipo_producto_id,
        "precio_costo": p.precio_costo,
        "serializado": bool(p.serializado),
        "stock_minimo": float(p.stock_minimo) if getattr(p, "stock_minimo", None) is not None else None,
    }
