"""Resolución de moneda y tipos de cambio para órdenes cross-border."""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.request_context import get_request_locale
from app.infrastructure.repositories.tipo_cambio_repository import TipoCambioRepository

# Tasas de referencia para desarrollo / fallback (base USD)
_FALLBACK_RATES: dict[str, Decimal] = {
    "USD": Decimal("1"),
    "CLP": Decimal("950"),
    "MXN": Decimal("17.2"),
    "EUR": Decimal("0.92"),
}


class CurrencyResolver:
    """Resuelve montos en moneda de la orden y persiste el tipo de cambio histórico."""

    def __init__(self, session: AsyncSession):
        self.repo = TipoCambioRepository(session)

    async def resolver_tasa(
        self,
        empresa_id: int,
        moneda_origen: str,
        moneda_destino: str,
        en_fecha: datetime | None = None,
    ) -> Decimal:
        origen = moneda_origen.upper()
        destino = moneda_destino.upper()
        if origen == destino:
            return Decimal("1")

        historico = await self.repo.obtener_vigente(empresa_id, origen, destino, en_fecha)
        if historico:
            return Decimal(str(historico.tasa))

        return self._calcular_tasa_fallback(origen, destino)

    async def convertir(
        self,
        empresa_id: int,
        monto: Decimal,
        moneda_origen: str,
        moneda_destino: str,
        documento_tipo: str | None = None,
        documento_id: int | None = None,
        persistir: bool = True,
    ) -> dict:
        tasa = await self.resolver_tasa(empresa_id, moneda_origen, moneda_destino)
        convertido = (monto * tasa).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        registro = None
        if persistir and moneda_origen.upper() != moneda_destino.upper():
            registro = await self.repo.registrar(
                empresa_id=empresa_id,
                moneda_origen=moneda_origen,
                moneda_destino=moneda_destino,
                tasa=tasa,
                documento_tipo=documento_tipo,
                documento_id=documento_id,
            )

        return {
            "monto_origen": float(monto),
            "moneda_origen": moneda_origen.upper(),
            "monto_destino": float(convertido),
            "moneda_destino": moneda_destino.upper(),
            "tasa": float(tasa),
            "tipo_cambio_id": registro.id if registro else None,
        }

    async def moneda_operacion(self, empresa_moneda: str | None = None) -> str:
        ctx = get_request_locale()
        return (empresa_moneda or ctx.currency).upper()

    def _calcular_tasa_fallback(self, origen: str, destino: str) -> Decimal:
        base_origen = _FALLBACK_RATES.get(origen, Decimal("1"))
        base_destino = _FALLBACK_RATES.get(destino, Decimal("1"))
        if base_origen == 0:
            return Decimal("1")
        return (base_destino / base_origen).quantize(Decimal("0.00000001"))
