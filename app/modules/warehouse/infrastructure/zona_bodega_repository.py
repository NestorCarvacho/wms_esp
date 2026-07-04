"""Adaptador CRUD de zonas de bodega."""
from app.modules.warehouse.infrastructure.zona_bodega_crud import (
    ZonaBodegaCRUDRepository as SqlAlchemyZonaBodegaRepository,
)

__all__ = ["SqlAlchemyZonaBodegaRepository"]
