"""Servicio de asignación usuario ↔ rol."""
from app.infrastructure.repositories.usuario_rol_crud_repository import UsuarioRolCRUDRepository


class UsuarioRolService:
    def __init__(self, repository: UsuarioRolCRUDRepository):
        self.repository = repository

    async def _resolver_usuario(
        self, usuario_id: int, empresa_id_caller: int, es_maestra: bool = False
    ):
        usuario = await self.repository.obtener_usuario(
            usuario_id, None if es_maestra else empresa_id_caller
        )
        if not usuario:
            raise ValueError("Usuario no encontrado")
        if not es_maestra and usuario.empresa_id != empresa_id_caller:
            raise ValueError("No autorizado para gestionar roles de este usuario")
        return usuario

    async def listar_roles(
        self, usuario_id: int, empresa_id_caller: int, es_maestra: bool = False
    ) -> dict:
        usuario = await self._resolver_usuario(usuario_id, empresa_id_caller, es_maestra)
        rol_ids = await self.repository.listar_roles_por_usuario(usuario_id, usuario.empresa_id)
        return {"usuario_id": usuario_id, "rol_ids": rol_ids}

    async def sincronizar(
        self,
        usuario_id: int,
        empresa_id_caller: int,
        rol_ids: list[int],
        es_maestra: bool = False,
    ) -> dict:
        usuario = await self._resolver_usuario(usuario_id, empresa_id_caller, es_maestra)
        ids = await self.repository.sincronizar_roles_usuario(
            usuario_id, usuario.empresa_id, rol_ids
        )
        return {"usuario_id": usuario_id, "rol_ids": ids}
