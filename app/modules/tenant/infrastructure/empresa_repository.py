"""Adaptador CRUD de empresas."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.repositories.empresa_crud_repository import EmpresaCRUDRepository


class SqlAlchemyEmpresaRepository:
    def __init__(self, session: AsyncSession):
        self._repo = EmpresaCRUDRepository(session)

    async def listar(self, **kwargs: Any) -> tuple[list[Any], int]:
        return await self._repo.listar(**kwargs)

    async def obtener_por_id(self, empresa_id: int) -> Any | None:
        return await self._repo.obtener_por_id(empresa_id)

    async def obtener_por_codigo(self, codigo: str) -> Any | None:
        return await self._repo.obtener_por_codigo(codigo)

    async def crear(self, codigo: str, razon_social: str, **kwargs: Any) -> Any:
        return await self._repo.crear(codigo=codigo, razon_social=razon_social, **kwargs)

    async def actualizar(self, empresa_id: int, **datos: Any) -> Any | None:
        return await self._repo.actualizar(empresa_id, **datos)

    async def eliminar(self, empresa_id: int) -> bool:
        return await self._repo.eliminar(empresa_id)
