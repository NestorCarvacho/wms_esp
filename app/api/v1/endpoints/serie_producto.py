"""Endpoints de inventario serializado (serie_producto)."""
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.bootstrap.container import InventoryHandlers
from app.modules.inventory.presentation.http.dependencies import obtener_inventory_handlers
from app.api.v1.dependencies import obtener_id
from app.api.v1.empresa_contexto import ContextoEmpresa, contexto_requiere_permiso
from app.schemas.inventario import RespuestaAPIDTO
from app.schemas.serie_producto import SerieRecepcionarDTO, SerieTrasladarDTO, SerieDespacharDTO

router = APIRouter(prefix="/api/v1/inventario/series", tags=["Inventario Serializado"])


@router.post("/recepcionar", response_model=RespuestaAPIDTO, status_code=status.HTTP_201_CREATED)
async def recepcionar_serie(
    dto: SerieRecepcionarDTO,
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("inventario.recepcionar")),
    usuario_id: int = Depends(obtener_id),
    handlers: InventoryHandlers = Depends(obtener_inventory_handlers),
):
    try:
        datos = await handlers.recepcionar_serie.handle(
            empresa_id=ctx.empresa_operacion(),
            usuario_id=usuario_id,
            producto_id=dto.producto_id,
            numero_serie=dto.numero_serie,
            bodega_id=dto.bodega_id,
            zona_destino_id=dto.zona_destino_id,
            documento_tipo=dto.documento_tipo,
            documento_folio=dto.documento_folio,
            observaciones=dto.observaciones,
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje=f"Serie '{dto.numero_serie}' recepcionada").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/trasladar", response_model=RespuestaAPIDTO, status_code=status.HTTP_201_CREATED)
async def trasladar_serie(
    dto: SerieTrasladarDTO,
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("inventario.trasladar")),
    usuario_id: int = Depends(obtener_id),
    handlers: InventoryHandlers = Depends(obtener_inventory_handlers),
):
    try:
        datos = await handlers.trasladar_serie.handle(
            empresa_id=ctx.empresa_operacion(),
            usuario_id=usuario_id,
            numero_serie=dto.numero_serie,
            zona_origen_id=dto.zona_origen_id,
            zona_destino_id=dto.zona_destino_id,
            documento_tipo=dto.documento_tipo,
            documento_folio=dto.documento_folio,
            observaciones=dto.observaciones,
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje=f"Serie '{dto.numero_serie}' trasladada").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/despachar", response_model=RespuestaAPIDTO, status_code=status.HTTP_201_CREATED)
async def despachar_serie(
    dto: SerieDespacharDTO,
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("inventario.despachar")),
    usuario_id: int = Depends(obtener_id),
    handlers: InventoryHandlers = Depends(obtener_inventory_handlers),
):
    try:
        datos = await handlers.despachar_serie.handle(
            empresa_id=ctx.empresa_operacion(),
            usuario_id=usuario_id,
            numero_serie=dto.numero_serie,
            zona_origen_id=dto.zona_origen_id,
            documento_tipo=dto.documento_tipo,
            documento_folio=dto.documento_folio,
            observaciones=dto.observaciones,
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje=f"Serie '{dto.numero_serie}' despachada").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{numero_serie}", response_model=RespuestaAPIDTO, status_code=status.HTTP_200_OK)
async def ubicar_serie(
    numero_serie: str,
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("inventario.leer")),
    handlers: InventoryHandlers = Depends(obtener_inventory_handlers),
):
    try:
        datos = await handlers.ubicar_serie.handle(ctx.empresa_operacion(), numero_serie)
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Serie encontrada").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get(
    "/producto/{producto_id}",
    response_model=RespuestaAPIDTO,
    status_code=status.HTTP_200_OK,
)
async def listar_series_producto(
    producto_id: int,
    estado: str | None = Query(None, description="EN_BODEGA | DESPACHADO | BAJA"),
    zona_bodega_id: int | None = None,
    pagina: int = 1,
    por_pagina: int = 50,
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("inventario.leer")),
    handlers: InventoryHandlers = Depends(obtener_inventory_handlers),
):
    try:
        datos = await handlers.listar_series_producto.handle(
            empresa_id=ctx.empresa_operacion(),
            producto_id=producto_id,
            estado=estado,
            zona_bodega_id=zona_bodega_id,
            pagina=pagina,
            por_pagina=por_pagina,
        )
        return RespuestaAPIDTO(
            exito=True, datos=datos, mensaje=f"{datos['total']} series encontradas"
        ).dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
