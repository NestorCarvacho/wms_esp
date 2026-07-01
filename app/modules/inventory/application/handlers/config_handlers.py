"""Handlers de configuración de bodega."""
from __future__ import annotations

from app.modules.inventory.application.commands import ActualizarConfigBodegaCommand
from app.modules.inventory.domain.ports import IInventarioRepository, IUnitOfWork


class ObtenerConfigBodegaHandler:
    def __init__(self, repo: IInventarioRepository):
        self.repo = repo

    async def handle(self, bodega_id: int, empresa_id: int) -> dict:
        if not await self.repo.bodega_existe(bodega_id, empresa_id):
            raise ValueError("Bodega no encontrada")
        cfg = await self.repo.get_bodega_config(bodega_id)
        return {
            "bodega_id": bodega_id,
            "zona_recepcion_default_id": cfg.zona_recepcion_default_id if cfg else None,
        }


class ActualizarConfigBodegaHandler:
    def __init__(self, uow: IUnitOfWork):
        self.uow = uow

    async def handle(self, cmd: ActualizarConfigBodegaCommand) -> dict:
        repo = self.uow.inventario
        if not await repo.bodega_existe(cmd.bodega_id, cmd.empresa_id):
            raise ValueError("Bodega no encontrada")
        if cmd.zona_recepcion_default_id is not None:
            zona = await repo.obtener_zona(cmd.zona_recepcion_default_id, cmd.empresa_id)
            if not zona or zona.bodega_id != cmd.bodega_id:
                raise ValueError("La zona debe pertenecer a la bodega")
        await repo.upsert_bodega_config(cmd.bodega_id, cmd.zona_recepcion_default_id)
        await self.uow.commit()
        return await ObtenerConfigBodegaHandler(repo).handle(cmd.bodega_id, cmd.empresa_id)
