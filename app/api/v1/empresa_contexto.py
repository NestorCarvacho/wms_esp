"""Contexto de empresa para operaciones multi-tenant."""
from dataclasses import dataclass

from fastapi import Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import obtener_usuario_autenticado
from app.domain.services.empresa_maestra_service import EmpresaMaestraService
from app.infrastructure.database import get_db_session
from app.infrastructure.repositories.empresa_administrada_repository import EmpresaAdministradaRepository


@dataclass
class ContextoEmpresa:
    empresa_usuario_id: int
    es_empresa_maestra: bool
    empresa_id_filtro: int | None
    empresas_administradas_ids: list[int]

    @property
    def es_super_admin(self) -> bool:
        return self.es_empresa_maestra

    def empresa_operacion(self) -> int:
        """Empresa efectiva para crear/actualizar."""
        if self.empresa_id_filtro is not None:
            return self.empresa_id_filtro
        return self.empresa_usuario_id

    def empresas_scope_ids(self) -> list[int] | None:
        """IDs para listados agregados (sin filtro explícito)."""
        if not self.es_empresa_maestra or self.empresa_id_filtro is not None:
            return None
        return self.empresas_administradas_ids


def kwargs_listado(ctx: ContextoEmpresa) -> dict:
    """Parámetros comunes para servicios de listado."""
    return {
        "es_super_admin": ctx.es_empresa_maestra,
        "empresa_id_filtro": ctx.empresa_id_filtro,
        "empresas_scope_ids": ctx.empresas_scope_ids(),
    }


async def resolver_empresa_creacion(
    usuario: dict,
    empresa_id_body: int | None,
    session: AsyncSession,
) -> int:
    """Determina la empresa destino al crear registros."""
    empresa_usuario_id = usuario.get("empresa_id")
    es_maestra = bool(usuario.get("es_empresa_maestra"))

    if not es_maestra:
        if empresa_id_body is not None and empresa_id_body != empresa_usuario_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No autorizado para crear en otra empresa",
            )
        return empresa_usuario_id

    if empresa_id_body is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debe indicar la empresa (empresa_id)",
        )

    maestra_service = EmpresaMaestraService(EmpresaAdministradaRepository(session))
    try:
        await maestra_service.validar_acceso(empresa_usuario_id, empresa_id_body)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e
    return empresa_id_body


async def obtener_contexto_empresa(
    usuario: dict = Depends(obtener_usuario_autenticado),
    empresa_id: int | None = Query(None, description="Filtrar por empresa (empresa maestra)"),
    session: AsyncSession = Depends(get_db_session),
) -> ContextoEmpresa:
    empresa_usuario_id = usuario.get("empresa_id")
    es_maestra = bool(usuario.get("es_empresa_maestra"))

    if not es_maestra:
        if empresa_id is not None and empresa_id != empresa_usuario_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No autorizado para operar sobre otra empresa",
            )
        return ContextoEmpresa(
            empresa_usuario_id=empresa_usuario_id,
            es_empresa_maestra=False,
            empresa_id_filtro=None,
            empresas_administradas_ids=[empresa_usuario_id],
        )

    maestra_service = EmpresaMaestraService(EmpresaAdministradaRepository(session))
    administradas_ids = await maestra_service.ids_administradas(empresa_usuario_id)

    filtro = empresa_id
    if filtro is not None:
        try:
            await maestra_service.validar_acceso(empresa_usuario_id, filtro)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e

    return ContextoEmpresa(
        empresa_usuario_id=empresa_usuario_id,
        es_empresa_maestra=True,
        empresa_id_filtro=filtro,
        empresas_administradas_ids=administradas_ids,
    )
