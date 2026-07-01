"""Handler: resolución de permisos efectivos por usuario."""
from __future__ import annotations

from app.modules.iam.domain.ports import IAutorizacionRepository


class ResolverPermisosUsuarioQueryHandler:
    def __init__(self, repo: IAutorizacionRepository):
        self.repo = repo

    async def handle(self, usuario_id: int, empresa_id: int) -> tuple[list[str], list[str]]:
        return await self.repo.resolver_permisos_por_usuario(usuario_id, empresa_id)
