"""Servicio CRUD de cargos — fachada IAM."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.container import build_iam_handlers
from app.infrastructure.repositories.cargo_crud_repository import CargoCRUDRepository
from app.modules.iam.application.commands_catalog import ActualizarCargoCommand, CrearCargoCommand


class CargoService:
    def __init__(
        self,
        repository: CargoCRUDRepository | None = None,
        session: AsyncSession | None = None,
    ):
        if session is None and repository is not None:
            session = repository.session
        elif session is None:
            raise ValueError("Se requiere session o repository")
        self._handlers = build_iam_handlers(session)

    async def listar_cargos(self, empresa_id: int, **kwargs: Any) -> dict[str, Any]:
        return await self._handlers.listar_cargos.handle(empresa_id, **kwargs)

    async def obtener_cargo(self, cargo_id: int, empresa_id: int = None) -> dict[str, Any]:
        return await self._handlers.obtener_cargo.handle(cargo_id, empresa_id)

    async def crear_cargo(self, empresa_id: int, nombre: str) -> dict[str, Any]:
        return await self._handlers.crear_cargo.handle(
            CrearCargoCommand(empresa_id=empresa_id, nombre=nombre)
        )

    async def actualizar_cargo(
        self, cargo_id: int, empresa_id: int, nombre: str = None
    ) -> dict[str, Any]:
        return await self._handlers.actualizar_cargo.handle(
            ActualizarCargoCommand(cargo_id=cargo_id, empresa_id=empresa_id, nombre=nombre)
        )

    async def eliminar_cargo(self, cargo_id: int, empresa_id: int) -> dict[str, Any]:
        return await self._handlers.eliminar_cargo.handle(cargo_id, empresa_id)
