"""Endpoints CRUD de Tipos de Zona."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database import get_db_session
from app.infrastructure.repositories.tipo_zona_crud_repository import TipoZonaCRUDRepository
from app.domain.services.tipo_zona_service import TipoZonaService
from app.api.v1.dependencies import obtener_usuario_autenticado, requiere_permiso, es_super_admin
from app.api.v1.empresa_contexto import ContextoEmpresa, kwargs_listado, obtener_contexto_empresa, contexto_requiere_permiso
from app.schemas.tipo_zona import TipoZonaCrearDTO, TipoZonaActualizarDTO, RespuestaAPIDTO

router = APIRouter(prefix="/api/v1/tipos-zona", tags=["Tipos de Zona"])


async def obtener_tipo_zona_service(session: AsyncSession = Depends(get_db_session)) -> TipoZonaService:
    return TipoZonaService(TipoZonaCRUDRepository(session))


@router.get("", response_model=RespuestaAPIDTO, status_code=status.HTTP_200_OK)
async def listar_tipos_zona(
    pagina: int = 1,
    por_pagina: int = 10,
    buscar: str | None = None,
    ctx: ContextoEmpresa = Depends(obtener_contexto_empresa),
    service: TipoZonaService = Depends(obtener_tipo_zona_service)
):
    try:
        resultado = await service.listar_tipos_zona(
            empresa_id=ctx.empresa_usuario_id,
            pagina=pagina,
            por_pagina=por_pagina,
            buscar=buscar,
            **kwargs_listado(ctx),
        )
        return RespuestaAPIDTO(
            exito=True,
            datos=resultado,
            mensaje=f"Se encontraron {resultado['total']} tipos de zona",
        ).dict()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{id}", response_model=RespuestaAPIDTO, status_code=status.HTTP_200_OK)
async def obtener_tipo_zona(
    id: int,
    usuario_autenticado: dict = Depends(requiere_permiso("tipos_zona.leer")),
    es_admin: bool = Depends(es_super_admin),
    service: TipoZonaService = Depends(obtener_tipo_zona_service),
):
    try:
        empresa_id = None if es_admin else usuario_autenticado.get("empresa_id")
        datos = await service.obtener_tipo_zona(id, empresa_id)
        if not es_admin and datos["empresa_id"] != usuario_autenticado.get("empresa_id"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Tipo de zona recuperado").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("", response_model=RespuestaAPIDTO, status_code=status.HTTP_201_CREATED)
async def crear_tipo_zona(
    dto: TipoZonaCrearDTO,
    usuario_autenticado: dict = Depends(requiere_permiso("tipos_zona.crear")),
    service: TipoZonaService = Depends(obtener_tipo_zona_service),
):
    try:
        datos = await service.crear_tipo_zona(
            empresa_id=usuario_autenticado.get("empresa_id"),
            nombre=dto.nombre,
            activo=True,
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Tipo de zona creado").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/{id}", response_model=RespuestaAPIDTO, status_code=status.HTTP_200_OK)
async def actualizar_tipo_zona(
    id: int,
    dto: TipoZonaActualizarDTO,
    usuario_autenticado: dict = Depends(requiere_permiso("tipos_zona.editar")),
    service: TipoZonaService = Depends(obtener_tipo_zona_service),
):
    try:
        datos = await service.actualizar_tipo_zona(
            tipo_zona_id=id,
            empresa_id=usuario_autenticado.get("empresa_id"),
            nombre=dto.nombre,
            activo=bool(dto.activo) if dto.activo is not None else None,
        )
        return RespuestaAPIDTO(exito=True, datos=datos, mensaje="Tipo de zona actualizado").dict()
    except ValueError as e:
        msg = str(e)
        code = status.HTTP_404_NOT_FOUND if "no encontrado" in msg.lower() else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=code, detail=msg)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{id}", response_model=RespuestaAPIDTO, status_code=status.HTTP_200_OK)
async def eliminar_tipo_zona(
    id: int,
    usuario_autenticado: dict = Depends(requiere_permiso("tipos_zona.eliminar")),
    service: TipoZonaService = Depends(obtener_tipo_zona_service),
):
    try:
        resultado = await service.eliminar_tipo_zona(id, usuario_autenticado.get("empresa_id"))
        return RespuestaAPIDTO(exito=True, datos=resultado, mensaje="Tipo de zona eliminado").dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
