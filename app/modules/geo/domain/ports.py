"""Puertos del módulo geo."""
from __future__ import annotations

from typing import Protocol

from app.modules.geo.domain.entities import Ciudad, Comuna, Region


class IGeografiaRepository(Protocol):
    async def listar_regiones(self) -> list[Region]: ...

    async def listar_ciudades(self, region_id: int | None = None) -> list[Ciudad]: ...

    async def listar_comunas(
        self, ciudad_id: int | None = None, region_id: int | None = None
    ) -> list[Comuna]: ...
