"""
Endpoints CRUD de Empresas (Capa de Presentación).
5 endpoints: GET (listar), GET (detalle), POST (crear), PUT (actualizar), DELETE (eliminar).
Solo accesible por super admin.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database import get_db_session
from app.infrastructure.repositories.empresa_crud_repository import EmpresaCRUDRepository
from app.domain.services.empresa_service import EmpresaService
from app.api.v1.dependencies import obtener_usuario_autenticado, es_super_admin
from app.schemas.empresa import (
    EmpresaCrearDTO,
    EmpresaActualizarDTO,
    EmpresaRespuestaDTO,
    EmpresaListaDTO,
    RespuestaAPIDTO
)


router = APIRouter(prefix="/api/v1/empresas", tags=["Empresas"])


# ============ DEPENDENCIAS ============
async def obtener_empresa_service(session: AsyncSession = Depends(get_db_session)) -> EmpresaService:
    """Factory para instanciar el servicio de empresas."""
    repository = EmpresaCRUDRepository(session)
    return EmpresaService(repository)


def validar_super_admin(es_admin: bool = Depends(es_super_admin)):
    """Valida que el usuario sea super admin."""
    if not es_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo super admin puede gestionar empresas"
        )
    return es_admin


# ============ GET: LISTAR EMPRESAS (CON PAGINACIÓN) ============
@router.get(
    "",
    response_model=RespuestaAPIDTO,
    summary="Listar empresas",
    status_code=status.HTTP_200_OK
)
async def listar_empresas(
    pagina: int = 1,
    por_pagina: int = 10,
    solo_activas: bool = False,
    buscar: str | None = None,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    es_admin: bool = Depends(validar_super_admin),
    service: EmpresaService = Depends(obtener_empresa_service)
):
    """
    Obtiene la lista de empresas.
    
    **Comportamiento:**
    - Solo accesible por super admin
    - Retorna lista paginada de empresas
    
    **Parámetros:**
    - pagina: Número de página (por defecto 1)
    - por_pagina: Empresas por página (por defecto 10)
    - solo_activas: Si True, solo lista empresas activas (por defecto False)
    
    **Respuesta:**
    - Retorna lista paginada de empresas
    
    **Permisos:**
    - Requiere autenticación JWT y rol de super admin
    """
    try:
        resultado = await service.listar_empresas(
            pagina=pagina,
            por_pagina=por_pagina,
            solo_activas=solo_activas,
            buscar=buscar,
        )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=resultado,
            mensaje=f"Se encontraron {resultado['total']} empresas"
        ).dict()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ GET: OBTENER EMPRESA POR ID ============
@router.get(
    "/{id}",
    response_model=RespuestaAPIDTO,
    summary="Obtener empresa por ID",
    status_code=status.HTTP_200_OK
)
async def obtener_empresa(
    id: int,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    es_admin: bool = Depends(validar_super_admin),
    service: EmpresaService = Depends(obtener_empresa_service)
):
    """
    Obtiene los datos de una empresa específica.
    
    **Comportamiento:**
    - Solo accesible por super admin
    - Retorna datos completos de la empresa
    
    **Parámetros:**
    - id: ID de la empresa (path parameter)
    
    **Respuesta:**
    - Retorna datos de la empresa
    
    **Errores:**
    - 404: Empresa no encontrada
    - 500: Error interno del servidor
    
    **Permisos:**
    - Requiere autenticación JWT y rol de super admin
    """
    try:
        resultado = await service.obtener_empresa(id)
        
        return RespuestaAPIDTO(
            exito=True,
            datos=resultado,
            mensaje="Empresa obtenida exitosamente"
        ).dict()
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ POST: CREAR EMPRESA ============
@router.post(
    "",
    response_model=RespuestaAPIDTO,
    summary="Crear empresa",
    status_code=status.HTTP_201_CREATED
)
async def crear_empresa(
    dto: EmpresaCrearDTO,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    es_admin: bool = Depends(validar_super_admin),
    service: EmpresaService = Depends(obtener_empresa_service)
):
    """
    Crea una nueva empresa.
    
    **Comportamiento:**
    - Solo accesible por super admin
    - El código debe ser único
    - Se crea con estado activo por defecto
    
    **Body:**
    - codigo: Código único de la empresa (requerido)
    - nombre: Nombre de la empresa (requerido)
    - rut: RUT de la empresa (opcional)
    
    **Respuesta:**
    - Retorna datos de la empresa creada
    
    **Errores:**
    - 400: Código de empresa ya existe
    - 422: Datos inválidos
    - 500: Error interno del servidor
    
    **Permisos:**
    - Requiere autenticación JWT y rol de super admin
    """
    try:
        resultado = await service.crear_empresa(
            codigo=dto.codigo,
            nombre=dto.nombre,
            rut=dto.rut
        )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=resultado,
            mensaje="Empresa creada exitosamente"
        ).dict()
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ PUT: ACTUALIZAR EMPRESA ============
@router.put(
    "/{id}",
    response_model=RespuestaAPIDTO,
    summary="Actualizar empresa",
    status_code=status.HTTP_200_OK
)
async def actualizar_empresa(
    id: int,
    dto: EmpresaActualizarDTO,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    es_admin: bool = Depends(validar_super_admin),
    service: EmpresaService = Depends(obtener_empresa_service)
):
    """
    Actualiza una empresa existente.
    
    **Comportamiento:**
    - Solo accesible por super admin
    - Solo actualiza los campos proporcionados
    - No permite cambiar el código
    
    **Body:**
    - nombre: Nuevo nombre (opcional)
    - rut: Nuevo RUT (opcional)
    - esta_activa: Nuevo estado (opcional)
    
    **Respuesta:**
    - Retorna datos de la empresa actualizada
    
    **Errores:**
    - 404: Empresa no encontrada
    - 422: Datos inválidos
    - 500: Error interno del servidor
    
    **Permisos:**
    - Requiere autenticación JWT y rol de super admin
    """
    try:
        resultado = await service.actualizar_empresa(
            empresa_id=id,
            nombre=dto.nombre,
            rut=dto.rut,
            esta_activa=dto.esta_activa
        )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=resultado,
            mensaje="Empresa actualizada exitosamente"
        ).dict()
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ DELETE: ELIMINAR EMPRESA ============
@router.delete(
    "/{id}",
    response_model=RespuestaAPIDTO,
    summary="Eliminar empresa",
    status_code=status.HTTP_200_OK
)
async def eliminar_empresa(
    id: int,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    es_admin: bool = Depends(validar_super_admin),
    service: EmpresaService = Depends(obtener_empresa_service)
):
    """
    Elimina (desactiva) una empresa.
    
    **Comportamiento:**
    - Solo accesible por super admin
    - Desactiva la empresa (soft delete)
    - No elimina registros relacionados
    
    **Parámetros:**
    - id: ID de la empresa (path parameter)
    
    **Respuesta:**
    - Retorna mensaje de confirmación
    
    **Errores:**
    - 404: Empresa no encontrada
    - 500: Error interno del servidor
    
    **Permisos:**
    - Requiere autenticación JWT y rol de super admin
    """
    try:
        resultado = await service.eliminar_empresa(id)
        
        return RespuestaAPIDTO(
            exito=True,
            datos=resultado,
            mensaje="Empresa eliminada exitosamente"
        ).dict()
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
