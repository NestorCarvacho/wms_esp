"""
Resolución de permisos efectivos — fachada sobre módulo IAM.
Usuario → usuario_rol → Rol → rol_permiso → Permiso.
"""
from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.container import build_iam_handlers


class AutorizacionService:
    def __init__(self, session: AsyncSession):
        self._handler = build_iam_handlers(session).resolver_permisos

    async def resolver_permisos_por_usuario(
        self,
        usuario_id: int,
        empresa_id: int,
    ) -> tuple[list[str], list[str]]:
        return await self._handler.handle(usuario_id, empresa_id)
