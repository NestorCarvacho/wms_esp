"""Schemas para cargo_rol y sincronización."""
from pydantic import BaseModel, Field


class CargoRolSincronizarDTO(BaseModel):
    rol_ids: list[int] = Field(default_factory=list)
