"""Puertos del bounded context catalog."""
from __future__ import annotations

from typing import Any, Protocol

from app.modules.catalog.domain.entities import Producto, TipoProducto, UnidadMedida


class IProductoRepository(Protocol):
    async def listar(self, **kwargs: Any) -> tuple[list[Producto], int]: ...

    async def obtener_por_id(self, producto_id: int, empresa_id: int | None = None) -> Producto | None: ...

    async def obtener_por_sku(self, sku: str, empresa_id: int) -> Producto | None: ...

    async def obtener_por_nombre(self, nombre: str, empresa_id: int) -> Producto | None: ...

    async def crear(
        self,
        empresa_id: int,
        nombre: str,
        sku: str,
        activo: bool = True,
        unidad_medida_id: int | None = None,
        tipo_producto_id: int | None = None,
        precio_costo: float | None = None,
        serializado: bool = False,
        stock_minimo: float | None = None,
    ) -> Producto: ...

    async def actualizar(
        self,
        producto_id: int,
        empresa_id: int,
        nombre: str | None = None,
        sku: str | None = None,
        activo: bool | None = None,
        unidad_medida_id: int | None = None,
        tipo_producto_id: int | None = None,
        precio_costo: float | None = None,
        *,
        actualizar_tipo_producto: bool = False,
        serializado: bool | None = None,
        stock_minimo: float | None = None,
        actualizar_stock_minimo: bool = False,
    ) -> Producto | None: ...

    async def eliminar(self, producto_id: int, empresa_id: int) -> bool: ...


class ITipoProductoRepository(Protocol):
    async def listar(self, **kwargs: Any) -> tuple[list[TipoProducto], int]: ...

    async def obtener_por_id(self, tipo_producto_id: int, empresa_id: int | None = None) -> TipoProducto | None: ...

    async def obtener_por_nombre(self, nombre: str, empresa_id: int) -> TipoProducto | None: ...

    async def crear(self, empresa_id: int, nombre: str, activo: bool = True) -> TipoProducto: ...

    async def actualizar(
        self,
        tipo_producto_id: int,
        empresa_id: int,
        nombre: str | None = None,
        activo: bool | None = None,
    ) -> TipoProducto | None: ...

    async def eliminar(self, tipo_producto_id: int, empresa_id: int) -> bool: ...


class IUnidadMedidaRepository(Protocol):
    async def listar(self, **kwargs: Any) -> tuple[list[UnidadMedida], int]: ...

    async def obtener_por_id(self, unidad_medida_id: int, empresa_id: int | None = None) -> UnidadMedida | None: ...

    async def obtener_por_nombre(self, nombre: str, empresa_id: int) -> UnidadMedida | None: ...

    async def obtener_por_codigo(self, codigo: str, empresa_id: int) -> UnidadMedida | None: ...

    async def crear(
        self, empresa_id: int, nombre: str, codigo: str, activo: bool = True
    ) -> UnidadMedida: ...

    async def actualizar(
        self,
        unidad_medida_id: int,
        empresa_id: int,
        nombre: str | None = None,
        codigo: str | None = None,
        activo: bool | None = None,
    ) -> UnidadMedida | None: ...

    async def eliminar(self, unidad_medida_id: int, empresa_id: int) -> bool: ...
