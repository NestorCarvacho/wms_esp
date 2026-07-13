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

    async def listar_skus_y_nombres_empresa(self, empresa_id: int) -> tuple[set[str], set[str]]: ...

    async def listar_codigos_barras_empresa(self, empresa_id: int) -> set[str]: ...

    async def mapa_ids_por_skus(self, empresa_id: int, skus: set[str]) -> dict[str, int]: ...


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


class IProductoPresentacionService(Protocol):
    async def resolver_empresa_para_producto(
        self,
        producto_id: int,
        empresa_usuario_id: int,
        es_maestra: bool,
        empresas_administradas_ids: list[int],
    ) -> int: ...

    async def resolver_empresa_para_presentacion(
        self,
        presentacion_id: int,
        empresa_usuario_id: int,
        es_maestra: bool,
        empresas_administradas_ids: list[int],
    ) -> int: ...

    async def listar_presentaciones(
        self,
        producto_id: int,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 50,
        buscar: str | None = None,
    ) -> dict[str, Any]: ...

    async def buscar_por_barcode(self, empresa_id: int, codigo: str) -> dict[str, Any] | None: ...

    async def crear_presentacion(
        self, producto_id: int, empresa_id: int, nombre: str, **kwargs: Any
    ) -> dict[str, Any]: ...

    async def actualizar_presentacion(
        self, presentacion_id: int, empresa_id: int, **datos: Any
    ) -> dict[str, Any]: ...

    async def eliminar_presentacion(
        self, presentacion_id: int, empresa_id: int
    ) -> dict[str, Any]: ...

    async def calcular_descuento_stock(
        self,
        presentacion_id: int,
        empresa_id: int,
        cantidad: Any,
        venta_por_presentacion: bool,
    ) -> dict[str, Any]: ...


class IProductoImportacionService(Protocol):
    async def generar_plantilla(self, empresa_id: int) -> bytes: ...

    async def importar_desde_excel(self, contenido: bytes, empresa_id: int) -> dict[str, Any]: ...


class IProductoConsultaService(Protocol):
    async def consultar_por_codigo(
        self, codigo: str, empresas_ids: list[int]
    ) -> dict[str, Any]: ...


class IStockConsultaPort(Protocol):
    async def listar_stock_producto(
        self, empresa_id: int, producto_id: int
    ) -> list[dict[str, Any]]: ...
