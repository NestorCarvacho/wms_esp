"""Composition root del módulo catalog."""
from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.inventory.infrastructure.inventario_crud import InventarioCRUDRepository
from app.modules.catalog.infrastructure.producto_crud import ProductoCRUDRepository
from app.modules.catalog.infrastructure.producto_presentacion_crud import (
    ProductoPresentacionCRUDRepository,
)
from app.modules.catalog.infrastructure.unidad_medida_crud import UnidadMedidaCRUDRepository
from app.modules.catalog.application.handlers.presentacion_handlers import PresentacionHandlers
from app.modules.catalog.application.handlers.producto_extended_handlers import (
    ConsultarProductoHandler,
    GenerarPlantillaImportacionHandler,
    ImportarProductosHandler,
)
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
from app.modules.catalog.infrastructure.producto_consulta_service import ProductoConsultaService
from app.modules.catalog.infrastructure.producto_importacion_service import ProductoImportacionService
from app.modules.catalog.infrastructure.producto_presentacion_service import ProductoPresentacionService
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
    presentaciones: PresentacionHandlers
    generar_plantilla_importacion: GenerarPlantillaImportacionHandler
    importar_productos: ImportarProductosHandler
    consultar_producto: ConsultarProductoHandler


def build_catalog_handlers(session: AsyncSession) -> CatalogHandlers:
    productos = SqlAlchemyProductoRepository(session)
    tipos = SqlAlchemyTipoProductoRepository(session)
    unidades = SqlAlchemyUnidadMedidaRepository(session)

    presentacion_service = ProductoPresentacionService(
        ProductoPresentacionCRUDRepository(session),
        ProductoCRUDRepository(session),
        UnidadMedidaCRUDRepository(session),
    )
    importacion_service = ProductoImportacionService(session)
    consulta_service = ProductoConsultaService(
        ProductoCRUDRepository(session),
        ProductoPresentacionCRUDRepository(session),
        InventarioCRUDRepository(session),
    )

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
        presentaciones=PresentacionHandlers(presentacion_service),
        generar_plantilla_importacion=GenerarPlantillaImportacionHandler(importacion_service),
        importar_productos=ImportarProductosHandler(importacion_service),
        consultar_producto=ConsultarProductoHandler(consulta_service),
    )
