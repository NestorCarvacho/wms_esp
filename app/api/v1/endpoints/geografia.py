"""Endpoints de geografía de Chile: regiones, ciudades, comunas."""
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.modules.geo.presentation.http.dependencies import obtener_geo_handlers
from app.bootstrap.geo_container import GeoHandlers

router = APIRouter(prefix="/api/v1/geografia", tags=["Geografía"])


@router.get("/regiones", summary="Listar todas las regiones de Chile")
async def listar_regiones(handlers: GeoHandlers = Depends(obtener_geo_handlers)):
    return await handlers.listar_regiones.handle()


@router.get("/ciudades", summary="Listar ciudades, opcionalmente filtradas por región")
async def listar_ciudades(
    region_id: Optional[int] = Query(None, description="Filtrar por ID de región"),
    handlers: GeoHandlers = Depends(obtener_geo_handlers),
):
    return await handlers.listar_ciudades.handle(region_id)


@router.get("/comunas", summary="Listar comunas, opcionalmente filtradas por ciudad o región")
async def listar_comunas(
    ciudad_id: Optional[int] = Query(None, description="Filtrar por ID de ciudad"),
    region_id: Optional[int] = Query(None, description="Filtrar por ID de región"),
    handlers: GeoHandlers = Depends(obtener_geo_handlers),
):
    return await handlers.listar_comunas.handle(ciudad_id, region_id)
