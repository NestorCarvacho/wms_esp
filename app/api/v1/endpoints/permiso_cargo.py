"""
Endpoints CRUD de Permisos Cargo.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database import get_db_session
from app.infrastructure.repositories.permiso_cargo_crud_repository import PermisoCargoCRUDRepository
from app.domain.services.permiso_cargo_service import PermisoCargoService
from app.api.v1.dependencies import obtener_usuario_autenticado, requiere_permiso, es_super_admin
from app.schemas.permiso_cargo import (
    PermisoCargoCrearDTO,
    PermisoCargoActualizarDTO,
    RespuestaAPIDTO,
)
from app.schemas.cargo_rol import CargoRolSincronizarDTO

router = APIRouter(prefix="/api/v1/permisos-cargo", tags=["Permisos Cargo"])


async def obtener_permiso_cargo_service(session: AsyncSession = Depends(get_db_session)) -> PermisoCargoService:
    repository = PermisoCargoCRUDRepository(session)
    return PermisoCargoService(repository)


@router.get("", response_model=RespuestaAPIDTO, summary="Listar permisos cargo")
async def listar_permisos_cargo(
    pagina: int = 1,
    por_pagina: int = 20,
    usuario_autenticado: dict = Depends(requiere_permiso("roles.leer")),
    es_admin: bool = Depends(es_super_admin),
    service: PermisoCargoService = Depends(obtener_permiso_cargo_service),
):
    try:
        empresa_id = usuario_autenticado.get("empresa_id")
        resultado = await service.listar_permisos(
            empresa_id=empresa_id,
            pagina=pagina,
            por_pagina=por_pagina,
            es_super_admin=es_admin,
        )
        return RespuestaAPIDTO(
            exito=True,
            datos=resultado,
            mensaje=f"Se encontraron {resultado['total']} permisos cargo",
        ).dict()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("", response_model=RespuestaAPIDTO, summary="Crear permiso cargo", status_code=status.HTTP_201_CREATED)
async def crear_permiso_cargo(
    dto: PermisoCargoCrearDTO,
    usuario_autenticado: dict = Depends(requiere_permiso("roles.editar")),
    es_admin: bool = Depends(es_super_admin),
    service: PermisoCargoService = Depends(obtener_permiso_cargo_service),
):
    try:
        empresa_id = usuario_autenticado.get("empresa_id")
        datos = await service.crear_permiso(
            empresa_id=empresa_id,
            cargo_id=dto.cargo_id,
            rol_id=dto.rol_id,
            activo=dto.activo,
            es_super_admin=es_admin,
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Permiso cargo creado exitosamente").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/{cargo_id}/{rol_id}", response_model=RespuestaAPIDTO, summary="Actualizar permiso cargo")
async def actualizar_permiso_cargo(
    cargo_id: int,
    rol_id: int,
    dto: PermisoCargoActualizarDTO,
    usuario_autenticado: dict = Depends(requiere_permiso("roles.editar")),
    es_admin: bool = Depends(es_super_admin),
    service: PermisoCargoService = Depends(obtener_permiso_cargo_service),
):
    try:
        if dto.activo is None:
            raise ValueError("Debe indicar el estado activo")
        empresa_id = usuario_autenticado.get("empresa_id")
        datos = await service.actualizar_permiso(
            empresa_id=empresa_id,
            cargo_id=cargo_id,
            rol_id=rol_id,
            activo=dto.activo,
            es_super_admin=es_admin,
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Permiso cargo actualizado exitosamente").dict()
    except ValueError as e:
        msg = str(e)
        status_code = status.HTTP_404_NOT_FOUND if "no encontrado" in msg.lower() else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code, detail=msg)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{cargo_id}/{rol_id}", response_model=RespuestaAPIDTO, summary="Eliminar permiso cargo")
async def eliminar_permiso_cargo(
    cargo_id: int,
    rol_id: int,
    usuario_autenticado: dict = Depends(requiere_permiso("roles.editar")),
    es_admin: bool = Depends(es_super_admin),
    service: PermisoCargoService = Depends(obtener_permiso_cargo_service),
):
    try:
        empresa_id = usuario_autenticado.get("empresa_id")
        datos = await service.eliminar_permiso(
            empresa_id=empresa_id,
            cargo_id=cargo_id,
            rol_id=rol_id,
            es_super_admin=es_admin,
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Permiso cargo eliminado exitosamente").dict()
    except ValueError as e:
        msg = str(e)
        status_code = status.HTTP_404_NOT_FOUND if "no encontrado" in msg.lower() else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code, detail=msg)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/cargo/{cargo_id}/roles", response_model=RespuestaAPIDTO, summary="Roles asignados a un cargo")
async def listar_roles_cargo(
    cargo_id: int,
    usuario_autenticado: dict = Depends(requiere_permiso("roles.leer")),
    es_admin: bool = Depends(es_super_admin),
    service: PermisoCargoService = Depends(obtener_permiso_cargo_service),
):
    try:
        datos = await service.listar_roles_cargo(
            cargo_id=cargo_id,
            empresa_id=usuario_autenticado.get("empresa_id"),
            es_super_admin=es_admin,
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Roles del cargo obtenidos").dict()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/cargo/{cargo_id}/roles", response_model=RespuestaAPIDTO, summary="Sincronizar roles de un cargo")
async def sincronizar_roles_cargo(
    cargo_id: int,
    dto: CargoRolSincronizarDTO,
    usuario_autenticado: dict = Depends(requiere_permiso("roles.editar")),
    es_admin: bool = Depends(es_super_admin),
    service: PermisoCargoService = Depends(obtener_permiso_cargo_service),
):
    try:
        datos = await service.sincronizar_roles_cargo(
            cargo_id=cargo_id,
            empresa_id=usuario_autenticado.get("empresa_id"),
            rol_ids=dto.rol_ids,
            es_super_admin=es_admin,
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Roles del cargo actualizados").dict()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
