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
from app.modules.catalog.infrastructure.producto_repository import SqlAlchemyProductoRepository


@dataclass
class CatalogHandlers:
    listar_productos: ListarProductosQueryHandler
    obtener_producto: ObtenerProductoQueryHandler
    crear_producto: CrearProductoHandler
    actualizar_producto: ActualizarProductoHandler
    eliminar_producto: EliminarProductoHandler


def build_catalog_handlers(session: AsyncSession) -> CatalogHandlers:
    productos = SqlAlchemyProductoRepository(session)
    return CatalogHandlers(
        listar_productos=ListarProductosQueryHandler(productos),
        obtener_producto=ObtenerProductoQueryHandler(productos),
        crear_producto=CrearProductoHandler(productos),
        actualizar_producto=ActualizarProductoHandler(productos),
        eliminar_producto=EliminarProductoHandler(productos),
    )
