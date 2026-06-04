"""Endpoints de inventario operativo (stock, movimientos, operaciones)."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database import get_db_session
from app.infrastructure.repositories.inventario_crud_repository import InventarioCRUDRepository
from app.domain.services.inventario_operacion_service import InventarioOperacionService
from app.api.v1.dependencies import obtener_id
from app.api.v1.empresa_contexto import ContextoEmpresa, kwargs_listado, contexto_requiere_permiso
from app.schemas.inventario import (
    RespuestaAPIDTO,
    RecepcionDTO,
    TrasladoDTO,
    DespachoDTO,
    BodegaConfigActualizarDTO,
)

router = APIRouter(prefix="/api/v1/inventario", tags=["Inventario"])


async def obtener_inventario_service(
    session: AsyncSession = Depends(get_db_session),
) -> InventarioOperacionService:
    return InventarioOperacionService(InventarioCRUDRepository(session))


@router.get("/stock", response_model=RespuestaAPIDTO, status_code=status.HTTP_200_OK)
async def listar_stock(
    pagina: int = 1,
    por_pagina: int = 50,
    bodega_id: int | None = None,
    producto_id: int | None = None,
    zona_bodega_id: int | None = None,
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("inventario.leer")),
    service: InventarioOperacionService = Depends(obtener_inventario_service),
):
    try:
        resultado = await service.listar_stock(
            empresa_id=ctx.empresa_usuario_id,
            pagina=pagina,
            por_pagina=por_pagina,
            bodega_id=bodega_id,
            producto_id=producto_id,
            zona_bodega_id=zona_bodega_id,
            **kwargs_listado(ctx),
        )
        return RespuestaAPIDTO(
            exito=True,
            datos=resultado,
            mensaje=f"Se encontraron {resultado['total']} registros de stock",
        ).dict()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/movimientos", response_model=RespuestaAPIDTO, status_code=status.HTTP_200_OK)
async def listar_movimientos(
    pagina: int = 1,
    por_pagina: int = 50,
    producto_id: int | None = None,
    tipo: str | None = Query(None, description="RECEPCION | TRASLADO | DESPACHO"),
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("inventario.leer")),
    service: InventarioOperacionService = Depends(obtener_inventario_service),
):
    try:
        resultado = await service.listar_movimientos(
            empresa_id=ctx.empresa_usuario_id,
            pagina=pagina,
            por_pagina=por_pagina,
            producto_id=producto_id,
            tipo=tipo,
            **kwargs_listado(ctx),
        )
        return RespuestaAPIDTO(
            exito=True,
            datos=resultado,
            mensaje=f"Se encontraron {resultado['total']} movimientos",
        ).dict()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/recepcion", response_model=RespuestaAPIDTO, status_code=status.HTTP_201_CREATED)
async def recepcionar(
    dto: RecepcionDTO,
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("inventario.recepcionar")),
    usuario_id: int = Depends(obtener_id),
    service: InventarioOperacionService = Depends(obtener_inventario_service),
):
    try:
        datos = await service.recepcionar(
            empresa_id=ctx.empresa_operacion(),
            usuario_id=usuario_id,
            bodega_id=dto.bodega_id,
            producto_id=dto.producto_id,
            cantidad=dto.cantidad,
            zona_destino_id=dto.zona_destino_id,
            presentacion_id=dto.presentacion_id,
            venta_por_presentacion=dto.venta_por_presentacion,
            documento_tipo=dto.documento_tipo,
            documento_folio=dto.documento_folio,
            observaciones=dto.observaciones,
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Recepción registrada").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/traslado", response_model=RespuestaAPIDTO, status_code=status.HTTP_201_CREATED)
async def trasladar(
    dto: TrasladoDTO,
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("inventario.trasladar")),
    usuario_id: int = Depends(obtener_id),
    service: InventarioOperacionService = Depends(obtener_inventario_service),
):
    try:
        datos = await service.trasladar(
            empresa_id=ctx.empresa_operacion(),
            usuario_id=usuario_id,
            producto_id=dto.producto_id,
            cantidad=dto.cantidad,
            zona_origen_id=dto.zona_origen_id,
            zona_destino_id=dto.zona_destino_id,
            presentacion_id=dto.presentacion_id,
            venta_por_presentacion=dto.venta_por_presentacion,
            documento_tipo=dto.documento_tipo,
            documento_folio=dto.documento_folio,
            observaciones=dto.observaciones,
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Traslado registrado").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/despacho", response_model=RespuestaAPIDTO, status_code=status.HTTP_201_CREATED)
async def despachar(
    dto: DespachoDTO,
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("inventario.despachar")),
    usuario_id: int = Depends(obtener_id),
    service: InventarioOperacionService = Depends(obtener_inventario_service),
):
    try:
        datos = await service.despachar(
            empresa_id=ctx.empresa_operacion(),
            usuario_id=usuario_id,
            producto_id=dto.producto_id,
            cantidad=dto.cantidad,
            zona_origen_id=dto.zona_origen_id,
            presentacion_id=dto.presentacion_id,
            venta_por_presentacion=dto.venta_por_presentacion,
            documento_tipo=dto.documento_tipo,
            documento_folio=dto.documento_folio,
            observaciones=dto.observaciones,
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Despacho registrado").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get(
    "/bodegas/{bodega_id}/configuracion",
    response_model=RespuestaAPIDTO,
    status_code=status.HTTP_200_OK,
)
async def obtener_config_bodega(
    bodega_id: int,
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("inventario.leer")),
    service: InventarioOperacionService = Depends(obtener_inventario_service),
):
    try:
        datos = await service.obtener_config_bodega(bodega_id, ctx.empresa_operacion())
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Configuración de bodega").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put(
    "/bodegas/{bodega_id}/configuracion",
    response_model=RespuestaAPIDTO,
    status_code=status.HTTP_200_OK,
)
async def actualizar_config_bodega(
    bodega_id: int,
    dto: BodegaConfigActualizarDTO,
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("inventario.configurar")),
    service: InventarioOperacionService = Depends(obtener_inventario_service),
):
    try:
        datos = await service.actualizar_config_bodega(
            bodega_id,
            ctx.empresa_operacion(),
            dto.zona_recepcion_default_id,
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Configuración actualizada").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
