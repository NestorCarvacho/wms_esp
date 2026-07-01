"""Composition root del módulo warehouse."""
from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.warehouse.application.handlers.bodega_handlers import (
    ActualizarBodegaHandler,
    CrearBodegaHandler,
    EliminarBodegaHandler,
    ListarBodegasQueryHandler,
    ObtenerBodegaQueryHandler,
)
from app.modules.warehouse.application.handlers.tipo_zona_handlers import (
    ActualizarTipoZonaHandler,
    CrearTipoZonaHandler,
    EliminarTipoZonaHandler,
    ListarTiposZonaQueryHandler,
    ObtenerTipoZonaQueryHandler,
)
from app.modules.warehouse.application.handlers.zona_bodega_handlers import (
    ActualizarZonaBodegaHandler,
    CrearZonaBodegaHandler,
    EliminarZonaBodegaHandler,
    ListarZonasBodegaQueryHandler,
    ObtenerZonaBodegaQueryHandler,
)
from app.modules.warehouse.infrastructure.bodega_repository import SqlAlchemyBodegaRepository
from app.modules.warehouse.infrastructure.tipo_zona_repository import SqlAlchemyTipoZonaRepository
from app.modules.warehouse.infrastructure.zona_bodega_repository import SqlAlchemyZonaBodegaRepository


@dataclass
class WarehouseHandlers:
    listar_bodegas: ListarBodegasQueryHandler
    obtener_bodega: ObtenerBodegaQueryHandler
    crear_bodega: CrearBodegaHandler
    actualizar_bodega: ActualizarBodegaHandler
    eliminar_bodega: EliminarBodegaHandler
    listar_tipos_zona: ListarTiposZonaQueryHandler
    obtener_tipo_zona: ObtenerTipoZonaQueryHandler
    crear_tipo_zona: CrearTipoZonaHandler
    actualizar_tipo_zona: ActualizarTipoZonaHandler
    eliminar_tipo_zona: EliminarTipoZonaHandler
    listar_zonas_bodega: ListarZonasBodegaQueryHandler
    obtener_zona_bodega: ObtenerZonaBodegaQueryHandler
    crear_zona_bodega: CrearZonaBodegaHandler
    actualizar_zona_bodega: ActualizarZonaBodegaHandler
    eliminar_zona_bodega: EliminarZonaBodegaHandler


def build_warehouse_handlers(session: AsyncSession) -> WarehouseHandlers:
    bodegas = SqlAlchemyBodegaRepository(session)
    tipos = SqlAlchemyTipoZonaRepository(session)
    zonas = SqlAlchemyZonaBodegaRepository(session)
    return WarehouseHandlers(
        listar_bodegas=ListarBodegasQueryHandler(bodegas),
        obtener_bodega=ObtenerBodegaQueryHandler(bodegas),
        crear_bodega=CrearBodegaHandler(bodegas),
        actualizar_bodega=ActualizarBodegaHandler(bodegas),
        eliminar_bodega=EliminarBodegaHandler(bodegas),
        listar_tipos_zona=ListarTiposZonaQueryHandler(tipos),
        obtener_tipo_zona=ObtenerTipoZonaQueryHandler(tipos),
        crear_tipo_zona=CrearTipoZonaHandler(tipos),
        actualizar_tipo_zona=ActualizarTipoZonaHandler(tipos),
        eliminar_tipo_zona=EliminarTipoZonaHandler(tipos),
        listar_zonas_bodega=ListarZonasBodegaQueryHandler(zonas),
        obtener_zona_bodega=ObtenerZonaBodegaQueryHandler(zonas),
        crear_zona_bodega=CrearZonaBodegaHandler(zonas, bodegas, tipos),
        actualizar_zona_bodega=ActualizarZonaBodegaHandler(zonas, bodegas, tipos),
        eliminar_zona_bodega=EliminarZonaBodegaHandler(zonas),
    )
