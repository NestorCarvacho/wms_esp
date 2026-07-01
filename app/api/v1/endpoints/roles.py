"""
Endpoints CRUD de rols (Capa de Presentación).
5 endpoints: GET (listar), GET (detalle), POST (crear), PUT (actualizar), DELETE (eliminar).
Multi-tenant con soporte para super admin.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.services.rol_service import RolService
from app.infrastructure.database import get_db_session
from app.modules.iam.presentation.http.dependencies import obtener_rol_service
from app.api.v1.dependencies import obtener_usuario_autenticado, requiere_permiso, es_super_admin
from app.api.v1.empresa_contexto import ContextoEmpresa, kwargs_listado, obtener_contexto_empresa, resolver_empresa_creacion, contexto_requiere_permiso
from app.api.v1.listado_query import orden_listado
from app.schemas.rol import (
    RolCrearDTO,
    RolActualizarDTO,
    RolRespuestaDTO,
    RolListaDTO,
    RespuestaAPIDTO
)

router = APIRouter(prefix="/api/v1/roles", tags=["Roles"])


# ============ GET: LISTAR ROLES (CON PAGINACIÓN) ============

@router.get(
    "",
    response_model=RespuestaAPIDTO,
    summary="Listar roles",
    status_code=status.HTTP_200_OK
)
async def listar_roles(
    pagina: int = 1,
    por_pagina: int = 10,
    buscar: str | None = None,
    orden_params: dict = Depends(orden_listado),
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("roles.leer")),
    service: RolService = Depends(obtener_rol_service)

):

    """
    Lista roles de una empresa con paginación.
    
    - Super admin (empresa_id=1): Ve TODOS los roles de todas las empresas
    - Usuario normal: Ve solo roles de su empresa
    
    Parámetros:
    - pagina: Número de página (por defecto 1)
    - por_pagina: Roles por página (por defecto 10)
    
    Respuesta:
    - Retorna lista paginada de roles
    
    Permisos:
    - Requiere autenticación JWT
    """

    try:
        resultado = await service.listar_roles(
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
            mensaje=f"Se encontraron {resultado['total']} roles"
        ).dict()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    
# ============ GET: OBTENER ROL POR ID ============
@router.get(
    "/{id}",
    response_model=RespuestaAPIDTO,
    summary="Obtener rol por ID",
    status_code=status.HTTP_200_OK
)
async def obtener_rol(
    id: int,
    usuario_autenticado: dict = Depends(requiere_permiso("roles.leer")),
    es_admin: bool = Depends(es_super_admin),
    service: RolService = Depends(obtener_rol_service),
):
    """
    Obtiene los datos de un rol específico.
    
    **Comportamiento multi-tenant:**
    - Super admin: Puede obtener cualquier rol
    - Usuario normal: Solo puede ver roles de su empresa
    
    **Parámetros:**
    - id: ID del rol a recuperar
    
    **Respuesta:**
    - Datos completos del rol
    
    **Permisos:**
    - Requiere autenticación JWT
    """
    try:
        empresa_id = usuario_autenticado.get("empresa_id")
        
        # Si es super admin, obtener sin filtro de empresa
        rol_empresa_id = None if es_admin else empresa_id
        rol = await service.obtener_rol(id, rol_empresa_id)
        
        # Validar permisos si no es super admin
        if not es_admin and rol["empresa_id"] != empresa_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permiso para acceder a roles de otras empresas"
            )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=rol,
            mensaje="Rol recuperado exitosamente"
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

# ============ POST: CREAR ROL ============

@router.post(
    "",
    response_model=RespuestaAPIDTO,
    summary="Crear nuevo rol",
    status_code=status.HTTP_201_CREATED
)
async def crear_rol(
    rol_dto: RolCrearDTO,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    session: AsyncSession = Depends(get_db_session),
    service: RolService = Depends(obtener_rol_service)

):
    """
    Crea un nuevo rol en la empresa.
    
    **Comportamiento multi-tenant:**
    - Super admin: Puede crear roles en cualquier empresa (especificar en otro contexto)
    - Usuario normal: Solo puede crear en su propia empresa
    
    **Body:**
    - nombre: Nombre del rol (1-100 caracteres, requerido)
    
    **Respuesta:**
    - Datos del rol creado (status 201 Created)
    
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
            usuario_autenticado, rol_dto.empresa_id, session
        )
        
        nuevo_rol = await service.crear_rol(
            empresa_id=empresa_id,
            nombre=rol_dto.nombre,
            descripcion=rol_dto.descripcion,
            activo=bool(rol_dto.activo) if rol_dto.activo is not None else True
        )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=nuevo_rol,
            mensaje="Rol creado exitosamente"
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


