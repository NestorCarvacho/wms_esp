"""Composition root del módulo catalog."""
from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.catalog.application.handlers.producto_handlers import (
    ActualizarProductoHandler,
    CrearProductoHandler,
    EliminarProductoHandler,
    ListarProductosQueryHandler,
    ObtenerProductoQueryHandler,
)
from app.modules.catalog.application.handlers.tipo_producto_handlers import (
    ActualizarTipoProductoHandler,
    CrearTipoProductoHandler,
    EliminarTipoProductoHandler,
    ListarTiposProductoQueryHandler,
    ObtenerTipoProductoQueryHandler,
)
from app.modules.catalog.application.handlers.unidad_medida_handlers import (
    ActualizarUnidadMedidaHandler,
    CrearUnidadMedidaHandler,
    EliminarUnidadMedidaHandler,
    ListarUnidadesMedidaQueryHandler,
    ObtenerUnidadMedidaQueryHandler,
)
from app.modules.catalog.infrastructure.producto_repository import SqlAlchemyProductoRepository
from app.modules.catalog.infrastructure.tipo_producto_repository import SqlAlchemyTipoProductoRepository
from app.modules.catalog.infrastructure.unidad_medida_repository import SqlAlchemyUnidadMedidaRepository


@dataclass
class CatalogHandlers:
    listar_productos: ListarProductosQueryHandler
    obtener_producto: ObtenerProductoQueryHandler
    crear_producto: CrearProductoHandler
    actualizar_producto: ActualizarProductoHandler
    eliminar_producto: EliminarProductoHandler
    listar_tipos_producto: ListarTiposProductoQueryHandler
    obtener_tipo_producto: ObtenerTipoProductoQueryHandler
    crear_tipo_producto: CrearTipoProductoHandler
    actualizar_tipo_producto: ActualizarTipoProductoHandler
    eliminar_tipo_producto: EliminarTipoProductoHandler
    listar_unidades_medida: ListarUnidadesMedidaQueryHandler
    obtener_unidad_medida: ObtenerUnidadMedidaQueryHandler
    crear_unidad_medida: CrearUnidadMedidaHandler
    actualizar_unidad_medida: ActualizarUnidadMedidaHandler
    eliminar_unidad_medida: EliminarUnidadMedidaHandler


def build_catalog_handlers(session: AsyncSession) -> CatalogHandlers:
    productos = SqlAlchemyProductoRepository(session)
    tipos = SqlAlchemyTipoProductoRepository(session)
    unidades = SqlAlchemyUnidadMedidaRepository(session)
    return CatalogHandlers(
        listar_productos=ListarProductosQueryHandler(productos),
        obtener_producto=ObtenerProductoQueryHandler(productos),
        crear_producto=CrearProductoHandler(productos),
        actualizar_producto=ActualizarProductoHandler(productos),
        eliminar_producto=EliminarProductoHandler(productos),
        listar_tipos_producto=ListarTiposProductoQueryHandler(tipos),
        obtener_tipo_producto=ObtenerTipoProductoQueryHandler(tipos),
        crear_tipo_producto=CrearTipoProductoHandler(tipos),
        actualizar_tipo_producto=ActualizarTipoProductoHandler(tipos),
        eliminar_tipo_producto=EliminarTipoProductoHandler(tipos),
        listar_unidades_medida=ListarUnidadesMedidaQueryHandler(unidades),
        obtener_unidad_medida=ObtenerUnidadMedidaQueryHandler(unidades),
        crear_unidad_medida=CrearUnidadMedidaHandler(unidades),
        actualizar_unidad_medida=ActualizarUnidadMedidaHandler(unidades),
        eliminar_unidad_medida=EliminarUnidadMedidaHandler(unidades),
    )
