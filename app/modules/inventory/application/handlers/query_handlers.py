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
