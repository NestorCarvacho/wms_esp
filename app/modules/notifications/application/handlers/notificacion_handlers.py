"""Handlers de bandeja de notificaciones."""
from __future__ import annotations

from datetime import datetime

from app.modules.notifications.application.commands import CrearNotificacionCommand
from app.modules.notifications.application.notificacion_mappers import serializar_notificacion
from app.modules.notifications.domain.ports import INotificacionRepository


class ListarNotificacionesQueryHandler:
    def __init__(self, repo: INotificacionRepository):
        self.repo = repo

    async def handle(
        self,
        usuario_id: int,
        *,
        pagina: int = 1,
        por_pagina: int = 10,
        leida: bool | None = None,
    ) -> dict:
        items, total = await self.repo.listar(
            usuario_id, pagina=pagina, por_pagina=por_pagina, leida=leida
        )
        return {
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "notificaciones": [serializar_notificacion(n) for n in items],
        }


class ContarNoLeidasQueryHandler:
    def __init__(self, repo: INotificacionRepository):
        self.repo = repo

    async def handle(self, usuario_id: int) -> dict:
        return {"total": await self.repo.contar_no_leidas(usuario_id)}


class CrearNotificacionHandler:
    def __init__(self, repo: INotificacionRepository):
        self.repo = repo

    async def handle(self, cmd: CrearNotificacionCommand) -> dict:
        n = await self.repo.crear(
            empresa_id=cmd.empresa_id,
            usuario_id=cmd.usuario_id,
            tipo=cmd.tipo,
            titulo=cmd.titulo,
            mensaje=cmd.mensaje,
            payload=cmd.payload,
        )
        return serializar_notificacion(n)


class MarcarNotificacionLeidaHandler:
    def __init__(self, repo: INotificacionRepository):
        self.repo = repo

    async def handle(self, notificacion_id: int, usuario_id: int) -> dict:
        if not await self.repo.marcar_leida(notificacion_id, usuario_id):
            raise ValueError("Notificación no encontrada")
        return {"mensaje": "Notificación marcada como leída", "leida_at": datetime.utcnow().isoformat()}


class MarcarTodasLeidasHandler:
    def __init__(self, repo: INotificacionRepository):
        self.repo = repo

    async def handle(self, usuario_id: int) -> dict:
        total = await self.repo.marcar_todas_leidas(usuario_id)
        return {"mensaje": f"{total} notificación(es) marcadas como leídas", "total": total}
