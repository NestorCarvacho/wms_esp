"""Endpoints de presentaciones comerciales de producto."""
from fastapi import APIRouter, Depends, HTTPException, status

from app.bootstrap.catalog_container import CatalogHandlers
from app.modules.catalog.presentation.http.dependencies import obtener_catalog_handlers
from app.api.v1.empresa_contexto import ContextoEmpresa, obtener_contexto_empresa
from app.schemas.producto_presentacion import (
    ProductoPresentacionCrearDTO,
    ProductoPresentacionActualizarDTO,
    VentaDescuentoDTO,
    RespuestaAPIDTO,
)

router = APIRouter(prefix="/api/v1", tags=["Presentaciones de Producto"])


async def _empresa_para_producto(
    producto_id: int,
    ctx: ContextoEmpresa,
    handlers: CatalogHandlers,
) -> int:
    return await handlers.presentaciones.resolver_empresa_producto(
        producto_id,
        ctx.empresa_usuario_id,
        ctx.es_empresa_maestra,
        ctx.empresas_administradas_ids,
    )


async def _empresa_para_presentacion(
    presentacion_id: int,
    ctx: ContextoEmpresa,
    handlers: CatalogHandlers,
) -> int:
    return await handlers.presentaciones.resolver_empresa_presentacion(
        presentacion_id,
        ctx.empresa_usuario_id,
        ctx.es_empresa_maestra,
        ctx.empresas_administradas_ids,
    )


@router.get(
    "/productos/{producto_id}/presentaciones",
    response_model=RespuestaAPIDTO,
    status_code=status.HTTP_200_OK,
)
async def listar_presentaciones(
    producto_id: int,
    pagina: int = 1,
    por_pagina: int = 50,
    buscar: str | None = None,
    ctx: ContextoEmpresa = Depends(obtener_contexto_empresa),
    handlers: CatalogHandlers = Depends(obtener_catalog_handlers),
):
    try:
        empresa_id = await _empresa_para_producto(producto_id, ctx, handlers)
        resultado = await handlers.presentaciones.listar(
            producto_id=producto_id,
            empresa_id=empresa_id,
            pagina=pagina,
            por_pagina=por_pagina,
            buscar=buscar,
        )
        return RespuestaAPIDTO(
            exito=True,
            datos=resultado,
            mensaje=f"Se encontraron {resultado['total']} presentaciones",
        ).dict()
    except ValueError as e:
        msg = str(e)
        if "no autorizado" in msg.lower():
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=msg)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=msg)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get(
    "/productos/barcode/{codigo}",
    response_model=RespuestaAPIDTO,
    status_code=status.HTTP_200_OK,
)
async def resolver_barcode(
    codigo: str,
    ctx: ContextoEmpresa = Depends(obtener_contexto_empresa),
    handlers: CatalogHandlers = Depends(obtener_catalog_handlers),
):
    try:
        resultado = await handlers.presentaciones.buscar_barcode(
            ctx.empresa_usuario_id, codigo.strip()
        )
        if resultado is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Código de barras '{codigo}' no encontrado",
            )
        return RespuestaAPIDTO(exito=True, datos=resultado, mensaje="Código resuelto").dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post(
    "/productos/{producto_id}/presentaciones",
    response_model=RespuestaAPIDTO,
    status_code=status.HTTP_201_CREATED,
)
async def crear_presentacion(
    producto_id: int,
    dto: ProductoPresentacionCrearDTO,
    ctx: ContextoEmpresa = Depends(obtener_contexto_empresa),
    handlers: CatalogHandlers = Depends(obtener_catalog_handlers),
):
    try:
        empresa_id = await _empresa_para_producto(producto_id, ctx, handlers)
        datos = await handlers.presentaciones.crear(
            producto_id=producto_id,
            empresa_id=empresa_id,
            nombre=dto.nombre,
            codigo_barras=dto.codigo_barras,
            cantidad_contenida=dto.cantidad_contenida,
            unidad_medida_id=dto.unidad_medida_id,
            precio_costo=dto.precio_costo,
            precio_venta=dto.precio_venta,
            permite_venta_unidad=bool(dto.permite_venta_unidad),
            permite_venta_presentacion=bool(dto.permite_venta_presentacion),
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Presentación creada").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put(
    "/producto-presentaciones/{presentacion_id}",
    response_model=RespuestaAPIDTO,
    status_code=status.HTTP_200_OK,
)
async def actualizar_presentacion(
    presentacion_id: int,
    dto: ProductoPresentacionActualizarDTO,
    ctx: ContextoEmpresa = Depends(obtener_contexto_empresa),
    handlers: CatalogHandlers = Depends(obtener_catalog_handlers),
):
    try:
        payload = dto.model_dump(exclude_unset=True)
        empresa_id = await _empresa_para_presentacion(presentacion_id, ctx, handlers)
        datos = await handlers.presentaciones.actualizar(
            presentacion_id=presentacion_id,
            empresa_id=empresa_id,
            **payload,
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Presentación actualizada").dict()
    except ValueError as e:
        msg = str(e)
        code = status.HTTP_404_NOT_FOUND if "no encontrada" in msg.lower() else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=code, detail=msg)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete(
    "/producto-presentaciones/{presentacion_id}",
    response_model=RespuestaAPIDTO,
    status_code=status.HTTP_200_OK,
)
async def eliminar_presentacion(
    presentacion_id: int,
    ctx: ContextoEmpresa = Depends(obtener_contexto_empresa),
    handlers: CatalogHandlers = Depends(obtener_catalog_handlers),
):
    try:
        empresa_id = await _empresa_para_presentacion(presentacion_id, ctx, handlers)
        resultado = await handlers.presentaciones.eliminar(presentacion_id, empresa_id)
        return RespuestaAPIDTO(exito=True, datos=resultado, mensaje="Presentación eliminada").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post(
    "/inventario/calcular-descuento",
    response_model=RespuestaAPIDTO,
    status_code=status.HTTP_200_OK,
)
async def calcular_descuento_inventario(
    dto: VentaDescuentoDTO,
    ctx: ContextoEmpresa = Depends(obtener_contexto_empresa),
    handlers: CatalogHandlers = Depends(obtener_catalog_handlers),
):
    try:
        empresa_id = await _empresa_para_presentacion(dto.presentacion_id, ctx, handlers)
        datos = await handlers.presentaciones.calcular_descuento(
            presentacion_id=dto.presentacion_id,
            empresa_id=empresa_id,
            cantidad=dto.cantidad,
            venta_por_presentacion=dto.venta_por_presentacion,
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Descuento calculado").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
