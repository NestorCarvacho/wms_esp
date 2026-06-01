"""Servicio de asignación rol ↔ permiso."""
from typing import Any, Dict

from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.services.empresa_maestra_service import EmpresaMaestraService
from app.infrastructure.repositories.empresa_administrada_repository import EmpresaAdministradaRepository
from app.infrastructure.repositories.rol_permiso_crud_repository import RolPermisoCRUDRepository


class RolPermisoService:
    def __init__(self, repository: RolPermisoCRUDRepository, session: AsyncSession):
        self.repository = repository
        self.session = session

    async def _empresa_efectiva_rol(self, rol_id: int, usuario: dict) -> int:
        """Resuelve la empresa del rol y valida acceso multi-tenant."""
        rol = await self.repository.obtener_rol(rol_id)
        if not rol:
            raise ValueError("Rol no encontrado")

        empresa_caller = usuario.get("empresa_id")
        es_maestra = bool(usuario.get("es_empresa_maestra"))

        if not es_maestra:
            if rol.empresa_id != empresa_caller:
                raise ValueError("No autorizado para gestionar permisos de este rol")
            return rol.empresa_id

        maestra = EmpresaMaestraService(EmpresaAdministradaRepository(self.session))
        try:
            await maestra.validar_acceso(empresa_caller, rol.empresa_id)
        except ValueError as e:
            raise ValueError(str(e)) from e
        return rol.empresa_id

    async def listar_por_rol(self, rol_id: int, usuario: dict) -> Dict[str, Any]:
        empresa_id = await self._empresa_efectiva_rol(rol_id, usuario)
        rows = await self.repository.listar_por_rol(rol_id, empresa_id)
        return {
            "rol_id": rol_id,
            "permiso_ids": [permiso.id for _, permiso in rows],
            "permisos": [
                {"permiso_id": permiso.id, "codigo": permiso.codigo, "descripcion": permiso.descripcion}
                for _, permiso in rows
            ],
        }

    async def sincronizar(self, rol_id: int, usuario: dict, permiso_ids: list[int]) -> Dict[str, Any]:
        empresa_id = await self._empresa_efectiva_rol(rol_id, usuario)
        ids = await self.repository.sincronizar(rol_id, empresa_id, permiso_ids)
        return {"rol_id": rol_id, "permiso_ids": ids}
