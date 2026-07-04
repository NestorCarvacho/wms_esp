"""Handler: traslado interno entre zonas."""
from __future__ import annotations

from app.modules.inventory.application.commands import TrasladarCommand
from app.modules.inventory.application.operation_helpers import (
    cantidad_unidades_base,
    movimiento_dict,
)
from app.modules.inventory.domain.ports import IUnitOfWork
from app.modules.inventory.domain.services.presentacion_converter import PresentacionConverter


class TrasladarHandler:
    def __init__(
        self,
        uow: IUnitOfWork,
        conversion: PresentacionConverter | None = None,
    ):
        self.uow = uow
        self.conversion = conversion or PresentacionConverter()

    async def handle(self, cmd: TrasladarCommand) -> dict:
        if cmd.zona_origen_id == cmd.zona_destino_id:
            raise ValueError("Origen y destino deben ser zonas distintas")
        repo = self.uow.inventario
        producto = await repo.obtener_producto(cmd.producto_id, cmd.empresa_id)
        if not producto:
            raise ValueError("Producto no encontrado")
        origen = await repo.obtener_zona(cmd.zona_origen_id, cmd.empresa_id)
        destino = await repo.obtener_zona(cmd.zona_destino_id, cmd.empresa_id)
        if not origen or not destino:
            raise ValueError("Zona de origen o destino no encontrada")
        if origen.bodega_id != destino.bodega_id:
            raise ValueError("El traslado debe ser dentro de la misma bodega")
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
            stock_destino = await repo.ajustar_stock(
                cmd.zona_destino_id, cmd.producto_id, cantidad_base
            )
            mov = await repo.registrar_movimiento(
                {
                    "empresa_id": cmd.empresa_id,
                    "usuario_id": cmd.usuario_id,
                    "tipo": "TRASLADO",
                    "producto_id": cmd.producto_id,
                    "cantidad": cantidad_base,
                    "presentacion_id": cmd.presentacion_id,
                    "venta_por_presentacion": cmd.venta_por_presentacion,
                    "zona_origen_id": cmd.zona_origen_id,
                    "zona_destino_id": cmd.zona_destino_id,
                    "documento_tipo": cmd.documento_tipo,
                    "documento_folio": cmd.documento_folio,
                    "observaciones": cmd.observaciones,
                }
            )
            await self.uow.commit()
            data = movimiento_dict(mov)
            data["stock_origen"] = float(stock_origen)
            data["stock_destino"] = float(stock_destino)
            return data
        except Exception:
            await self.uow.rollback()
            raise
