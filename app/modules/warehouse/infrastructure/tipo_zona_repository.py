"""Adaptador CRUD de tipos de zona."""
from app.modules.warehouse.infrastructure.tipo_zona_crud import TipoZonaCRUDRepository as SqlAlchemyTipoZonaRepository

__all__ = ["SqlAlchemyTipoZonaRepository"]
