"""Handlers de importación y consulta de productos."""
from __future__ import annotations

from typing import Any

from app.modules.catalog.infrastructure.producto_consulta_service import ProductoConsultaService
from app.modules.catalog.infrastructure.producto_importacion_service import ProductoImportacionService


class GenerarPlantillaImportacionHandler:
    def __init__(self, service: ProductoImportacionService):
        self._service = service

    async def handle(self, empresa_id: int) -> bytes:
        return await self._service.generar_plantilla(empresa_id)


class ImportarProductosHandler:
    def __init__(self, service: ProductoImportacionService):
        self._service = service

    async def handle(self, contenido: bytes, empresa_id: int) -> dict[str, Any]:
        return await self._service.importar_desde_excel(contenido, empresa_id)


class ConsultarProductoHandler:
    def __init__(self, service: ProductoConsultaService):
        self._service = service

    async def handle(self, codigo: str, empresas_ids: list[int]) -> dict[str, Any]:
        return await self._service.consultar_por_codigo(codigo, empresas_ids)
