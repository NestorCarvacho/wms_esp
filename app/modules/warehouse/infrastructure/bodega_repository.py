"""Adaptador CRUD de bodegas."""
from app.modules.warehouse.infrastructure.bodega_crud import BodegaCRUDRepository as SqlAlchemyBodegaRepository

__all__ = ["SqlAlchemyBodegaRepository"]
