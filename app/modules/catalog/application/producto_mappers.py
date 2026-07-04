"""Mapeo producto dominio → DTO."""
from __future__ import annotations

from app.modules.catalog.domain.entities import Producto


def serializar_producto_lista(p: Producto) -> dict:
    return {
        "id": p.id,
        "nombre": p.nombre,
        "empresa_id": p.empresa_id,
        "empresa_nombre": p.empresa_nombre,
        "sku": p.sku,
        "activo": p.activo,
        "unidad_medida_id": p.unidad_medida_id,
        "unidad_medida_nombre": p.unidad_medida_nombre,
        "tipo_producto_id": p.tipo_producto_id,
        "tipo_producto_nombre": p.tipo_producto_nombre,
        "precio_costo": p.precio_costo,
        "serializado": p.serializado,
        "stock_minimo": p.stock_minimo,
    }


def serializar_producto_detalle(p: Producto) -> dict:
    return {
        "id": p.id,
        "empresa_id": p.empresa_id,
        "nombre": p.nombre,
        "sku": p.sku,
        "activo": p.activo,
        "unidad_medida_id": p.unidad_medida_id,
        "tipo_producto_id": p.tipo_producto_id,
        "precio_costo": p.precio_costo,
        "serializado": p.serializado,
        "stock_minimo": p.stock_minimo,
    }
