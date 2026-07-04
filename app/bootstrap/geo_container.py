"""Composition root del módulo geo."""
from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.geo.application.handlers import (
    ListarCiudadesQueryHandler,
    ListarComunasQueryHandler,
    ListarRegionesQueryHandler,
)
from app.modules.geo.infrastructure.geografia_repository import SqlAlchemyGeografiaRepository


@dataclass
class GeoHandlers:
    listar_regiones: ListarRegionesQueryHandler
    listar_ciudades: ListarCiudadesQueryHandler
    listar_comunas: ListarComunasQueryHandler


def build_geo_handlers(session: AsyncSession) -> GeoHandlers:
    repo = SqlAlchemyGeografiaRepository(session)
    return GeoHandlers(
        listar_regiones=ListarRegionesQueryHandler(repo),
        listar_ciudades=ListarCiudadesQueryHandler(repo),
        listar_comunas=ListarComunasQueryHandler(repo),
    )
