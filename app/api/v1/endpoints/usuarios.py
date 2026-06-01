"""
Endpoints CRUD de Usuarios (Capa de Presentación).
5 endpoints: GET (listar), GET (detalle), POST (crear), PUT (actualizar), DELETE (eliminar).
Multi-tenant con soporte para super admin.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database import get_db_session
from app.infrastructure.repositories.usuario_crud_repository import UsuarioCRUDRepository
from app.domain.services.usuario_service import UsuarioService
from app.api.v1.dependencies import obtener_usuario_autenticado, es_super_admin
from app.schemas.usuario import (
    UsuarioCrearDTO,
    UsuarioActualizarDTO,
    UsuarioRespuestaDTO,
    UsuarioListaDTO,
    RespuestaAPIDTO
)


router = APIRouter(prefix="/api/v1/usuarios", tags=["Usuarios"])


# ============ DEPENDENCIAS ============
async def obtener_usuario_service(session: AsyncSession = Depends(get_db_session)) -> UsuarioService:
    """Factory para instanciar el servicio de usuarios."""
    repository = UsuarioCRUDRepository(session)
    return UsuarioService(repository)


# ============ GET: LISTAR USUARIOS (CON PAGINACIÓN) ============
@router.get(
    "",
    response_model=RespuestaAPIDTO,
    summary="Listar usuarios",
    status_code=status.HTTP_200_OK
)
async def listar_usuarios(
    pagina: int = 1,
    por_pagina: int = 10,
    buscar: str | None = None,
    empresa_id: int | None = Query(None, description="Filtrar por empresa (solo super admin)"),
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    es_admin: bool = Depends(es_super_admin),
    service: UsuarioService = Depends(obtener_usuario_service)
):
    """
    Obtiene la lista de usuarios.
    
    **Comportamiento multi-tenant:**
    - Super admin (empresa_id=1): Ve TODOS los usuarios de todas las empresas
    - Usuario normal: Ve solo usuarios de su empresa
    
    **Parámetros:**
    - pagina: Número de página (por defecto 1)
    - por_pagina: Usuarios por página (por defecto 10)
    
    **Respuesta:**
    - Retorna lista paginada de usuarios activos
    
    **Permisos:**
    - Requiere autenticación JWT
    """
    try:
        empresa_id_usuario = usuario_autenticado.get("empresa_id")
        
        resultado = await service.listar_usuarios(
            empresa_id=empresa_id_usuario,
            pagina=pagina,
            por_pagina=por_pagina,
            es_super_admin=es_admin,
            empresa_id_filtro=empresa_id if es_admin else None,
            buscar=buscar,
        )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=resultado,
            mensaje=f"Se encontraron {resultado['total']} usuarios"
        ).dict()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ GET: OBTENER USUARIO POR ID ============
@router.get(
    "/{id}",
    response_model=RespuestaAPIDTO,
    summary="Obtener usuario por ID",
    status_code=status.HTTP_200_OK
)
async def obtener_usuario(
    id: int,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    es_admin: bool = Depends(es_super_admin),
    service: UsuarioService = Depends(obtener_usuario_service)
):
    """
    Obtiene los datos de un usuario específico.
    
    **Comportamiento multi-tenant:**
    - Super admin: Puede obtener cualquier usuario
    - Usuario normal: Solo puede ver usuarios de su empresa
    
    **Parámetros:**
    - usuario_id: ID del usuario a recuperar
    
    **Respuesta:**
    - Datos completos del usuario (sin contraseña)
    
    **Permisos:**
    - Requiere autenticación JWT
    """
    try:
        empresa_id = usuario_autenticado.get("empresa_id")
        
        # Si no es super admin, validar que intente acceder solo a usuarios de su empresa
        if not es_admin:
            usuario = await service.obtener_usuario(id, empresa_id)
            if usuario["empresa_id"] != empresa_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No tiene permiso para acceder a usuarios de otras empresas"
                )
        else:
            usuario = await service.obtener_usuario(id, None)
        
        return RespuestaAPIDTO(
            exito=True,
            datos=usuario,
            mensaje="Usuario recuperado exitosamente"
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


# ============ POST: CREAR USUARIO ============
@router.post(
    "",
    response_model=RespuestaAPIDTO,
    summary="Crear nuevo usuario",
    status_code=status.HTTP_201_CREATED
)
async def crear_usuario(
    usuario_dto: UsuarioCrearDTO,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    es_admin: bool = Depends(es_super_admin),
    service: UsuarioService = Depends(obtener_usuario_service)
):
    """
    Crea un nuevo usuario en la empresa.
    
    **Comportamiento multi-tenant:**
    - Super admin: Puede crear usuarios en cualquier empresa (especificar empresa_id en body)
    - Usuario normal: Solo puede crear en su propia empresa
    
    **Body:**
    - email: Email único (formato válido)
    - contrasena: Mínimo 8 caracteres (mayúscula + número requeridos)
    - cargo_id: ID del cargo opcional
    - empresa_id: ID de la empresa (SOLO SUPER ADMIN puede especificar, sino usa su empresa)
    
    **Nota:** Datos personales (nombre, rut, etc.) se configuran en el perfil de usuario
    
    **Respuesta:**
    - Datos del usuario creado (status 201 Created)
    
    **Permisos:**
    - Requiere autenticación JWT
    - Usuario normal solo crea en su empresa
    - Super admin puede crear en cualquier empresa
    """
    try:
        usuario_empresa_id = usuario_autenticado.get("empresa_id")
        
        # Determinar empresa_id final
        if es_admin:
            # Super admin puede especificar empresa_id en el body
            empresa_destino = usuario_dto.empresa_id or usuario_empresa_id
        else:
            # Usuario normal: validar que no intente usar otra empresa
            if usuario_dto.empresa_id and usuario_dto.empresa_id != usuario_empresa_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No puede crear usuarios en otra empresa"
                )
            empresa_destino = usuario_empresa_id
        
        nuevo_usuario = await service.crear_usuario(
            empresa_id=empresa_destino,
            email=usuario_dto.email,
            contrasena=usuario_dto.contrasena,
            cargo_id=usuario_dto.cargo_id,
        )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=nuevo_usuario,
            mensaje="Usuario creado exitosamente"
        ).dict()
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ PUT: ACTUALIZAR USUARIO ============
@router.put(
    "/{id}",
    response_model=RespuestaAPIDTO,
    summary="Actualizar usuario",
    status_code=status.HTTP_200_OK
)
async def actualizar_usuario(
    id: int,
    actualizar_dto: UsuarioActualizarDTO,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    es_admin: bool = Depends(es_super_admin),
    service: UsuarioService = Depends(obtener_usuario_service)
):
    """
    Actualiza los datos de un usuario existente.
    
    **Comportamiento multi-tenant:**
    - Super admin: Puede actualizar cualquier usuario
    - Usuario normal: Solo puede actualizarse a sí mismo o usuarios de su empresa
    
    **Parámetros:**
    - usuario_id: ID del usuario a actualizar
    
    **Body (todos los campos opcionales):**
    - email: Nuevo email
    - cargo_id: Nuevo cargo
    - contrasena: Nueva contraseña (si se proporciona, debe cumplir requisitos)
    - activo: Activar/desactivar usuario
    
    **Nota:** Para actualizar datos personales (nombre, rut, etc.) usar el endpoint de perfil de usuario
    
    **Respuesta:**
    - Datos actualizados del usuario
    
    **Permisos:**
    - Requiere autenticación JWT
    """
    try:
        empresa_id = usuario_autenticado.get("empresa_id")
        campos = actualizar_dto.model_dump(exclude_unset=True)

        usuario_actualizado = await service.actualizar_usuario(
            usuario_id=id,
            empresa_id=empresa_id,
            es_super_admin=es_admin,
            **campos,
        )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=usuario_actualizado,
            mensaje="Usuario actualizado exitosamente"
        ).dict()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ DELETE: ELIMINAR (DESACTIVAR) USUARIO ============
@router.delete(
    "/{id}",
    response_model=RespuestaAPIDTO,
    summary="Eliminar usuario",
    status_code=status.HTTP_200_OK
)
async def eliminar_usuario(
    id: int,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    es_admin: bool = Depends(es_super_admin),
    service: UsuarioService = Depends(obtener_usuario_service)
):
    """
    Elimina (desactiva) un usuario.
    
    **Nota:** Los usuarios no se eliminan físicamente, se marcan como inactivos.
    
    **Comportamiento multi-tenant:**
    - Super admin: Puede eliminar cualquier usuario
    - Usuario normal: Solo puede eliminar usuarios de su empresa
    
    **Parámetros:**
    - usuario_id: ID del usuario a eliminar
    
    **Respuesta:**
    - Confirmación de eliminación
    
    **Permisos:**
    - Requiere autenticación JWT
    - Usuario debe tener permisos de eliminación
    """
    try:
        empresa_id = usuario_autenticado.get("empresa_id")
        
        resultado = await service.eliminar_usuario(
            usuario_id=id,
            empresa_id=empresa_id
        )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=resultado,
            mensaje="Usuario eliminado exitosamente"
        ).dict()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ POST: REACTIVAR USUARIO ============
@router.post(
    "/{id}/reactivar",
    response_model=RespuestaAPIDTO,
    summary="Reactivar usuario",
    status_code=status.HTTP_200_OK
)
async def reactivar_usuario(
    id: int,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    es_admin: bool = Depends(es_super_admin),
    service: UsuarioService = Depends(obtener_usuario_service)
):
    """
    Reactiva un usuario que fue desactivado.
    
    **Comportamiento multi-tenant:**
    - Super admin: Puede reactivar cualquier usuario
    - Usuario normal: Solo puede reactivar usuarios de su empresa
    
    **Parámetros:**
    - usuario_id: ID del usuario a reactivar
    
    **Respuesta:**
    - Datos del usuario reactivado
    
    **Permisos:**
    - Requiere autenticación JWT
    """
    try:
        empresa_id = usuario_autenticado.get("empresa_id")
        
        usuario_reactivado = await service.reactivar_usuario(
            usuario_id=id,
            empresa_id=empresa_id
        )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=usuario_reactivado,
            mensaje="Usuario reactivado exitosamente"
        ).dict()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
