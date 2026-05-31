"""Servicio de asignación rol ↔ permiso."""
from typing import Any, Dict

from app.infrastructure.repositories.rol_permiso_crud_repository import RolPermisoCRUDRepository


class RolPermisoService:
    def __init__(self, repository: RolPermisoCRUDRepository):
        self.repository = repository

    async def listar_por_rol(self, rol_id: int, empresa_id: int) -> Dict[str, Any]:
        rows = await self.repository.listar_por_rol(rol_id, empresa_id)
        return {
            "rol_id": rol_id,
            "permiso_ids": [permiso.id for _, permiso in rows],
            "permisos": [
                {"permiso_id": permiso.id, "codigo": permiso.codigo, "descripcion": permiso.descripcion}
                for _, permiso in rows
            ],
        }

    async def sincronizar(self, rol_id: int, empresa_id: int, permiso_ids: list[int]) -> Dict[str, Any]:
        ids = await self.repository.sincronizar(rol_id, empresa_id, permiso_ids)
        return {"rol_id": rol_id, "permiso_ids": ids}
