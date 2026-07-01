"""Composition root — inyección de dependencias del módulo inventario."""
from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.inventory.application.handlers.config_handlers import (
    ActualizarConfigBodegaHandler,
    ObtenerConfigBodegaHandler,
)
from app.modules.inventory.application.handlers.despachar_handler import DespacharHandler
from app.modules.inventory.application.handlers.query_handlers import (
    DashboardHandler,
    ListarMovimientosHandler,
    ListarStockHandler,
)
from app.modules.inventory.application.handlers.recepcionar_handler import RecepcionarHandler
from app.modules.inventory.application.handlers.trasladar_handler import TrasladarHandler
from app.modules.inventory.domain.services.presentacion_converter import PresentacionConverter
from app.modules.inventory.infrastructure.sqlalchemy_repository import SqlAlchemyInventarioRepository
from app.modules.inventory.infrastructure.unit_of_work import SqlAlchemyInventoryUnitOfWork
from app.modules.inventory.infrastructure.ws_event_publisher import WebSocketEventPublisher


@dataclass
class InventoryHandlers:
    recepcionar: RecepcionarHandler
    trasladar: TrasladarHandler
    despachar: DespacharHandler
    listar_stock: ListarStockHandler
    listar_movimientos: ListarMovimientosHandler
    dashboard: DashboardHandler
    obtener_config_bodega: ObtenerConfigBodegaHandler
    actualizar_config_bodega: ActualizarConfigBodegaHandler


def build_inventory_handlers(session: AsyncSession) -> InventoryHandlers:
    """Factory por request (scoped a la sesión DB)."""
    uow = SqlAlchemyInventoryUnitOfWork(session)
    repo = SqlAlchemyInventarioRepository(session)
    events = WebSocketEventPublisher()
    conversion = PresentacionConverter()

    return InventoryHandlers(
        recepcionar=RecepcionarHandler(uow, events, conversion),
        trasladar=TrasladarHandler(uow, events, conversion),
        despachar=DespacharHandler(uow, events, conversion),
        listar_stock=ListarStockHandler(repo),
        listar_movimientos=ListarMovimientosHandler(repo),
        dashboard=DashboardHandler(repo),
        obtener_config_bodega=ObtenerConfigBodegaHandler(repo),
        actualizar_config_bodega=ActualizarConfigBodegaHandler(uow),
    )
