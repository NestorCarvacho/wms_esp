"""
Endpoints CRUD de Bodegas (Capa de Presentación).
5 endpoints: GET (listar), GET (detalle), POST (crear), PUT (actualizar), DELETE (eliminar).
Multi-tenant con soporte para super admin.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database import get_db_session
from app.infrastructure.repositories.bodega_crud_repository import BodegaCRUDRepository
from app.domain.services.bodega_service import BodegaService
from app.api.v1.dependencies import obtener_usuario_autenticado, requiere_permiso, es_super_admin
from app.api.v1.empresa_contexto import ContextoEmpresa, kwargs_listado, obtener_contexto_empresa, contexto_requiere_permiso
from app.schemas.bodega import (
    BodegaCrearDTO,
    BodegaActualizarDTO,
    BodegaRespuestaDTO,
    BodegaListaDTO,
    RespuestaAPIDTO
)


router = APIRouter(prefix="/api/v1/bodegas", tags=["Bodegas"])


# ============ DEPENDENCIAS ============
async def obtener_bodega_service(session: AsyncSession = Depends(get_db_session)) -> BodegaService:
    """Factory para instanciar el servicio de bodegas."""
    repository = BodegaCRUDRepository(session)
    return BodegaService(repository)


# ============ GET: LISTAR BODEGAS (CON PAGINACIÓN) ============
@router.get(
    "",
    response_model=RespuestaAPIDTO,
    summary="Listar bodegas con paginación",
    status_code=status.HTTP_200_OK
)
async def listar_Bodegas(
    pagina: int = 1,
    por_pagina: int = 10,
    buscar: str | None = None,
    ctx: ContextoEmpresa = Depends(obtener_contexto_empresa),
    service: BodegaService = Depends(obtener_bodega_service)
):
    """
    Obtiene la lista de bodegas.
    
    **Comportamiento multi-tenant:**
    - Super admin (empresa_id=1): Ve TODOS las bodegas de todas las empresas
    - Usuario normal: Ve solo bodegas de su empresa
    
    **Parámetros:**
    - pagina: Número de página (por defecto 1)
    - por_pagina: Bodegas por página (por defecto 10)
    
    **Respuesta:**
    - Retorna lista paginada de bodegas
    
    **Permisos:**
    - Requiere autenticación JWT
    """
    try:
        resultado = await service.listar_bodegas(
            empresa_id=ctx.empresa_usuario_id,
            pagina=pagina,
            por_pagina=por_pagina,
            buscar=buscar,
            **kwargs_listado(ctx),
        )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=resultado,
            mensaje=f"Se encontraron {resultado['total']} bodegas"
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
    summary="Obtener bodega por ID",
    status_code=status.HTTP_200_OK
)
async def obtener_bodega(
    id: int,
    usuario_autenticado: dict = Depends(requiere_permiso("bodegas.leer")),
    es_admin: bool = Depends(es_super_admin),
    service: BodegaService = Depends(obtener_bodega_service),
):
    """
    Obtiene los datos de una bodega específica.
    
    **Comportamiento multi-tenant:**
    - Super admin: Puede obtener cualquier bodega
    - Usuario normal: Solo puede ver bodegas de su empresa
    
    **Parámetros:**
    - id: ID de la bodega a recuperar
    
    **Respuesta:**
    - Datos completos de la bodega
    
    **Permisos:**
    - Requiere autenticación JWT
    """
    try:
        empresa_id = usuario_autenticado.get("empresa_id")
        
        # Si es super admin, obtener sin filtro de empresa
        bodega_empresa_id = None if es_admin else empresa_id
        bodega = await service.obtener_bodega(id, bodega_empresa_id)
        
        # Validar permisos si no es super admin
        if not es_admin and bodega["empresa_id"] != empresa_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permiso para acceder a bodegas de otras empresas"
            )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=bodega,
            mensaje="Bodega recuperada exitosamente"
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
    summary="Crear nueva bodega",
    status_code=status.HTTP_201_CREATED
)
async def crear_bodega(
    bodega_dto: BodegaCrearDTO,
    usuario_autenticado: dict = Depends(requiere_permiso("bodegas.crear")),
    es_admin: bool = Depends(es_super_admin),
    service: BodegaService = Depends(obtener_bodega_service),
):
    """
    Crea un nueva bodega en la empresa.
    
    **Comportamiento multi-tenant:**
    - Super admin: Puede crear bodegas en cualquier empresa (especificar en otro contexto)
    - Usuario normal: Solo puede crear en su propia empresa
    
    **Body:**
    - nombre: Nombre de la bodega (1-100 caracteres, requerido)
    - codigo: Código de la bodega (1-50 caracteres, requerido)
    - activo: Estado de la bodega (booleano, opcional, por defecto True
    
    **Respuesta:**
    - Datos de la bodega creada (status 201 Created)
    
    **Permisos:**
    - Requiere autenticación JWT
    - Usuario normal solo crea en su empresa
    - Super admin puede crear en cualquier empresa
    
    **Validaciones:**
    - Nombre no vacío (1-100 caracteres)
    - Nombre único por empresa
    """
    try:
        empresa_id = usuario_autenticado.get("empresa_id")
        
        nueva_bodega = await service.crear_bodega(
            empresa_id=empresa_id,
            nombre=bodega_dto.nombre,
            codigo=bodega_dto.codigo,
            activo=bodega_dto.activo
        )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=nueva_bodega,
            mensaje="Bodega creada exitosamente"
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
    summary="Actualizar bodega",
    status_code=status.HTTP_200_OK
)
async def actualizar_bodega(
    id: int,
    actualizar_dto: BodegaActualizarDTO,
    usuario_autenticado: dict = Depends(requiere_permiso("bodegas.editar")),
    es_admin: bool = Depends(es_super_admin),
    service: BodegaService = Depends(obtener_bodega_service),
):
    """
    Actualiza los datos de una bodega existente.
    
    **Comportamiento multi-tenant:**
    - Super admin: Puede actualizar cualquier bodega
    - Usuario normal: Solo puede actualizar bodegas de su empresa
    
    **Parámetros:**
    - id: ID de la bodega a actualizar
    
    **Body (todos los campos opcionales):**
    - nombre: Nuevo nombre de la bodega (1-100 caracteres)
    - codigo: Nuevo código de la bodega (1-50 caracteres)
    - activo: Nuevo estado de la bodega (booleano)
    
    **Respuesta:**
    - Datos de la bodega actualizada
    
    **Permisos:**
    - Requiere autenticación JWT
    - Usuario normal solo actualiza en su empresa
    - Super admin puede actualizar en cualquier empresa
    
    **Validaciones:**
    - Nombre único por empresa si se actualiza
    - Bodega debe existir
    """
    try:
        empresa_id = usuario_autenticado.get("empresa_id")
        
        # Si es super admin, obtener sin filtro de empresa para verificar existencia
        bodega_empresa_id = None if es_admin else empresa_id
        
        bodega_actualizada = await service.actualizar_bodega(
            bodega_id=id,
            empresa_id=empresa_id,
            nombre=actualizar_dto.nombre,
            codigo=actualizar_dto.codigo,
            activo=bool(actualizar_dto.activo) if actualizar_dto.activo is not None else None,
        )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=bodega_actualizada,
            mensaje="Bodega actualizada exitosamente"
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
    summary="Eliminar bodega",
    status_code=status.HTTP_200_OK
)
async def eliminar_bodega(
    id: int,
    usuario_autenticado: dict = Depends(requiere_permiso("bodegas.eliminar")),
    es_admin: bool = Depends(es_super_admin),
    service: BodegaService = Depends(obtener_bodega_service),
):
    """
    Elimina una bodega.
    
    **Comportamiento multi-tenant:**
    - Super admin: Puede eliminar cualquier bodega
    - Usuario normal: Solo puede eliminar bodegas de su empresa
    
    **Parámetros:**
    - id: ID de la bodega a eliminar
    
    **Respuesta:**
    - Confirmación de eliminación
    
    **Permisos:**
    - Requiere autenticación JWT
    - Usuario normal solo elimina en su empresa
    - Super admin puede eliminar en cualquier empresa
    
    **Validaciones:**
    - Bodega debe existir
    """
    try:
        empresa_id = usuario_autenticado.get("empresa_id")
        
        resultado = await service.eliminar_bodega(id, empresa_id)
        
        return RespuestaAPIDTO(
            exito=True,
            datos={"mensaje": resultado["mensaje"]},
            mensaje="Bodega eliminada exitosamente"
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
