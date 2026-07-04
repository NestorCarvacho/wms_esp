"""Handler: recepción de mercadería."""
from __future__ import annotations

from app.modules.inventory.application.commands import RecepcionarCommand
from app.modules.inventory.application.operation_helpers import (
    cantidad_unidades_base,
    movimiento_dict,
    resolver_zona_recepcion,
)
from app.modules.inventory.domain.ports import IUnitOfWork
from app.modules.inventory.domain.services.presentacion_converter import PresentacionConverter


class RecepcionarHandler:
    def __init__(
        self,
        uow: IUnitOfWork,
        conversion: PresentacionConverter | None = None,
    ):
        self.uow = uow
        self.conversion = conversion or PresentacionConverter()

    async def handle(self, cmd: RecepcionarCommand) -> dict:
        repo = self.uow.inventario
        producto = await repo.obtener_producto(cmd.producto_id, cmd.empresa_id)
        if not producto:
            raise ValueError("Producto no encontrado")
        zona = await resolver_zona_recepcion(
            repo, cmd.bodega_id, cmd.zona_destino_id, cmd.empresa_id
        )
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
            stock_final = await repo.ajustar_stock(zona.id, cmd.producto_id, cantidad_base)
            mov = await repo.registrar_movimiento(
                {
                    "empresa_id": cmd.empresa_id,
                    "usuario_id": cmd.usuario_id,
                    "tipo": "RECEPCION",
                    "producto_id": cmd.producto_id,
                    "cantidad": cantidad_base,
                    "presentacion_id": cmd.presentacion_id,
                    "venta_por_presentacion": cmd.venta_por_presentacion,
                    "zona_origen_id": None,
                    "zona_destino_id": zona.id,
                    "documento_tipo": cmd.documento_tipo,
                    "documento_folio": cmd.documento_folio,
                    "observaciones": cmd.observaciones,
                }
            )
            await self.uow.commit()
            data = movimiento_dict(mov)
            data["stock_destino"] = float(stock_final)
            return data
        except Exception:
            await self.uow.rollback()
            raise
