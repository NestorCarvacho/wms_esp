"""Operaciones de inventario: recepción, traslado, despacho y consultas."""
from decimal import Decimal
from typing import Any
from app.infrastructure.repositories.inventario_crud_repository import InventarioCRUDRepository
from app.domain.services.inventario_presentacion_service import InventarioPresentacionService
from app.domain.services.formato_service import serializar_timestamp
from app.infrastructure.ws.inventario_event_bus import inventario_event_bus


def _serializar_movimiento(m) -> dict:
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


async def _emitir_evento_stock(empresa_id: int, tipo: str, data: dict) -> None:
    await inventario_event_bus.broadcast_stock_event(
        empresa_id=empresa_id,
        event_type=tipo,
        payload={
            "movimiento_id": data.get("id"),
            "producto_nombre": data.get("producto_nombre"),
            "producto_sku": data.get("producto_sku"),
            "cantidad": data.get("cantidad"),
            "tipo": tipo,
            "creado_at_local": data.get("creado_at_local"),
        },
    )


class InventarioOperacionService:
    def __init__(self, repository: InventarioCRUDRepository):
        self.repository = repository
        self.conversion = InventarioPresentacionService()

    async def _cantidad_unidades_base(
        self,
        producto_id: int,
        empresa_id: int,
        cantidad: Decimal,
        presentacion_id: int | None,
        venta_por_presentacion: bool,
    ) -> Decimal:
        if presentacion_id is None:
            return cantidad
        pres = await self.repository.obtener_presentacion(presentacion_id, producto_id)
        if not pres:
            raise ValueError("Presentación no válida para este producto")
        return self.conversion.calcular_descuento_stock_base(
            cantidad=cantidad,
            cantidad_contenida=Decimal(str(pres.cantidad_contenida)),
            venta_por_presentacion=venta_por_presentacion,
            permite_venta_unidad=bool(pres.permite_venta_unidad),
            permite_venta_presentacion=bool(pres.permite_venta_presentacion),
        )

    async def _resolver_zona_recepcion(
        self, bodega_id: int, zona_destino_id: int | None, empresa_id: int
    ):
        if zona_destino_id:
            zona = await self.repository.obtener_zona(zona_destino_id, empresa_id)
            if not zona or zona.bodega_id != bodega_id:
                raise ValueError("La zona de destino no pertenece a la bodega indicada")
            return zona
        cfg = await self.repository.get_bodega_config(bodega_id)
        if not cfg or not cfg.zona_recepcion_default_id:
            raise ValueError(
                "Configure la zona de recepción por defecto de la bodega o indique zona_destino_id"
            )
        zona = await self.repository.obtener_zona(cfg.zona_recepcion_default_id, empresa_id)
        if not zona or zona.bodega_id != bodega_id:
            raise ValueError("La zona de recepción configurada no es válida para esta bodega")
        return zona

    async def recepcionar(
        self,
        empresa_id: int,
        usuario_id: int,
        bodega_id: int,
        producto_id: int,
        cantidad: Decimal,
        zona_destino_id: int | None = None,
        presentacion_id: int | None = None,
        venta_por_presentacion: bool = False,
        documento_tipo: str | None = None,
        documento_folio: str | None = None,
        observaciones: str | None = None,
    ) -> dict:
        producto = await self.repository.obtener_producto(producto_id, empresa_id)
        if not producto:
            raise ValueError("Producto no encontrado")
        zona = await self._resolver_zona_recepcion(bodega_id, zona_destino_id, empresa_id)
        cantidad_base = await self._cantidad_unidades_base(
            producto_id, empresa_id, cantidad, presentacion_id, venta_por_presentacion
        )
        try:
            stock_final = await self.repository.ajustar_stock(
                zona.id, producto_id, cantidad_base
            )
            mov = await self.repository.registrar_movimiento(
                {
                    "empresa_id": empresa_id,
                    "usuario_id": usuario_id,
                    "tipo": "RECEPCION",
                    "producto_id": producto_id,
                    "cantidad": cantidad_base,
                    "presentacion_id": presentacion_id,
                    "venta_por_presentacion": venta_por_presentacion,
                    "zona_origen_id": None,
                    "zona_destino_id": zona.id,
                    "documento_tipo": documento_tipo,
                    "documento_folio": documento_folio,
                    "observaciones": observaciones,
                }
            )
            await self.repository.commit()
            data = _serializar_movimiento(mov)
            data["stock_destino"] = float(stock_final)
            await _emitir_evento_stock(empresa_id, "RECEPCION", data)
            return data
        except Exception:
            await self.repository.rollback()
            raise

    async def trasladar(
        self,
        empresa_id: int,
        usuario_id: int,
        producto_id: int,
        cantidad: Decimal,
        zona_origen_id: int,
        zona_destino_id: int,
        presentacion_id: int | None = None,
        venta_por_presentacion: bool = False,
        documento_tipo: str | None = None,
        documento_folio: str | None = None,
        observaciones: str | None = None,
    ) -> dict:
        if zona_origen_id == zona_destino_id:
            raise ValueError("Origen y destino deben ser zonas distintas")
        producto = await self.repository.obtener_producto(producto_id, empresa_id)
        if not producto:
            raise ValueError("Producto no encontrado")
        origen = await self.repository.obtener_zona(zona_origen_id, empresa_id)
        destino = await self.repository.obtener_zona(zona_destino_id, empresa_id)
        if not origen or not destino:
            raise ValueError("Zona de origen o destino no encontrada")
        if origen.bodega_id != destino.bodega_id:
            raise ValueError("El traslado debe ser dentro de la misma bodega")
        cantidad_base = await self._cantidad_unidades_base(
            producto_id, empresa_id, cantidad, presentacion_id, venta_por_presentacion
        )
        try:
            stock_origen = await self.repository.ajustar_stock(
                zona_origen_id, producto_id, -cantidad_base
            )
            stock_destino = await self.repository.ajustar_stock(
                zona_destino_id, producto_id, cantidad_base
            )
            mov = await self.repository.registrar_movimiento(
                {
                    "empresa_id": empresa_id,
                    "usuario_id": usuario_id,
                    "tipo": "TRASLADO",
                    "producto_id": producto_id,
                    "cantidad": cantidad_base,
                    "presentacion_id": presentacion_id,
                    "venta_por_presentacion": venta_por_presentacion,
                    "zona_origen_id": zona_origen_id,
                    "zona_destino_id": zona_destino_id,
                    "documento_tipo": documento_tipo,
                    "documento_folio": documento_folio,
                    "observaciones": observaciones,
                }
            )
            await self.repository.commit()
            data = _serializar_movimiento(mov)
            data["stock_origen"] = float(stock_origen)
            data["stock_destino"] = float(stock_destino)
            await _emitir_evento_stock(empresa_id, "TRASLADO", data)
            return data
        except Exception:
            await self.repository.rollback()
            raise

    async def despachar(
        self,
        empresa_id: int,
        usuario_id: int,
        producto_id: int,
        cantidad: Decimal,
        zona_origen_id: int,
        presentacion_id: int | None = None,
        venta_por_presentacion: bool = False,
        documento_tipo: str | None = None,
        documento_folio: str | None = None,
        observaciones: str | None = None,
    ) -> dict:
        producto = await self.repository.obtener_producto(producto_id, empresa_id)
        if not producto:
            raise ValueError("Producto no encontrado")
        origen = await self.repository.obtener_zona(zona_origen_id, empresa_id)
        if not origen:
            raise ValueError("Zona de origen no encontrada")
        cantidad_base = await self._cantidad_unidades_base(
            producto_id, empresa_id, cantidad, presentacion_id, venta_por_presentacion
        )
        try:
            stock_origen = await self.repository.ajustar_stock(
                zona_origen_id, producto_id, -cantidad_base
            )
            mov = await self.repository.registrar_movimiento(
                {
                    "empresa_id": empresa_id,
                    "usuario_id": usuario_id,
                    "tipo": "DESPACHO",
                    "producto_id": producto_id,
                    "cantidad": cantidad_base,
                    "presentacion_id": presentacion_id,
                    "venta_por_presentacion": venta_por_presentacion,
                    "zona_origen_id": zona_origen_id,
                    "zona_destino_id": None,
                    "documento_tipo": documento_tipo,
                    "documento_folio": documento_folio,
                    "observaciones": observaciones,
                }
            )
            await self.repository.commit()
            data = _serializar_movimiento(mov)
            data["stock_origen"] = float(stock_origen)
            await _emitir_evento_stock(empresa_id, "DESPACHO", data)
            return data
        except Exception:
            await self.repository.rollback()
            raise

    async def resumen_dashboard(self, empresa_id: int, **kwargs) -> dict:
        raw = await self.repository.resumen_dashboard(empresa_id=empresa_id, **kwargs)
        return {
            "lineas_stock": raw["lineas_stock"],
            "productos_con_stock": raw["productos_con_stock"],
            "ubicaciones_con_stock": raw["ubicaciones_con_stock"],
            "movimientos_hoy": raw["movimientos_hoy"],
            "movimientos_semana": raw["movimientos_semana"],
            "movimientos_por_tipo_semana": raw["movimientos_por_tipo_semana"],
            "histograma_movimientos": raw["histograma_movimientos"],
            "stock_distribucion": raw["stock_distribucion"],
            "ultimos_movimientos": [
                _serializar_movimiento(m) for m in raw["ultimos_movimientos"]
            ],
        }

    async def listar_stock(self, empresa_id: int, **kwargs) -> dict:
        items, total = await self.repository.listar_stock(empresa_id=empresa_id, **kwargs)
        return {
            "total": total,
            "pagina": kwargs.get("pagina", 1),
            "por_pagina": kwargs.get("por_pagina", 50),
            "stock": items,
        }

    async def listar_movimientos(self, empresa_id: int, **kwargs) -> dict:
        rows, total = await self.repository.listar_movimientos(empresa_id=empresa_id, **kwargs)
        return {
            "total": total,
            "pagina": kwargs.get("pagina", 1),
            "por_pagina": kwargs.get("por_pagina", 50),
            "movimientos": [_serializar_movimiento(m) for m in rows],
        }

    async def obtener_config_bodega(self, bodega_id: int, empresa_id: int) -> dict:
        from app.infrastructure.repositories.bodega_crud_repository import BodegaCRUDRepository

        bodega_repo = BodegaCRUDRepository(self.repository.session)
        bodega = await bodega_repo.obtener_por_id(bodega_id, empresa_id)
        if not bodega:
            raise ValueError("Bodega no encontrada")
        cfg = await self.repository.get_bodega_config(bodega_id)
        return {
            "bodega_id": bodega_id,
            "zona_recepcion_default_id": cfg.zona_recepcion_default_id if cfg else None,
        }

    async def actualizar_config_bodega(
        self, bodega_id: int, empresa_id: int, zona_recepcion_default_id: int | None
    ) -> dict:
        from app.infrastructure.repositories.bodega_crud_repository import BodegaCRUDRepository

        bodega_repo = BodegaCRUDRepository(self.repository.session)
        bodega = await bodega_repo.obtener_por_id(bodega_id, empresa_id)
        if not bodega:
            raise ValueError("Bodega no encontrada")
        if zona_recepcion_default_id is not None:
            zona = await self.repository.obtener_zona(zona_recepcion_default_id, empresa_id)
            if not zona or zona.bodega_id != bodega_id:
                raise ValueError("La zona debe pertenecer a la bodega")
        await self.repository.upsert_bodega_config(bodega_id, zona_recepcion_default_id)
        await self.repository.commit()
        return await self.obtener_config_bodega(bodega_id, empresa_id)
