"""Endpoints de presentaciones comerciales de producto."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database import get_db_session
from app.infrastructure.repositories.producto_presentacion_crud_repository import (
    ProductoPresentacionCRUDRepository,
)
from app.infrastructure.repositories.producto_crud_repository import ProductoCRUDRepository
from app.infrastructure.repositories.unidadMedida_crud_repository import UnidadMedidaCRUDRepository
from app.domain.services.producto_presentacion_service import ProductoPresentacionService
from app.api.v1.dependencies import obtener_usuario_autenticado
from app.api.v1.empresa_contexto import ContextoEmpresa, obtener_contexto_empresa
from app.schemas.producto_presentacion import (
    ProductoPresentacionCrearDTO,
    ProductoPresentacionActualizarDTO,
    VentaDescuentoDTO,
    RespuestaAPIDTO,
)

router = APIRouter(prefix="/api/v1", tags=["Presentaciones de Producto"])


async def obtener_presentacion_service(
    session: AsyncSession = Depends(get_db_session),
) -> ProductoPresentacionService:
    return ProductoPresentacionService(
        ProductoPresentacionCRUDRepository(session),
        ProductoCRUDRepository(session),
        UnidadMedidaCRUDRepository(session),
    )


def _empresa_operacion(ctx: ContextoEmpresa) -> int:
    return ctx.empresa_operacion()


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
    service: ProductoPresentacionService = Depends(obtener_presentacion_service),
):
    try:
        resultado = await service.listar_presentaciones(
            producto_id=producto_id,
            empresa_id=_empresa_operacion(ctx),
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
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
    service: ProductoPresentacionService = Depends(obtener_presentacion_service),
):
    try:
        datos = await service.crear_presentacion(
            producto_id=producto_id,
            empresa_id=_empresa_operacion(ctx),
            nombre=dto.nombre,
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
    service: ProductoPresentacionService = Depends(obtener_presentacion_service),
):
    try:
        payload = dto.model_dump(exclude_unset=True)
        datos = await service.actualizar_presentacion(
            presentacion_id=presentacion_id,
            empresa_id=_empresa_operacion(ctx),
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
    service: ProductoPresentacionService = Depends(obtener_presentacion_service),
):
    try:
        resultado = await service.eliminar_presentacion(
            presentacion_id, _empresa_operacion(ctx)
        )
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
    service: ProductoPresentacionService = Depends(obtener_presentacion_service),
):
    """Calcula unidades base a descontar según tipo de venta (unidad o empaque)."""
    try:
        datos = await service.calcular_descuento_stock(
            presentacion_id=dto.presentacion_id,
            empresa_id=_empresa_operacion(ctx),
            cantidad=dto.cantidad,
            venta_por_presentacion=dto.venta_por_presentacion,
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Descuento calculado").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
