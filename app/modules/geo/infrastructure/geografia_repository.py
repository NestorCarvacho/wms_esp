"""Adaptador SQLAlchemy — geografía Chile."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.models.usuario import Ciudad as CiudadORM
from app.infrastructure.models.usuario import Comuna as ComunaORM
from app.infrastructure.models.usuario import Region as RegionORM
from app.modules.geo.domain.entities import Ciudad, Comuna, Region


class SqlAlchemyGeografiaRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def listar_regiones(self) -> list[Region]:
        stmt = (
            select(RegionORM)
            .where(RegionORM.activo == True)  # noqa: E712
            .order_by(RegionORM.nombre)
        )
        rows = (await self._session.execute(stmt)).scalars().all()
        return [Region(id=r.id, nombre=r.nombre, codigo=r.codigo) for r in rows]

    async def listar_ciudades(self, region_id: int | None = None) -> list[Ciudad]:
        stmt = select(CiudadORM).where(CiudadORM.activo == True).order_by(CiudadORM.nombre)  # noqa: E712
        if region_id is not None:
            stmt = stmt.where(CiudadORM.region_id == region_id)
        rows = (await self._session.execute(stmt)).scalars().all()
        return [Ciudad(id=r.id, region_id=r.region_id, nombre=r.nombre) for r in rows]

    async def listar_comunas(
        self, ciudad_id: int | None = None, region_id: int | None = None
    ) -> list[Comuna]:
        stmt = select(ComunaORM).where(ComunaORM.activo == True).order_by(ComunaORM.nombre)  # noqa: E712
        if ciudad_id is not None:
            stmt = stmt.where(ComunaORM.ciudad_id == ciudad_id)
        elif region_id is not None:
            stmt = stmt.where(ComunaORM.region_id == region_id)
        rows = (await self._session.execute(stmt)).scalars().all()
        return [
            Comuna(id=r.id, region_id=r.region_id, ciudad_id=r.ciudad_id, nombre=r.nombre)
            for r in rows
        ]
