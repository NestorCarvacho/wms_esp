"""Handlers de inventario serializado (serie_producto)."""
from __future__ import annotations

from typing import Any

from app.modules.inventory.domain.ports import ISerieProductoService


class RecepcionarSerieHandler:
    def __init__(self, service: ISerieProductoService):
        self._service = service

    async def handle(self, **kwargs: Any) -> dict[str, Any]:
        return await self._service.recepcionar_serie(**kwargs)


class TrasladarSerieHandler:
    def __init__(self, service: ISerieProductoService):
        self._service = service

    async def handle(self, **kwargs: Any) -> dict[str, Any]:
        return await self._service.trasladar_serie(**kwargs)


class DespacharSerieHandler:
    def __init__(self, service: ISerieProductoService):
        self._service = service

    async def handle(self, **kwargs: Any) -> dict[str, Any]:
        return await self._service.despachar_serie(**kwargs)


class UbicarSerieQueryHandler:
    def __init__(self, service: ISerieProductoService):
        self._service = service

    async def handle(self, empresa_id: int, numero_serie: str) -> dict[str, Any]:
        return await self._service.ubicar_serie(empresa_id, numero_serie)


class ListarSeriesProductoQueryHandler:
    def __init__(self, service: ISerieProductoService):
        self._service = service

    async def handle(self, **kwargs: Any) -> dict[str, Any]:
        return await self._service.listar_series_producto(**kwargs)
