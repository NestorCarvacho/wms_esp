"""Mapeo ORM → entidades de dominio catalog."""
from __future__ import annotations

from typing import Any

from app.shared.formatting import format_empresa_nombre
from app.modules.catalog.domain.entities import Producto, TipoProducto, UnidadMedida


def producto_desde_orm(row: Any) -> Producto:
    return Producto(
        id=row.id,
        empresa_id=row.empresa_id,
        nombre=row.nombre,
        sku=row.sku,
        activo=row.activo,
        unidad_medida_id=row.unidad_medida_id,
        tipo_producto_id=row.tipo_producto_id,
        precio_costo=float(row.precio_costo) if row.precio_costo is not None else None,
        serializado=bool(row.serializado),
        stock_minimo=float(row.stock_minimo) if getattr(row, "stock_minimo", None) is not None else None,
        empresa_nombre=format_empresa_nombre(row.empresa) if getattr(row, "empresa", None) else None,
        unidad_medida_nombre=row.unidad_medida.nombre if getattr(row, "unidad_medida", None) else None,
        tipo_producto_nombre=row.tipo_producto.nombre if getattr(row, "tipo_producto", None) else None,
    )


def tipo_producto_desde_orm(row: Any) -> TipoProducto:
    return TipoProducto(
        id=row.id,
        empresa_id=row.empresa_id,
        nombre=row.nombre,
        activo=row.activo,
        empresa_nombre=format_empresa_nombre(row.empresa) if getattr(row, "empresa", None) else None,
    )


def unidad_medida_desde_orm(row: Any) -> UnidadMedida:
    return UnidadMedida(
        id=row.id,
        empresa_id=row.empresa_id,
        nombre=row.nombre,
        codigo=row.codigo,
        activo=row.activo,
        empresa_nombre=format_empresa_nombre(row.empresa) if getattr(row, "empresa", None) else None,
    )
