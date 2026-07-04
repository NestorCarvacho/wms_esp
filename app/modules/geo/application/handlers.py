"""Handlers de consulta geográfica."""
from __future__ import annotations

from app.modules.geo.application.mappers import ciudad_a_dict, comuna_a_dict, region_a_dict
from app.modules.geo.domain.ports import IGeografiaRepository


class ListarRegionesQueryHandler:
    def __init__(self, repo: IGeografiaRepository):
        self._repo = repo

    async def handle(self) -> list[dict]:
        return [region_a_dict(r) for r in await self._repo.listar_regiones()]


class ListarCiudadesQueryHandler:
    def __init__(self, repo: IGeografiaRepository):
        self._repo = repo

    async def handle(self, region_id: int | None = None) -> list[dict]:
        return [ciudad_a_dict(c) for c in await self._repo.listar_ciudades(region_id)]


class ListarComunasQueryHandler:
    def __init__(self, repo: IGeografiaRepository):
        self._repo = repo

    async def handle(
        self, ciudad_id: int | None = None, region_id: int | None = None
    ) -> list[dict]:
        return [
            comuna_a_dict(c)
            for c in await self._repo.listar_comunas(ciudad_id, region_id)
        ]
