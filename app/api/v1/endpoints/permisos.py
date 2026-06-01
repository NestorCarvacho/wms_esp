"""Endpoints CRUD de permisos atómicos."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import es_super_admin, obtener_usuario_autenticado
from app.api.v1.empresa_contexto import ContextoEmpresa, kwargs_listado, obtener_contexto_empresa, resolver_empresa_creacion
from app.domain.services.permiso_service import PermisoService
from app.infrastructure.database import get_db_session
from app.infrastructure.repositories.permiso_crud_repository import PermisoCRUDRepository
from app.schemas.permiso import PermisoActualizarDTO, PermisoCrearDTO
from app.schemas.usuario import RespuestaAPIDTO

router = APIRouter(prefix="/api/v1/permisos", tags=["Permisos"])


async def obtener_permiso_service(session: AsyncSession = Depends(get_db_session)) -> PermisoService:
    return PermisoService(PermisoCRUDRepository(session))


@router.get("", response_model=RespuestaAPIDTO)
async def listar_permisos(
    pagina: int = 1,
    por_pagina: int = 10,
    buscar: str | None = None,
    ctx: ContextoEmpresa = Depends(obtener_contexto_empresa),
    service: PermisoService = Depends(obtener_permiso_service),
):
    try:
        resultado = await service.listar(
            empresa_id=ctx.empresa_usuario_id,
            pagina=pagina,
            por_pagina=por_pagina,
            buscar=buscar,
            **kwargs_listado(ctx),
        )
        return RespuestaAPIDTO(exito=True, datos=resultado, mensaje=f"Se encontraron {resultado['total']} permisos").dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=RespuestaAPIDTO, status_code=201)
async def crear_permiso(
    dto: PermisoCrearDTO,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    session: AsyncSession = Depends(get_db_session),
    service: PermisoService = Depends(obtener_permiso_service),
):
    try:
        empresa_id = await resolver_empresa_creacion(
            usuario_autenticado, dto.empresa_id, session
        )
        resultado = await service.crear(
            empresa_id=empresa_id,
            codigo=dto.codigo,
            descripcion=dto.descripcion,
            activo=dto.activo == 1,
        )
        return RespuestaAPIDTO(exito=True, datos=resultado, mensaje="Permiso creado exitosamente").dict()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{id}", response_model=RespuestaAPIDTO)
async def actualizar_permiso(
    id: int,
    dto: PermisoActualizarDTO,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    service: PermisoService = Depends(obtener_permiso_service),
):
    try:
        resultado = await service.actualizar(
            permiso_id=id,
            empresa_id=usuario_autenticado.get("empresa_id"),
            **dto.model_dump(exclude_unset=True),
        )
        return RespuestaAPIDTO(exito=True, datos=resultado, mensaje="Permiso actualizado exitosamente").dict()
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{id}", response_model=RespuestaAPIDTO)
async def eliminar_permiso(
    id: int,
    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),
    service: PermisoService = Depends(obtener_permiso_service),
):
    try:
        resultado = await service.eliminar(id, usuario_autenticado.get("empresa_id"))
        return RespuestaAPIDTO(exito=True, datos=resultado, mensaje=resultado["mensaje"]).dict()
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
