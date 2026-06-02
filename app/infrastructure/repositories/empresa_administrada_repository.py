"""Acceso a datos de empresas administradas por una maestra."""
from sqlalchemy import or_, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.infrastructure.models.empresa_administrada import EmpresaAdministrada
from app.infrastructure.models.usuario import Empresa


class EmpresaAdministradaRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    @staticmethod
    def _empresa_activa_cond():
        return (
            Empresa.activo == True,
            or_(Empresa.esta_activa == True, Empresa.esta_activa.is_(None)),
        )

    async def es_empresa_maestra(self, empresa_id: int) -> bool:
        stmt = select(Empresa.es_empresa_maestra).where(
            Empresa.id == empresa_id,
            Empresa.activo == True,
        )
        result = await self.session.execute(stmt)
        return bool(result.scalar())

    async def _listar_por_vinculo(self, empresa_maestra_id: int) -> list[Empresa]:
        activa_cond = self._empresa_activa_cond()
        stmt = (
            select(Empresa)
            .join(
                EmpresaAdministrada,
                EmpresaAdministrada.empresa_administrada_id == Empresa.id,
            )
            .where(
                EmpresaAdministrada.empresa_maestra_id == empresa_maestra_id,
                EmpresaAdministrada.activo == True,
                *activa_cond,
            )
            .options(selectinload(Empresa.usuarios))
            .order_by(Empresa.nombre)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def _listar_todas_activas(self) -> list[Empresa]:
        stmt = (
            select(Empresa)
            .where(*self._empresa_activa_cond())
            .order_by(Empresa.nombre)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def ensure_vinculos_maestra(self, empresa_maestra_id: int) -> None:
        """Vincula empresas activas a la maestra si empresa_administrada esta vacia."""
        try:
            empresas = await self._listar_todas_activas()
            for empresa in empresas:
                existe = await self.session.execute(
                    select(EmpresaAdministrada).where(
                        EmpresaAdministrada.empresa_maestra_id == empresa_maestra_id,
                        EmpresaAdministrada.empresa_administrada_id == empresa.id,
                    )
                )
                if existe.scalars().first():
                    continue
                self.session.add(
                    EmpresaAdministrada(
                        empresa_maestra_id=empresa_maestra_id,
                        empresa_administrada_id=empresa.id,
                        activo=True,
                    )
                )
            await self.session.commit()
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al vincular empresas administradas: {str(e)}") from e

    async def listar_empresas_administradas(self, empresa_maestra_id: int) -> list[Empresa]:
        try:
            empresas = await self._listar_por_vinculo(empresa_maestra_id)
            if empresas:
                return empresas

            await self.ensure_vinculos_maestra(empresa_maestra_id)
            empresas = await self._listar_por_vinculo(empresa_maestra_id)
            if empresas:
                return empresas

            return await self._listar_todas_activas()
        except SQLAlchemyError as e:
            raise Exception(f"Error al listar empresas administradas: {str(e)}") from e

    async def ids_empresas_administradas(self, empresa_maestra_id: int) -> list[int]:
        empresas = await self.listar_empresas_administradas(empresa_maestra_id)
        return [e.id for e in empresas]

    async def puede_administrar(self, empresa_maestra_id: int, empresa_objetivo_id: int) -> bool:
        if empresa_maestra_id == empresa_objetivo_id:
            if not await self.es_empresa_maestra(empresa_maestra_id):
                return empresa_maestra_id == 1
            return True
        stmt = select(EmpresaAdministrada.empresa_administrada_id).where(
            EmpresaAdministrada.empresa_maestra_id == empresa_maestra_id,
            EmpresaAdministrada.empresa_administrada_id == empresa_objetivo_id,
            EmpresaAdministrada.activo == True,
        )
        result = await self.session.execute(stmt)
        if result.scalar() is not None:
            return True
        if await self.es_empresa_maestra(empresa_maestra_id):
            activa = await self.session.execute(
                select(Empresa.id).where(Empresa.id == empresa_objetivo_id, *self._empresa_activa_cond())
            )
            return activa.scalar() is not None
        return False
