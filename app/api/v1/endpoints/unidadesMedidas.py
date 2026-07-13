"""
Endpoints CRUD de Unidades de Medida (Capa de Presentación).
5 endpoints: GET (listar), GET (detalle), POST (crear), PUT (actualizar), DELETE (eliminar).
Multi-tenant con soporte para super admin.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.catalog_container import CatalogHandlers
from app.infrastructure.database import get_db_session
from app.modules.catalog.application.commands import ActualizarUnidadMedidaCommand, CrearUnidadMedidaCommand
from app.modules.catalog.presentation.http.dependencies import obtener_catalog_handlers
from app.api.v1.dependencies import obtener_usuario_autenticado, requiere_permiso, es_super_admin
from app.api.v1.empresa_contexto import ContextoEmpresa, kwargs_listado, obtener_contexto_empresa, resolver_empresa_creacion, contexto_requiere_permiso
from app.api.v1.listado_query import orden_listado
from app.schemas.unidadMedida import (
    UnidadMedidaCrearDTO,
    UnidadMedidaActualizarDTO,
    UnidadMedidaRespuestaDTO,
    UnidadMedidaListaDTO,
    RespuestaAPIDTO
)


router = APIRouter(prefix="/api/v1/unidades-medida", tags=["Unidades de Medida"])


# ============ GET: LISTAR BODEGAS (CON PAGINACIÓN) ============
@router.get(
    "",
    response_model=RespuestaAPIDTO,
    summary="Listar productos con paginación",
    status_code=status.HTTP_200_OK
)
async def listar_Productos(
    pagina: int = 1,
    por_pagina: int = 10,
    buscar: str | None = None,
    orden_params: dict = Depends(orden_listado),
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("unidades_medida.leer")),
    handlers: CatalogHandlers = Depends(obtener_catalog_handlers),
):
    """
    Obtiene la lista de unidades de medida.
    
    **Comportamiento multi-tenant:**
    - Super admin (empresa_id=1): Ve TODOS las unidades de medida de todas las empresas
    - Usuario normal: Ve solo unidades de medida de su empresa
    
    **Parámetros:**
    - pagina: Número de página (por defecto 1)
    - por_pagina: Unidades de medida por página (por defecto 10)
    
    **Respuesta:**
    - Retorna lista paginada de unidades de medida
    
    **Permisos:**
    - Requiere autenticación JWT
    """
    try:
        resultado = await handlers.listar_unidades_medida.handle(
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
            mensaje=f"Se encontraron {resultado['total']} unidades de medida"
        ).dict()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ GET: OBTENER BODEGA POR ID ============
@router.get(
    "/{id}",
    response_model=RespuestaAPIDTO,
    summary="Obtener unidad de medida por ID",
    status_code=status.HTTP_200_OK
)
async def obtener_UnidadMedida(
    id: int,
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("unidades_medida.leer")),
    handlers: CatalogHandlers = Depends(obtener_catalog_handlers),
):
    """
    Obtiene los datos de una unidad de medida específica.
    
    **Comportamiento multi-tenant:**
    - Super admin: Puede obtener cualquier unidad de medida
    - Usuario normal: Solo puede ver unidades de medida de su empresa
    
    **Parámetros:**
    - id: ID de la unidad de medida a recuperar
    
    **Respuesta:**
    - Datos completos de la unidad de medida
    
    **Permisos:**
    - Requiere autenticación JWT
    """
    try:
        unidad_medida_empresa_id = None if ctx.es_empresa_maestra else ctx.empresa_usuario_id
        unidad_medida = await handlers.obtener_unidad_medida.handle(id, unidad_medida_empresa_id)
        ctx.verificar_acceso_a_empresa(
            unidad_medida["empresa_id"],
            mensaje="No tiene permiso para acceder a unidades de medida de otras empresas",
        )

        return RespuestaAPIDTO(
            exito=True,
            datos=unidad_medida,
            mensaje="Unidad de medida recuperada exitosamente"
        ).dict()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ POST: CREAR BODEGA ============
@router.post(
    "",
    response_model=RespuestaAPIDTO,
    summary="Crear nueva producto",
    status_code=status.HTTP_201_CREATED
)
async def crear_unidad_medida(
    unidad_medida_dto: UnidadMedidaCrearDTO,
    usuario_autenticado: dict = Depends(requiere_permiso("unidades_medida.crear")),
    session: AsyncSession = Depends(get_db_session),
    handlers: CatalogHandlers = Depends(obtener_catalog_handlers),
):
    """
    Crea un nueva unidad de medida en la empresa.
    
    **Comportamiento multi-tenant:**
    - Super admin: Puede crear unidades de medida en cualquier empresa (especificar en otro contexto)
    - Usuario normal: Solo puede crear en su propia empresa
    
    **Body:**
    - nombre: Nombre de la unidad de medida (1-100 caracteres, requerido)
    - codigo: Código de la unidad de medida (1-50 caracteres, requerido)
    - activo: Estado de la unidad de medida (booleano, opcional, por defecto True
    
    **Respuesta:**
    - Datos de la unidad de medida creada (status 201 Created)
    
    **Permisos:**
    - Requiere autenticación JWT
    - Usuario normal solo crea en su empresa
    - Super admin puede crear en cualquier empresa
    
    **Validaciones:**
    - Nombre no vacío (1-100 caracteres)
    - Nombre único por empresa
    """
    try:
        empresa_id = await resolver_empresa_creacion(
            usuario_autenticado, unidad_medida_dto.empresa_id, session
        )
        
        nueva_unidad_medida = await handlers.crear_unidad_medida.handle(
            CrearUnidadMedidaCommand(
                empresa_id=empresa_id,
                nombre=unidad_medida_dto.nombre,
                codigo=unidad_medida_dto.codigo,
                activo=unidad_medida_dto.activo,
            )
        )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=nueva_unidad_medida,
            mensaje="Unidad de medida creada exitosamente"
        ).dict()
    except ValueError as e:
        error_msg = str(e)
        if "duplicado" in error_msg.lower() or "ya existe" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ PUT: ACTUALIZAR BODEGA ============
@router.put(
    "/{id}",
    response_model=RespuestaAPIDTO,
    summary="Actualizar unidad de medida",
    status_code=status.HTTP_200_OK
)
async def actualizar_unidad_medida(
    id: int,
    actualizar_dto: UnidadMedidaActualizarDTO,
    usuario_autenticado: dict = Depends(requiere_permiso("unidades_medida.editar")),
    es_admin: bool = Depends(es_super_admin),
    handlers: CatalogHandlers = Depends(obtener_catalog_handlers),
):
    """
    Actualiza los datos de una unidad de medida existente.
    """
    try:
        empresa_id = usuario_autenticado.get("empresa_id")

        unidad_medida_actualizada = await handlers.actualizar_unidad_medida.handle(
            ActualizarUnidadMedidaCommand(
                unidad_medida_id=id,
                empresa_id=empresa_id,
                nombre=actualizar_dto.nombre,
                codigo=actualizar_dto.codigo,
                activo=actualizar_dto.activo,
            )
        )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=unidad_medida_actualizada,
            mensaje="Unidad de medida actualizada exitosamente"
        ).dict()
    except ValueError as e:
        error_msg = str(e)
        if "no encontrado" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error_msg
            )
        if "duplicado" in error_msg.lower() or "ya existe" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ DELETE: ELIMINAR BODEGA ============
@router.delete(
    "/{id}",
    response_model=RespuestaAPIDTO,
    summary="Eliminar unidad de medida",
    status_code=status.HTTP_200_OK
)
async def eliminar_unidad_medida(
    id: int,
    usuario_autenticado: dict = Depends(requiere_permiso("unidades_medida.eliminar")),
    es_admin: bool = Depends(es_super_admin),
    handlers: CatalogHandlers = Depends(obtener_catalog_handlers),
):
    """
    Elimina una unidad de medida.
    """
    try:
        empresa_id = usuario_autenticado.get("empresa_id")
        
        resultado = await handlers.eliminar_unidad_medida.handle(id, empresa_id)
        
        return RespuestaAPIDTO(
            exito=True,
            datos={"mensaje": resultado["mensaje"]},
            mensaje="Unidad de medida eliminada exitosamente"
        ).dict()
    except ValueError as e:
        error_msg = str(e)
        if "no encontrado" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error_msg
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
