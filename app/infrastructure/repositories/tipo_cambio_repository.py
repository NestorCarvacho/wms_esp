"""Acceso a datos de tipos de cambio históricos."""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.models.usuario import TipoCambioHistorico


class TipoCambioRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def obtener_vigente(
        self,
        empresa_id: int,
        moneda_origen: str,
        moneda_destino: str,
        en_fecha: datetime | None = None,
    ) -> TipoCambioHistorico | None:
        ref = en_fecha or datetime.utcnow()
        stmt = (
            select(TipoCambioHistorico)
            .where(
                and_(
                    TipoCambioHistorico.empresa_id == empresa_id,
                    TipoCambioHistorico.moneda_origen == moneda_origen.upper(),
                    TipoCambioHistorico.moneda_destino == moneda_destino.upper(),
                    TipoCambioHistorico.vigente_desde <= ref,
                    or_(
                        TipoCambioHistorico.vigente_hasta.is_(None),
                        TipoCambioHistorico.vigente_hasta >= ref,
                    ),
                )
            )
            .order_by(TipoCambioHistorico.vigente_desde.desc())
            .limit(1)
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def registrar(
        self,
        empresa_id: int,
        moneda_origen: str,
        moneda_destino: str,
        tasa: Decimal,
        documento_tipo: str | None = None,
        documento_id: int | None = None,
        vigente_desde: datetime | None = None,
    ) -> TipoCambioHistorico:
        origen = moneda_origen.upper()
        destino = moneda_destino.upper()
        inicio = vigente_desde or datetime.utcnow()

        previo = await self.obtener_vigente(empresa_id, origen, destino, inicio)
        if previo and previo.vigente_hasta is None:
            previo.vigente_hasta = inicio
            self.session.add(previo)

        row = TipoCambioHistorico(
            empresa_id=empresa_id,
            moneda_origen=origen,
            moneda_destino=destino,
            tasa=tasa,
            vigente_desde=inicio,
            documento_tipo=documento_tipo,
            documento_id=documento_id,
        )
        self.session.add(row)
        await self.session.flush()
        return row
