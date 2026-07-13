"""Endpoints CRUD de Tipos de Producto."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.catalog_container import CatalogHandlers
from app.infrastructure.database import get_db_session
from app.modules.catalog.application.commands import ActualizarTipoProductoCommand, CrearTipoProductoCommand
from app.modules.catalog.presentation.http.dependencies import obtener_catalog_handlers
from app.api.v1.dependencies import obtener_usuario_autenticado, requiere_permiso, es_super_admin
from app.api.v1.empresa_contexto import (
    ContextoEmpresa,
    kwargs_listado,
    obtener_contexto_empresa,
    contexto_requiere_permiso,
    resolver_empresa_creacion,
)
from app.api.v1.listado_query import orden_listado
from app.schemas.tipo_producto import TipoProductoCrearDTO, TipoProductoActualizarDTO, RespuestaAPIDTO

router = APIRouter(prefix="/api/v1/tipos-producto", tags=["Tipos de Producto"])


@router.get("", response_model=RespuestaAPIDTO, status_code=status.HTTP_200_OK)
async def listar_tipos_producto(
    pagina: int = 1,
    por_pagina: int = 10,
    buscar: str | None = None,
    orden_params: dict = Depends(orden_listado),
    ctx: ContextoEmpresa = Depends(obtener_contexto_empresa),
    handlers: CatalogHandlers = Depends(obtener_catalog_handlers),
):
    try:
        resultado = await handlers.listar_tipos_producto.handle(
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
            mensaje=f"Se encontraron {resultado['total']} tipos de producto",
        ).dict()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{id}", response_model=RespuestaAPIDTO, status_code=status.HTTP_200_OK)
async def obtener_tipo_producto(
    id: int,
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("tipos_producto.leer")),
    handlers: CatalogHandlers = Depends(obtener_catalog_handlers),
):
    try:
        empresa_id = None if ctx.es_empresa_maestra else ctx.empresa_usuario_id
        datos = await handlers.obtener_tipo_producto.handle(id, empresa_id)
        ctx.verificar_acceso_a_empresa(datos["empresa_id"], mensaje="Acceso denegado")
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Tipo de producto recuperado").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("", response_model=RespuestaAPIDTO, status_code=status.HTTP_201_CREATED)
async def crear_tipo_producto(
    dto: TipoProductoCrearDTO,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    session: AsyncSession = Depends(get_db_session),
    handlers: CatalogHandlers = Depends(obtener_catalog_handlers),
):
    try:
        empresa_destino = await resolver_empresa_creacion(
            usuario_autenticado, dto.empresa_id, session
        )
        datos = await handlers.crear_tipo_producto.handle(
            CrearTipoProductoCommand(
                empresa_id=empresa_destino,
                nombre=dto.nombre,
                activo=True,
            )
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Tipo de producto creado").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/{id}", response_model=RespuestaAPIDTO, status_code=status.HTTP_200_OK)
async def actualizar_tipo_producto(
    id: int,
    dto: TipoProductoActualizarDTO,
    usuario_autenticado: dict = Depends(requiere_permiso("tipos_producto.editar")),
    handlers: CatalogHandlers = Depends(obtener_catalog_handlers),
):
    try:
        datos = await handlers.actualizar_tipo_producto.handle(
            ActualizarTipoProductoCommand(
                tipo_producto_id=id,
                empresa_id=usuario_autenticado.get("empresa_id"),
                nombre=dto.nombre,
                activo=bool(dto.activo) if dto.activo is not None else None,
            )
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Tipo de producto actualizado").dict()
    except ValueError as e:
        msg = str(e)
        code = status.HTTP_404_NOT_FOUND if "no encontrado" in msg.lower() else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=code, detail=msg)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{id}", response_model=RespuestaAPIDTO, status_code=status.HTTP_200_OK)
async def eliminar_tipo_producto(
    id: int,
    usuario_autenticado: dict = Depends(requiere_permiso("tipos_producto.eliminar")),
    handlers: CatalogHandlers = Depends(obtener_catalog_handlers),
):
    try:
        resultado = await handlers.eliminar_tipo_producto.handle(id, usuario_autenticado.get("empresa_id"))
        return RespuestaAPIDTO(exito=True, datos=resultado, mensaje="Tipo de producto eliminado").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
