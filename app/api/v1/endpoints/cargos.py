"""
Endpoints CRUD de Cargos (Capa de Presentación).
5 endpoints: GET (listar), GET (detalle), POST (crear), PUT (actualizar), DELETE (eliminar).
Multi-tenant con soporte para super admin.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database import get_db_session
from app.infrastructure.repositories.cargo_crud_repository import CargoCRUDRepository
from app.domain.services.cargo_service import CargoService
from app.api.v1.dependencies import obtener_usuario_autenticado, es_super_admin
from app.schemas.cargo import (
    CargoCrearDTO,
    CargoActualizarDTO,
    CargoRespuestaDTO,
    CargoListaDTO,
    RespuestaAPIDTO
)


router = APIRouter(prefix="/api/v1/cargos", tags=["Cargos"])


# ============ DEPENDENCIAS ============
async def obtener_cargo_service(session: AsyncSession = Depends(get_db_session)) -> CargoService:
    """Factory para instanciar el servicio de cargos."""
    repository = CargoCRUDRepository(session)
    return CargoService(repository)


# ============ GET: LISTAR CARGOS (CON PAGINACIÓN) ============
@router.get(
    "",
    response_model=RespuestaAPIDTO,
    summary="Listar cargos",
    status_code=status.HTTP_200_OK
)
async def listar_cargos(
    pagina: int = 1,
    por_pagina: int = 10,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    es_admin: bool = Depends(es_super_admin),
    service: CargoService = Depends(obtener_cargo_service)
):
    """
    Obtiene la lista de cargos.
    
    **Comportamiento multi-tenant:**
    - Super admin (empresa_id=1): Ve TODOS los cargos de todas las empresas
    - Usuario normal: Ve solo cargos de su empresa
    
    **Parámetros:**
    - pagina: Número de página (por defecto 1)
    - por_pagina: Cargos por página (por defecto 10)
    
    **Respuesta:**
    - Retorna lista paginada de cargos
    
    **Permisos:**
    - Requiere autenticación JWT
    """
    try:
        empresa_id = usuario_autenticado.get("empresa_id")
        
        resultado = await service.listar_cargos(
            empresa_id=empresa_id,
            pagina=pagina,
            por_pagina=por_pagina,
            es_super_admin=es_admin
        )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=resultado,
            mensaje=f"Se encontraron {resultado['total']} cargos"
        ).dict()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ GET: OBTENER CARGO POR ID ============
@router.get(
    "/{id}",
    response_model=RespuestaAPIDTO,
    summary="Obtener cargo por ID",
    status_code=status.HTTP_200_OK
)
async def obtener_cargo(
    id: int,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    es_admin: bool = Depends(es_super_admin),
    service: CargoService = Depends(obtener_cargo_service)
):
    """
    Obtiene los datos de un cargo específico.
    
    **Comportamiento multi-tenant:**
    - Super admin: Puede obtener cualquier cargo
    - Usuario normal: Solo puede ver cargos de su empresa
    
    **Parámetros:**
    - id: ID del cargo a recuperar
    
    **Respuesta:**
    - Datos completos del cargo
    
    **Permisos:**
    - Requiere autenticación JWT
    """
    try:
        empresa_id = usuario_autenticado.get("empresa_id")
        
        # Si es super admin, obtener sin filtro de empresa
        cargo_empresa_id = None if es_admin else empresa_id
        cargo = await service.obtener_cargo(id, cargo_empresa_id)
        
        # Validar permisos si no es super admin
        if not es_admin and cargo["empresa_id"] != empresa_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permiso para acceder a cargos de otras empresas"
            )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=cargo,
            mensaje="Cargo recuperado exitosamente"
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


# ============ POST: CREAR CARGO ============
@router.post(
    "",
    response_model=RespuestaAPIDTO,
    summary="Crear nuevo cargo",
    status_code=status.HTTP_201_CREATED
)
async def crear_cargo(
    cargo_dto: CargoCrearDTO,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    es_admin: bool = Depends(es_super_admin),
    service: CargoService = Depends(obtener_cargo_service)
):
    """
    Crea un nuevo cargo en la empresa.
    
    **Comportamiento multi-tenant:**
    - Super admin: Puede crear cargos en cualquier empresa (especificar en otro contexto)
    - Usuario normal: Solo puede crear en su propia empresa
    
    **Body:**
    - nombre: Nombre del cargo (1-100 caracteres, requerido)
    
    **Respuesta:**
    - Datos del cargo creado (status 201 Created)
    
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
        
        nuevo_cargo = await service.crear_cargo(
            empresa_id=empresa_id,
            nombre=cargo_dto.nombre
        )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=nuevo_cargo,
            mensaje="Cargo creado exitosamente"
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


# ============ PUT: ACTUALIZAR CARGO ============
@router.put(
    "/{id}",
    response_model=RespuestaAPIDTO,
    summary="Actualizar cargo",
    status_code=status.HTTP_200_OK
)
async def actualizar_cargo(
    id: int,
    actualizar_dto: CargoActualizarDTO,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    es_admin: bool = Depends(es_super_admin),
    service: CargoService = Depends(obtener_cargo_service)
):
    """
    Actualiza los datos de un cargo existente.
    
    **Comportamiento multi-tenant:**
    - Super admin: Puede actualizar cualquier cargo
    - Usuario normal: Solo puede actualizar cargos de su empresa
    
    **Parámetros:**
    - id: ID del cargo a actualizar
    
    **Body (todos los campos opcionales):**
    - nombre: Nuevo nombre del cargo (1-100 caracteres)
    
    **Respuesta:**
    - Datos del cargo actualizado
    
    **Permisos:**
    - Requiere autenticación JWT
    - Usuario normal solo actualiza en su empresa
    - Super admin puede actualizar en cualquier empresa
    
    **Validaciones:**
    - Nombre único por empresa si se actualiza
    - Cargo debe existir
    """
    try:
        empresa_id = usuario_autenticado.get("empresa_id")
        
        # Si es super admin, obtener sin filtro de empresa para verificar existencia
        cargo_empresa_id = None if es_admin else empresa_id
        
        cargo_actualizado = await service.actualizar_cargo(
            cargo_id=id,
            empresa_id=empresa_id,
            nombre=actualizar_dto.nombre
        )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=cargo_actualizado,
            mensaje="Cargo actualizado exitosamente"
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


# ============ DELETE: ELIMINAR CARGO ============
@router.delete(
    "/{id}",
    response_model=RespuestaAPIDTO,
    summary="Eliminar cargo",
    status_code=status.HTTP_200_OK
)
async def eliminar_cargo(
    id: int,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    es_admin: bool = Depends(es_super_admin),
    service: CargoService = Depends(obtener_cargo_service)
):
    """
    Elimina un cargo.
    
    **Comportamiento multi-tenant:**
    - Super admin: Puede eliminar cualquier cargo
    - Usuario normal: Solo puede eliminar cargos de su empresa
    
    **Parámetros:**
    - id: ID del cargo a eliminar
    
    **Respuesta:**
    - Confirmación de eliminación
    
    **Permisos:**
    - Requiere autenticación JWT
    - Usuario normal solo elimina en su empresa
    - Super admin puede eliminar en cualquier empresa
    
    **Validaciones:**
    - Cargo debe existir
    """
    try:
        empresa_id = usuario_autenticado.get("empresa_id")
        
        resultado = await service.eliminar_cargo(id, empresa_id)
        
        return RespuestaAPIDTO(
            exito=True,
            datos={"mensaje": resultado["mensaje"]},
            mensaje="Cargo eliminado exitosamente"
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
