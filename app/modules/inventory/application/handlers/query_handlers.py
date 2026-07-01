"""Handlers de consultas (CQRS read side)."""
from __future__ import annotations

from typing import Any

from app.modules.inventory.application.mappers import serializar_movimiento
from app.modules.inventory.domain.ports import IInventarioRepository


class ListarStockHandler:
    def __init__(self, repo: IInventarioRepository):
        self.repo = repo

    async def handle(self, empresa_id: int, **kwargs: Any) -> dict:
        items, total = await self.repo.listar_stock(empresa_id=empresa_id, **kwargs)
        return {
            "total": total,
            "pagina": kwargs.get("pagina", 1),
            "por_pagina": kwargs.get("por_pagina", 50),
            "stock": items,
        }


class ListarMovimientosHandler:
    def __init__(self, repo: IInventarioRepository):
        self.repo = repo

    async def handle(self, empresa_id: int, **kwargs: Any) -> dict:
        rows, total = await self.repo.listar_movimientos(empresa_id=empresa_id, **kwargs)
        return {
            "total": total,
            "pagina": kwargs.get("pagina", 1),
            "por_pagina": kwargs.get("por_pagina", 50),
            "movimientos": [serializar_movimiento(m) for m in rows],
        }


class DashboardHandler:
    def __init__(self, repo: IInventarioRepository):
        self.repo = repo

    async def handle(self, empresa_id: int, **kwargs: Any) -> dict:
        raw = await self.repo.resumen_dashboard(empresa_id=empresa_id, **kwargs)
        return {
            "lineas_stock": raw["lineas_stock"],
            "productos_con_stock": raw["productos_con_stock"],
            "ubicaciones_con_stock": raw["ubicaciones_con_stock"],
            "movimientos_hoy": raw["movimientos_hoy"],
            "movimientos_semana": raw["movimientos_semana"],
            "movimientos_por_tipo_semana": raw["movimientos_por_tipo_semana"],
            "histograma_movimientos": raw["histograma_movimientos"],
            "stock_distribucion": raw["stock_distribucion"],
            "ultimos_movimientos": [
                serializar_movimiento(m) for m in raw["ultimos_movimientos"]
            ],
        }
