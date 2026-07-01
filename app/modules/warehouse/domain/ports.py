"""Puertos del bounded context warehouse."""
from __future__ import annotations

from typing import Any, Protocol


class IBodegaRepository(Protocol):
    async def listar(self, **kwargs: Any) -> tuple[list[Any], int]: ...

    async def obtener_por_id(self, bodega_id: int, empresa_id: int | None = None) -> Any | None: ...

    async def obtener_por_nombre(self, nombre: str, empresa_id: int) -> Any | None: ...

    async def obtener_por_codigo(self, codigo: str, empresa_id: int) -> Any | None: ...

    async def crear(
        self, empresa_id: int, nombre: str, codigo: str, activo: bool = True
    ) -> Any: ...

    async def actualizar(
        self,
        bodega_id: int,
        empresa_id: int,
        nombre: str | None = None,
        codigo: str | None = None,
        activo: bool | None = None,
    ) -> Any | None: ...

    async def eliminar(self, bodega_id: int, empresa_id: int) -> bool: ...


class ITipoZonaRepository(Protocol):
    async def listar(self, **kwargs: Any) -> tuple[list[Any], int]: ...

    async def obtener_por_id(self, tipo_zona_id: int, empresa_id: int | None = None) -> Any | None: ...

    async def obtener_por_nombre(self, nombre: str, empresa_id: int) -> Any | None: ...

    async def crear(self, empresa_id: int, nombre: str, activo: bool = True) -> Any: ...

    async def actualizar(
        self,
        tipo_zona_id: int,
        empresa_id: int,
        nombre: str | None = None,
        activo: bool | None = None,
    ) -> Any | None: ...

    async def eliminar(self, tipo_zona_id: int, empresa_id: int) -> bool: ...


class IZonaBodegaRepository(Protocol):
    async def listar(self, **kwargs: Any) -> tuple[list[Any], int]: ...

    async def obtener_por_id(self, zona_id: int, empresa_id: int | None = None) -> Any | None: ...

    async def crear(
        self,
        bodega_id: int,
        tipo_zona_id: int,
        nombre: str | None = None,
        activo: bool = True,
    ) -> Any: ...

    async def actualizar(
        self,
        zona_id: int,
        empresa_id: int,
        bodega_id: int | None = None,
        tipo_zona_id: int | None = None,
        nombre: str | None = None,
        activo: bool | None = None,
        _unset_nombre: bool = False,
    ) -> Any | None: ...

    async def eliminar(self, zona_id: int, empresa_id: int) -> bool: ...
