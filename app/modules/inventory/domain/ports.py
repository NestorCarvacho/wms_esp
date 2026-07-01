"""Puertos (interfaces) — dependencia invertida hacia infraestructura."""
from __future__ import annotations

from decimal import Decimal
from typing import Any, Protocol

from app.modules.inventory.domain.events import StockMovimientoRegistrado


class IInventarioRepository(Protocol):
    async def obtener_zona(self, zona_id: int, empresa_id: int | None = None) -> Any | None: ...

    async def obtener_producto(self, producto_id: int, empresa_id: int) -> Any | None: ...

    async def obtener_presentacion(
        self, presentacion_id: int, producto_id: int
    ) -> Any | None: ...

    async def bodega_existe(self, bodega_id: int, empresa_id: int) -> bool: ...

    async def get_bodega_config(self, bodega_id: int) -> Any | None: ...

    async def upsert_bodega_config(
        self, bodega_id: int, zona_recepcion_default_id: int | None
    ) -> None: ...

    async def ajustar_stock(
        self, zona_bodega_id: int, producto_id: int, delta: Decimal
    ) -> Decimal: ...

    async def registrar_movimiento(self, datos: dict) -> Any: ...

    async def listar_stock(self, empresa_id: int, **kwargs: Any) -> tuple[list[dict], int]: ...

    async def listar_movimientos(
        self, empresa_id: int, **kwargs: Any
    ) -> tuple[list[Any], int]: ...

    async def resumen_dashboard(self, empresa_id: int, **kwargs: Any) -> dict: ...

    async def commit(self) -> None: ...

    async def rollback(self) -> None: ...


class IEventPublisher(Protocol):
    async def publish(self, event: StockMovimientoRegistrado) -> None: ...


class IUnitOfWork(Protocol):
    inventario: IInventarioRepository

    async def commit(self) -> None: ...

    async def rollback(self) -> None: ...
