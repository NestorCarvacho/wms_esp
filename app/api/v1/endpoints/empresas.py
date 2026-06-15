"""
Endpoints CRUD de Empresas (Capa de Presentación).
5 endpoints: GET (listar), GET (detalle), POST (crear), PUT (actualizar), DELETE (eliminar).
Solo accesible por super admin.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database import get_db_session
from app.infrastructure.repositories.empresa_crud_repository import EmpresaCRUDRepository
from app.domain.services.empresa_service import EmpresaService
from app.domain.services.empresa_maestra_service import EmpresaMaestraService
from app.domain.services.empresa_rbac_bootstrap_service import EmpresaRbacBootstrapService
from app.infrastructure.repositories.empresa_administrada_repository import EmpresaAdministradaRepository
from app.infrastructure.repositories.empresa_rbac_bootstrap_repository import EmpresaRbacBootstrapRepository
from app.api.v1.dependencies import obtener_usuario_autenticado, requiere_permiso, es_super_admin
from app.api.v1.listado_query import orden_listado
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


async def obtener_empresa_maestra_service(session: AsyncSession = Depends(get_db_session)) -> EmpresaMaestraService:
    return EmpresaMaestraService(EmpresaAdministradaRepository(session))


async def obtener_empresa_rbac_bootstrap_service(
    session: AsyncSession = Depends(get_db_session),
) -> EmpresaRbacBootstrapService:
    return EmpresaRbacBootstrapService(
        EmpresaRbacBootstrapRepository(session),
        EmpresaCRUDRepository(session),
        session,
    )


def validar_super_admin(es_admin: bool = Depends(es_super_admin)):
    """Valida que el usuario sea super admin."""
    if not es_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo super admin puede gestionar empresas"
        )
    return es_admin


@router.get(
    "/administradas",
    response_model=RespuestaAPIDTO,
    summary="Empresas administradas por la maestra del usuario",
    status_code=status.HTTP_200_OK,
)
async def listar_empresas_administradas(
    incluir_inactivas: bool = Query(
        False,
        description="Incluir empresas inhabilitadas (selector de empresa maestra)",
    ),
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    service: EmpresaMaestraService = Depends(obtener_empresa_maestra_service),
):
    try:
        if not usuario_autenticado.get("es_empresa_maestra") and usuario_autenticado.get("empresa_id") != 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo usuarios de empresa maestra pueden listar empresas administradas",
            )
        resultado = await service.listar_administradas(
            usuario_autenticado.get("empresa_id"),
            incluir_inactivas=incluir_inactivas,
        )
        return RespuestaAPIDTO(
            exito=True,
            datos=resultado,
            mensaje=f"Se encontraron {resultado['total']} empresas administradas",
        ).dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


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
    orden_params: dict = Depends(orden_listado),
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
            **orden_params,
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
    service: EmpresaService = Depends(obtener_empresa_service),
    rbac_service: EmpresaRbacBootstrapService = Depends(obtener_empresa_rbac_bootstrap_service),
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

        rbac = await rbac_service.provisionar(
            empresa_destino_id=resultado["id"],
            usuario=usuario_autenticado,
            es_super_admin=True,
            empresa_maestra_id=usuario_autenticado.get("empresa_id"),
        )
        resultado["rbac"] = rbac
        
        return RespuestaAPIDTO(
            exito=True,
            datos=resultado,
            mensaje="Empresa creada y catálogo RBAC provisionado correctamente"
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


# ============ POST: PROVISIONAR RBAC ============
@router.post(
    "/{id}/provisionar-rbac",
    response_model=RespuestaAPIDTO,
    summary="Provisionar catálogo RBAC en una empresa",
    status_code=status.HTTP_200_OK,
)
async def provisionar_rbac_empresa(
    id: int,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    es_admin: bool = Depends(validar_super_admin),
    rbac_service: EmpresaRbacBootstrapService = Depends(obtener_empresa_rbac_bootstrap_service),
):
    """
    Copia permisos y roles estándar desde la empresa plantilla (id=1) hacia otra empresa.

    Idempotente: solo agrega permisos y roles faltantes; sincroniza asignaciones rol↔permiso.
    """
    try:
        resultado = await rbac_service.provisionar(
            empresa_destino_id=id,
            usuario=usuario_autenticado,
            es_super_admin=True,
            empresa_maestra_id=usuario_autenticado.get("empresa_id"),
        )
        return RespuestaAPIDTO(
            exito=True,
            datos=resultado,
            mensaje="Catálogo RBAC provisionado correctamente",
        ).dict()
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
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
    summary="Inhabilitar empresa",
    status_code=status.HTTP_200_OK
)
async def eliminar_empresa(
    id: int,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    es_admin: bool = Depends(validar_super_admin),
    service: EmpresaService = Depends(obtener_empresa_service)

):
    """
    Inhabilita una empresa (no borra datos relacionados).
    
    **Comportamiento:**
    - Solo accesible por super admin
    - Marca la empresa como inhabilitada (`esta_activa` y `activo` en false)
    - Productos, usuarios y demás datos permanecen en BD
    - Dejan de aparecer en listados agregados ("Todas las empresas")
    - Siguen visibles al seleccionar la empresa en el filtro maestra
    - Puede reactivarse editando la empresa
    
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
            mensaje="Empresa inhabilitada exitosamente"
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
