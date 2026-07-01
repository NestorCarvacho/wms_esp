"""Lógica compartida entre handlers de operaciones."""
from __future__ import annotations

from decimal import Decimal
from typing import Any

from app.modules.inventory.application.mappers import serializar_movimiento
from app.modules.inventory.domain.events import StockMovimientoRegistrado
from app.modules.inventory.domain.ports import IEventPublisher, IInventarioRepository
from app.modules.inventory.domain.services.presentacion_converter import PresentacionConverter


async def cantidad_unidades_base(
    repo: IInventarioRepository,
    conversion: PresentacionConverter,
    producto_id: int,
    empresa_id: int,
    cantidad: Decimal,
    presentacion_id: int | None,
    venta_por_presentacion: bool,
) -> Decimal:
    if presentacion_id is None:
        return cantidad
    pres = await repo.obtener_presentacion(presentacion_id, producto_id)
    if not pres:
        raise ValueError("Presentación no válida para este producto")
    return conversion.calcular_descuento_stock_base(
        cantidad=cantidad,
        cantidad_contenida=Decimal(str(pres.cantidad_contenida)),
        venta_por_presentacion=venta_por_presentacion,
        permite_venta_unidad=bool(pres.permite_venta_unidad),
        permite_venta_presentacion=bool(pres.permite_venta_presentacion),
    )


async def resolver_zona_recepcion(
    repo: IInventarioRepository,
    bodega_id: int,
    zona_destino_id: int | None,
    empresa_id: int,
) -> Any:
    if zona_destino_id:
        zona = await repo.obtener_zona(zona_destino_id, empresa_id)
        if not zona or zona.bodega_id != bodega_id:
            raise ValueError("La zona de destino no pertenece a la bodega indicada")
        return zona
    cfg = await repo.get_bodega_config(bodega_id)
    if not cfg or not cfg.zona_recepcion_default_id:
        raise ValueError(
            "Configure la zona de recepción por defecto de la bodega o indique zona_destino_id"
        )
    zona = await repo.obtener_zona(cfg.zona_recepcion_default_id, empresa_id)
    if not zona or zona.bodega_id != bodega_id:
        raise ValueError("La zona de recepción configurada no es válida para esta bodega")
    return zona


async def emitir_evento_stock(
    publisher: IEventPublisher,
    empresa_id: int,
    tipo: str,
    data: dict,
) -> None:
    await publisher.publish(
        StockMovimientoRegistrado(
            empresa_id=empresa_id,
            movimiento_id=data.get("id"),
            tipo=tipo,
            payload={
                "movimiento_id": data.get("id"),
                "producto_nombre": data.get("producto_nombre"),
                "producto_sku": data.get("producto_sku"),
                "cantidad": data.get("cantidad"),
                "tipo": tipo,
                "creado_at_local": data.get("creado_at_local"),
            },
            creado_at_local=data.get("creado_at_local"),
        )
    )


def movimiento_dict(mov: Any) -> dict:
    return serializar_movimiento(mov)
