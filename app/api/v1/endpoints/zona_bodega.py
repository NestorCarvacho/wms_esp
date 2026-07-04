"""Endpoints CRUD de Zonas de Bodega."""
from fastapi import APIRouter, Depends, HTTPException, status

from app.bootstrap.warehouse_container import WarehouseHandlers
from app.modules.warehouse.application.commands import ActualizarZonaBodegaCommand, CrearZonaBodegaCommand
from app.modules.warehouse.presentation.http.dependencies import obtener_warehouse_handlers
from app.api.v1.dependencies import requiere_permiso, es_super_admin
from app.api.v1.empresa_contexto import ContextoEmpresa, kwargs_listado, obtener_contexto_empresa
from app.api.v1.listado_query import orden_listado
from app.schemas.zona_bodega import ZonaBodegaCrearDTO, ZonaBodegaActualizarDTO, RespuestaAPIDTO

router = APIRouter(prefix="/api/v1/zonas-bodega", tags=["Zonas de Bodega"])


@router.get("", response_model=RespuestaAPIDTO, status_code=status.HTTP_200_OK)
async def listar_zonas_bodega(
    pagina: int = 1,
    por_pagina: int = 10,
    bodega_id: int | None = None,
    buscar: str | None = None,
    orden_params: dict = Depends(orden_listado),
    ctx: ContextoEmpresa = Depends(obtener_contexto_empresa),
    handlers: WarehouseHandlers = Depends(obtener_warehouse_handlers),
):
    try:
        resultado = await handlers.listar_zonas_bodega.handle(
            empresa_id=ctx.empresa_usuario_id,
            pagina=pagina,
            por_pagina=por_pagina,
            bodega_id=bodega_id,
            buscar=buscar,
            **kwargs_listado(ctx),
            **orden_params,
        )
        return RespuestaAPIDTO(
            exito=True,
            datos=resultado,
            mensaje=f"Se encontraron {resultado['total']} zonas de bodega",
        ).dict()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{id}", response_model=RespuestaAPIDTO, status_code=status.HTTP_200_OK)
async def obtener_zona_bodega(
    id: int,
    usuario_autenticado: dict = Depends(requiere_permiso("zonas_bodega.leer")),
    es_admin: bool = Depends(es_super_admin),
    handlers: WarehouseHandlers = Depends(obtener_warehouse_handlers),
):
    try:
        empresa_filtro = None if es_admin else usuario_autenticado.get("empresa_id")
        datos = await handlers.obtener_zona_bodega.handle(id, empresa_filtro)
        if not es_admin and datos.get("empresa_id") != usuario_autenticado.get("empresa_id"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Zona de bodega recuperada").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("", response_model=RespuestaAPIDTO, status_code=status.HTTP_201_CREATED)
async def crear_zona_bodega(
    dto: ZonaBodegaCrearDTO,
    usuario_autenticado: dict = Depends(requiere_permiso("zonas_bodega.crear")),
    es_admin: bool = Depends(es_super_admin),
    handlers: WarehouseHandlers = Depends(obtener_warehouse_handlers),
):
    try:
        datos = await handlers.crear_zona_bodega.handle(
            CrearZonaBodegaCommand(
                empresa_id=usuario_autenticado.get("empresa_id"),
                bodega_id=dto.bodega_id,
                tipo_zona_id=dto.tipo_zona_id,
                nombre=dto.nombre,
                activo=bool(dto.activo),
                es_super_admin=es_admin,
            )
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Zona de bodega creada").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/{id}", response_model=RespuestaAPIDTO, status_code=status.HTTP_200_OK)
async def actualizar_zona_bodega(
    id: int,
    dto: ZonaBodegaActualizarDTO,
    usuario_autenticado: dict = Depends(requiere_permiso("zonas_bodega.editar")),
    es_admin: bool = Depends(es_super_admin),
    handlers: WarehouseHandlers = Depends(obtener_warehouse_handlers),
):
    try:
        datos = await handlers.actualizar_zona_bodega.handle(
            ActualizarZonaBodegaCommand(
                zona_id=id,
                empresa_id=usuario_autenticado.get("empresa_id"),
                bodega_id=dto.bodega_id,
                tipo_zona_id=dto.tipo_zona_id,
                nombre=dto.nombre,
                activo=bool(dto.activo) if dto.activo is not None else None,
                es_super_admin=es_admin,
            )
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Zona de bodega actualizada").dict()
    except ValueError as e:
        msg = str(e)
        code = status.HTTP_404_NOT_FOUND if "no encontrada" in msg.lower() else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=code, detail=msg)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{id}", response_model=RespuestaAPIDTO, status_code=status.HTTP_200_OK)
async def eliminar_zona_bodega(
    id: int,
    usuario_autenticado: dict = Depends(requiere_permiso("zonas_bodega.eliminar")),
    es_admin: bool = Depends(es_super_admin),
    handlers: WarehouseHandlers = Depends(obtener_warehouse_handlers),
):
    try:
        resultado = await handlers.eliminar_zona_bodega.handle(
            id,
            usuario_autenticado.get("empresa_id"),
            es_super_admin=es_admin,
        )
        return RespuestaAPIDTO(exito=True, datos=resultado, mensaje="Zona de bodega eliminada").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