# ============ PUT: ACTUALIZAR ROL ============
@router.put(
    "/{id}",
    response_model=RespuestaAPIDTO,
    summary="Actualizar rol",
    status_code=status.HTTP_200_OK
)
async def actualizar_rol(
    id: int,
    actualizar_dto: RolActualizarDTO,
    usuario_autenticado: dict = Depends(requiere_permiso("roles.editar")),
    es_admin: bool = Depends(es_super_admin),
    service: RolService = Depends(obtener_rol_service),
):
    """
    Actualiza los datos de un rol existente.
    
    **Comportamiento multi-tenant:**
    - Super admin: Puede actualizar cualquier rol
    - Usuario normal: Solo puede actualizar roles de su empresa
    
    **Parámetros:**
    - id: ID del rol a actualizar
    
    **Body (todos los campos opcionales):**
    - nombre: Nuevo nombre del rol (1-100 caracteres)
    
    **Respuesta:**
    - Datos del rol actualizado
    
    **Permisos:**
    - Requiere autenticación JWT
    - Usuario normal solo actualiza en su empresa
    - Super admin puede actualizar en cualquier empresa
    
    **Validaciones:**
    - Nombre único por empresa si se actualiza
    - Rol debe existir
    """
    try:
        empresa_id = usuario_autenticado.get("empresa_id")
        
        # Si es super admin, obtener sin filtro de empresa para verificar existencia
        rol_empresa_id = None if es_admin else empresa_id
        
        rol_actualizado = await service.actualizar_rol(
            rol_id=id,
            empresa_id=empresa_id,
            nombre=actualizar_dto.nombre,
            descripcion=actualizar_dto.descripcion,
            activo=actualizar_dto.activo,
        )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=rol_actualizado,
            mensaje="Rol actualizado exitosamente"
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


# ============ DELETE: ELIMINAR ROL ============
@router.delete(
    "/{id}",
    response_model=RespuestaAPIDTO,
    summary="Eliminar rol",
    status_code=status.HTTP_200_OK
)
async def eliminar_rol(
    id: int,
    usuario_autenticado: dict = Depends(requiere_permiso("roles.eliminar")),
    es_admin: bool = Depends(es_super_admin),
    service: RolService = Depends(obtener_rol_service),
):
    """
    Elimina un rol.
    
    **Comportamiento multi-tenant:**
    - Super admin: Puede eliminar cualquier rol
    - Usuario normal: Solo puede eliminar roles de su empresa
    
    **Parámetros:**
    - id: ID del rol a eliminar
    
    **Respuesta:**
    - Confirmación de eliminación
    
    **Permisos:**
    - Requiere autenticación JWT
    - Usuario normal solo elimina en su empresa
    - Super admin puede eliminar en cualquier empresa
    
    **Validaciones:**
    - Rol debe existir
    """
    try:
        empresa_id = usuario_autenticado.get("empresa_id")
        
        resultado = await service.eliminar_rol(id, empresa_id)
        
        return RespuestaAPIDTO(
            exito=True,
            datos={"mensaje": resultado["mensaje"]},
            mensaje="Rol eliminado exitosamente"
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
