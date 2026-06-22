"""Endpoints de geografía de Chile: regiones, ciudades, comunas."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from pydantic import BaseModel

from app.infrastructure.database import get_db_session
from app.infrastructure.models.usuario import Region, Ciudad, Comuna

router = APIRouter(prefix="/api/v1/geografia", tags=["Geografía"])


class RegionDTO(BaseModel):
    id: int
    nombre: str
    codigo: str
    class Config:
        from_attributes = True


class CiudadDTO(BaseModel):
    id: int
    region_id: int
    nombre: str
    class Config:
        from_attributes = True


class ComunaDTO(BaseModel):
    id: int
    region_id: int
    ciudad_id: int
    nombre: str
    class Config:
        from_attributes = True


@router.get("/regiones", response_model=list[RegionDTO], summary="Listar todas las regiones de Chile")
async def listar_regiones(session: AsyncSession = Depends(get_db_session)):
    result = await session.execute(select(Region).where(Region.activo == True).order_by(Region.nombre))
    return result.scalars().all()


@router.get("/ciudades", response_model=list[CiudadDTO], summary="Listar ciudades, opcionalmente filtradas por región")
async def listar_ciudades(
    region_id: Optional[int] = Query(None, description="Filtrar por ID de región"),
    session: AsyncSession = Depends(get_db_session),
):
    query = select(Ciudad).where(Ciudad.activo == True).order_by(Ciudad.nombre)
    if region_id:
        query = query.where(Ciudad.region_id == region_id)
    result = await session.execute(query)
    return result.scalars().all()


@router.get("/comunas", response_model=list[ComunaDTO], summary="Listar comunas, opcionalmente filtradas por ciudad o región")
async def listar_comunas(
    ciudad_id: Optional[int] = Query(None, description="Filtrar por ID de ciudad"),
    region_id: Optional[int] = Query(None, description="Filtrar por ID de región"),
    session: AsyncSession = Depends(get_db_session),
):
    query = select(Comuna).where(Comuna.activo == True).order_by(Comuna.nombre)
    if ciudad_id:
        query = query.where(Comuna.ciudad_id == ciudad_id)
    elif region_id:
        query = query.where(Comuna.region_id == region_id)
    result = await session.execute(query)
    return result.scalars().all()
