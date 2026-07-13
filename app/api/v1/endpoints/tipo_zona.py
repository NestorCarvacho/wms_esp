"""Endpoints CRUD de Tipos de Zona."""
from fastapi import APIRouter, Depends, HTTPException, status

from app.bootstrap.warehouse_container import WarehouseHandlers
from app.modules.warehouse.application.commands import ActualizarTipoZonaCommand, CrearTipoZonaCommand
from app.modules.warehouse.presentation.http.dependencies import obtener_warehouse_handlers
from app.api.v1.dependencies import requiere_permiso, es_super_admin
from app.api.v1.empresa_contexto import ContextoEmpresa, kwargs_listado, obtener_contexto_empresa, contexto_requiere_permiso
from app.api.v1.listado_query import orden_listado
from app.schemas.tipo_zona import TipoZonaCrearDTO, TipoZonaActualizarDTO, RespuestaAPIDTO

router = APIRouter(prefix="/api/v1/tipos-zona", tags=["Tipos de Zona"])


@router.get("", response_model=RespuestaAPIDTO, status_code=status.HTTP_200_OK)
async def listar_tipos_zona(
    pagina: int = 1,
    por_pagina: int = 10,
    buscar: str | None = None,
    orden_params: dict = Depends(orden_listado),
    ctx: ContextoEmpresa = Depends(obtener_contexto_empresa),
    handlers: WarehouseHandlers = Depends(obtener_warehouse_handlers),
):
    try:
        resultado = await handlers.listar_tipos_zona.handle(
            empresa_id=ctx.empresa_usuario_id,
            pagina=pagina,
            por_pagina=por_pagina,
            buscar=buscar,
            **kwargs_listado(ctx),
            **orden_params,
        )
        return RespuestaAPIDTO(
            exito=True,
            datos=resultado,
            mensaje=f"Se encontraron {resultado['total']} tipos de zona",
        ).dict()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{id}", response_model=RespuestaAPIDTO, status_code=status.HTTP_200_OK)
async def obtener_tipo_zona(
    id: int,
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("tipos_zona.leer")),
    handlers: WarehouseHandlers = Depends(obtener_warehouse_handlers),
):
    try:
        empresa_id = None if ctx.es_empresa_maestra else ctx.empresa_usuario_id
        datos = await handlers.obtener_tipo_zona.handle(id, empresa_id)
        ctx.verificar_acceso_a_empresa(datos["empresa_id"], mensaje="Acceso denegado")
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Tipo de zona recuperado").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("", response_model=RespuestaAPIDTO, status_code=status.HTTP_201_CREATED)
async def crear_tipo_zona(
    dto: TipoZonaCrearDTO,
    usuario_autenticado: dict = Depends(requiere_permiso("tipos_zona.crear")),
    handlers: WarehouseHandlers = Depends(obtener_warehouse_handlers),
):
    try:
        datos = await handlers.crear_tipo_zona.handle(
            CrearTipoZonaCommand(
                empresa_id=usuario_autenticado.get("empresa_id"),
                nombre=dto.nombre,
                activo=True,
            )
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Tipo de zona creado").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/{id}", response_model=RespuestaAPIDTO, status_code=status.HTTP_200_OK)
async def actualizar_tipo_zona(
    id: int,
    dto: TipoZonaActualizarDTO,
    usuario_autenticado: dict = Depends(requiere_permiso("tipos_zona.editar")),
    handlers: WarehouseHandlers = Depends(obtener_warehouse_handlers),
):
    try:
        datos = await handlers.actualizar_tipo_zona.handle(
            ActualizarTipoZonaCommand(
                tipo_zona_id=id,
                empresa_id=usuario_autenticado.get("empresa_id"),
                nombre=dto.nombre,
                activo=bool(dto.activo) if dto.activo is not None else None,
            )
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Tipo de zona actualizado").dict()
    except ValueError as e:
        msg = str(e)
        code = status.HTTP_404_NOT_FOUND if "no encontrado" in msg.lower() else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=code, detail=msg)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{id}", response_model=RespuestaAPIDTO, status_code=status.HTTP_200_OK)
async def eliminar_tipo_zona(
    id: int,
    usuario_autenticado: dict = Depends(requiere_permiso("tipos_zona.eliminar")),
    handlers: WarehouseHandlers = Depends(obtener_warehouse_handlers),
):
    try:
        resultado = await handlers.eliminar_tipo_zona.handle(id, usuario_autenticado.get("empresa_id"))
        return RespuestaAPIDTO(exito=True, datos=resultado, mensaje="Tipo de zona eliminado").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
