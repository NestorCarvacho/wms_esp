"""Handler: despacho / salida de stock."""
from __future__ import annotations

from app.modules.inventory.application.commands import DespacharCommand
from app.modules.inventory.application.operation_helpers import (
    cantidad_unidades_base,
    emitir_evento_stock,
    movimiento_dict,
)
from app.modules.inventory.domain.ports import IEventPublisher, IUnitOfWork
from app.modules.inventory.domain.services.presentacion_converter import PresentacionConverter


class DespacharHandler:
    def __init__(
        self,
        uow: IUnitOfWork,
        event_publisher: IEventPublisher,
        conversion: PresentacionConverter | None = None,
    ):
        self.uow = uow
        self.events = event_publisher
        self.conversion = conversion or PresentacionConverter()

    async def handle(self, cmd: DespacharCommand) -> dict:
        repo = self.uow.inventario
        producto = await repo.obtener_producto(cmd.producto_id, cmd.empresa_id)
        if not producto:
            raise ValueError("Producto no encontrado")
        origen = await repo.obtener_zona(cmd.zona_origen_id, cmd.empresa_id)
        if not origen:
            raise ValueError("Zona de origen no encontrada")
        cantidad_base = await cantidad_unidades_base(
            repo,
            self.conversion,
            cmd.producto_id,
            cmd.empresa_id,
            cmd.cantidad,
            cmd.presentacion_id,
            cmd.venta_por_presentacion,
        )
        try:
            stock_origen = await repo.ajustar_stock(
                cmd.zona_origen_id, cmd.producto_id, -cantidad_base
            )
            mov = await repo.registrar_movimiento(
                {
                    "empresa_id": cmd.empresa_id,
                    "usuario_id": cmd.usuario_id,
                    "tipo": "DESPACHO",
                    "producto_id": cmd.producto_id,
                    "cantidad": cantidad_base,
                    "presentacion_id": cmd.presentacion_id,
                    "venta_por_presentacion": cmd.venta_por_presentacion,
                    "zona_origen_id": cmd.zona_origen_id,
                    "zona_destino_id": None,
                    "documento_tipo": cmd.documento_tipo,
                    "documento_folio": cmd.documento_folio,
                    "observaciones": cmd.observaciones,
                }
            )
            await self.uow.commit()
            data = movimiento_dict(mov)
            data["stock_origen"] = float(stock_origen)
            await emitir_evento_stock(self.events, cmd.empresa_id, "DESPACHO", data)
            return data
        except Exception:
            await self.uow.rollback()
            raise
