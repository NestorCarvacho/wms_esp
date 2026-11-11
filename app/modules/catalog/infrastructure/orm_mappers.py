"""Mapeo ORM → entidades de dominio catalog."""
from __future__ import annotations

from typing import Any

from app.shared.formatting import format_empresa_nombre
from app.shared.orm_state import relacion_cargada
from app.modules.catalog.domain.entities import Producto, TipoProducto, UnidadMedida


def _nombre_empresa(row: Any) -> str | None:
    return format_empresa_nombre(relacion_cargada(row, "empresa"))


def producto_desde_orm(row: Any) -> Producto:
    unidad = relacion_cargada(row, "unidad_medida")
    tipo = relacion_cargada(row, "tipo_producto")
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
        empresa_nombre=_nombre_empresa(row),
        unidad_medida_nombre=unidad.nombre if unidad else None,
        tipo_producto_nombre=tipo.nombre if tipo else None,
    )


def tipo_producto_desde_orm(row: Any) -> TipoProducto:
    return TipoProducto(
        id=row.id,
        empresa_id=row.empresa_id,
        nombre=row.nombre,
        activo=row.activo,
        empresa_nombre=_nombre_empresa(row),
    )


def unidad_medida_desde_orm(row: Any) -> UnidadMedida:
    return UnidadMedida(
        id=row.id,
        empresa_id=row.empresa_id,
        nombre=row.nombre,
        codigo=row.codigo,
        activo=row.activo,
        empresa_nombre=_nombre_empresa(row),
    )
