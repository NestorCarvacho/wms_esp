"""Acceso a datos de empresas administradas por una maestra."""
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.infrastructure.models.empresa_administrada import EmpresaAdministrada
from app.infrastructure.models.usuario import Empresa


class EmpresaAdministradaRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def es_empresa_maestra(self, empresa_id: int) -> bool:
        stmt = select(Empresa.es_empresa_maestra).where(
            Empresa.id == empresa_id,
            Empresa.activo == True,
        )
        result = await self.session.execute(stmt)
        return bool(result.scalar())

    async def listar_empresas_administradas(self, empresa_maestra_id: int) -> list[Empresa]:
        try:
            stmt = (
                select(Empresa)
                .join(
                    EmpresaAdministrada,
                    EmpresaAdministrada.empresa_administrada_id == Empresa.id,
                )
                .where(
                    EmpresaAdministrada.empresa_maestra_id == empresa_maestra_id,
                    EmpresaAdministrada.activo == True,
                    Empresa.activo == True,
                    Empresa.esta_activa == True,
                )
                .options(selectinload(Empresa.usuarios))
                .order_by(Empresa.nombre)
            )
            result = await self.session.execute(stmt)
            return list(result.scalars().unique().all())
        except SQLAlchemyError as e:
            raise Exception(f"Error al listar empresas administradas: {str(e)}") from e

    async def ids_empresas_administradas(self, empresa_maestra_id: int) -> list[int]:
        empresas = await self.listar_empresas_administradas(empresa_maestra_id)
        return [e.id for e in empresas]

    async def puede_administrar(self, empresa_maestra_id: int, empresa_objetivo_id: int) -> bool:
        if empresa_maestra_id == empresa_objetivo_id:
            if not await self.es_empresa_maestra(empresa_maestra_id):
                return False
            return True
        stmt = select(EmpresaAdministrada.empresa_administrada_id).where(
            EmpresaAdministrada.empresa_maestra_id == empresa_maestra_id,
            EmpresaAdministrada.empresa_administrada_id == empresa_objetivo_id,
            EmpresaAdministrada.activo == True,
        )
        result = await self.session.execute(stmt)
        return result.scalar() is not None
