"""Operaciones de inventario: fachada sobre handlers hexagonales (compatibilidad legacy)."""
from decimal import Decimal
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.container import InventoryHandlers, build_inventory_handlers
from app.modules.inventory.application.commands import (
    ActualizarConfigBodegaCommand,
    DespacharCommand,
    RecepcionarCommand,
    TrasladarCommand,
)


class InventarioOperacionService:
    """
    Fachada de compatibilidad.
    Delega en handlers del módulo `app.modules.inventory` (piloto hexagonal).
    """

    def __init__(self, session: AsyncSession):
        self._handlers: InventoryHandlers = build_inventory_handlers(session)

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
        return await self._handlers.recepcionar.handle(
            RecepcionarCommand(
                empresa_id=empresa_id,
                usuario_id=usuario_id,
                bodega_id=bodega_id,
                producto_id=producto_id,
                cantidad=cantidad,
                zona_destino_id=zona_destino_id,
                presentacion_id=presentacion_id,
                venta_por_presentacion=venta_por_presentacion,
                documento_tipo=documento_tipo,
                documento_folio=documento_folio,
                observaciones=observaciones,
            )
        )

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
        return await self._handlers.trasladar.handle(
            TrasladarCommand(
                empresa_id=empresa_id,
                usuario_id=usuario_id,
                producto_id=producto_id,
                cantidad=cantidad,
                zona_origen_id=zona_origen_id,
                zona_destino_id=zona_destino_id,
                presentacion_id=presentacion_id,
                venta_por_presentacion=venta_por_presentacion,
                documento_tipo=documento_tipo,
                documento_folio=documento_folio,
                observaciones=observaciones,
            )
        )

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
        return await self._handlers.despachar.handle(
            DespacharCommand(
                empresa_id=empresa_id,
                usuario_id=usuario_id,
                producto_id=producto_id,
                cantidad=cantidad,
                zona_origen_id=zona_origen_id,
                presentacion_id=presentacion_id,
                venta_por_presentacion=venta_por_presentacion,
                documento_tipo=documento_tipo,
                documento_folio=documento_folio,
                observaciones=observaciones,
            )
        )

    async def listar_stock(self, empresa_id: int, **kwargs: Any) -> dict:
        return await self._handlers.listar_stock.handle(empresa_id, **kwargs)

    async def listar_movimientos(self, empresa_id: int, **kwargs: Any) -> dict:
        return await self._handlers.listar_movimientos.handle(empresa_id, **kwargs)

    async def obtener_config_bodega(self, bodega_id: int, empresa_id: int) -> dict:
        return await self._handlers.obtener_config_bodega.handle(bodega_id, empresa_id)

    async def actualizar_config_bodega(
        self, bodega_id: int, empresa_id: int, zona_recepcion_default_id: int | None
    ) -> dict:
        return await self._handlers.actualizar_config_bodega.handle(
            ActualizarConfigBodegaCommand(
                bodega_id=bodega_id,
                empresa_id=empresa_id,
                zona_recepcion_default_id=zona_recepcion_default_id,
            )
        )
