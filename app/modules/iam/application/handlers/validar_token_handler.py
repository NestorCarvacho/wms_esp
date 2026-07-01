"""Handler: validar payload JWT contra estado del usuario."""
from __future__ import annotations

from app.modules.iam.application.commands import ValidarTokenQuery
from app.modules.iam.domain.ports import IUserAuthRepository


class ValidarTokenQueryHandler:
    def __init__(self, usuarios: IUserAuthRepository):
        self.usuarios = usuarios

    async def handle(self, query: ValidarTokenQuery) -> bool:
        usuario_id = query.payload.get("usuario_id")
        empresa_id = query.payload.get("empresa_id")
        if not usuario_id or not empresa_id:
            return False
        usuario = await self.usuarios.obtener_por_id(int(usuario_id), int(empresa_id))
        return usuario is not None and usuario.activo
