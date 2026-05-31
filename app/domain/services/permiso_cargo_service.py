"""
Servicio CRUD de Permisos Cargo.
"""
from typing import Any, Dict

from app.infrastructure.repositories.permiso_cargo_crud_repository import PermisoCargoCRUDRepository
from app.domain.services.display_helpers import format_empresa_nombre


class PermisoCargoService:
    def __init__(self, repository: PermisoCargoCRUDRepository):
        self.repository = repository

    async def listar_permisos(
        self,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 10,
        es_super_admin: bool = False,
    ) -> Dict[str, Any]:
        rows, total = await self.repository.listar(
            empresa_id=empresa_id,
            pagina=pagina,
            por_pagina=por_pagina,
            es_super_admin=es_super_admin,
        )

        return {
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "permisos_cargo": [
                {
                    "cargo_id": permiso.cargo_id,
                    "rol_id": permiso.rol_id,
                    "activo": permiso.activo,
                    "cargo_nombre": cargo.nombre,
                    "rol_nombre": rol.nombre,
                    "empresa_id": cargo.empresa_id,
                    "empresa_nombre": format_empresa_nombre(empresa),
                }
                for permiso, cargo, rol, empresa in rows
            ],
        }

    async def crear_permiso(
        self,
        empresa_id: int,
        cargo_id: int,
        rol_id: int,
        activo: int = 1,
        es_super_admin: bool = False,
    ) -> Dict[str, Any]:
        cargo = await self.repository.obtener_cargo(
            cargo_id, None if es_super_admin else empresa_id
        )
        if not cargo:
            raise ValueError("Cargo no encontrado")

        rol = await self.repository.obtener_rol(
            rol_id, None if es_super_admin else empresa_id
        )
        if not rol:
            raise ValueError("Rol no encontrado")

        if cargo.empresa_id != rol.empresa_id:
            raise ValueError("El cargo y el rol deben pertenecer a la misma empresa")

        if not es_super_admin and cargo.empresa_id != empresa_id:
            raise ValueError("No tiene permiso para asignar permisos en otra empresa")

        permiso = await self.repository.crear(cargo_id, rol_id, activo == 1)
        return {
            "cargo_id": permiso.cargo_id,
            "rol_id": permiso.rol_id,
            "activo": permiso.activo,
            "cargo_nombre": cargo.nombre,
            "rol_nombre": rol.nombre,
            "empresa_id": cargo.empresa_id,
        }

    async def actualizar_permiso(
        self,
        empresa_id: int,
        cargo_id: int,
        rol_id: int,
        activo: int,
        es_super_admin: bool = False,
    ) -> Dict[str, Any]:
        filtro_empresa = None if es_super_admin else empresa_id
        row = await self.repository.obtener(cargo_id, rol_id, filtro_empresa)
        if not row:
            raise ValueError("Permiso cargo no encontrado")

        permiso, cargo, rol = row
        if not es_super_admin and cargo.empresa_id != empresa_id:
            raise ValueError("No tiene permiso para modificar permisos de otra empresa")

        actualizado = await self.repository.actualizar(cargo_id, rol_id, activo == 1)
        if not actualizado:
            raise ValueError("Error al actualizar permiso cargo")

        return {
            "cargo_id": actualizado.cargo_id,
            "rol_id": actualizado.rol_id,
            "activo": actualizado.activo,
            "cargo_nombre": cargo.nombre,
            "rol_nombre": rol.nombre,
            "empresa_id": cargo.empresa_id,
        }

    async def eliminar_permiso(
        self,
        empresa_id: int,
        cargo_id: int,
        rol_id: int,
        es_super_admin: bool = False,
    ) -> Dict[str, Any]:
        filtro_empresa = None if es_super_admin else empresa_id
        row = await self.repository.obtener(cargo_id, rol_id, filtro_empresa)
        if not row:
            raise ValueError("Permiso cargo no encontrado")

        _, cargo, _ = row
        if not es_super_admin and cargo.empresa_id != empresa_id:
            raise ValueError("No tiene permiso para eliminar permisos de otra empresa")

        resultado = await self.repository.eliminar(cargo_id, rol_id)
        if not resultado:
            raise ValueError("Error al eliminar permiso cargo")

        return {"mensaje": "Permiso cargo eliminado exitosamente"}

    async def listar_roles_cargo(self, cargo_id: int, empresa_id: int, es_super_admin: bool = False) -> Dict[str, Any]:
        filtro = None if es_super_admin else empresa_id
        cargo = await self.repository.obtener_cargo(cargo_id, filtro)
        if not cargo:
            raise ValueError("Cargo no encontrado")
        if not es_super_admin and cargo.empresa_id != empresa_id:
            raise ValueError("No tiene permiso para consultar roles de otro cargo")
        rol_ids = await self.repository.listar_roles_por_cargo(cargo_id, cargo.empresa_id)
        return {"cargo_id": cargo_id, "rol_ids": rol_ids}

    async def sincronizar_roles_cargo(
        self,
        cargo_id: int,
        empresa_id: int,
        rol_ids: list[int],
        es_super_admin: bool = False,
    ) -> Dict[str, Any]:
        filtro = None if es_super_admin else empresa_id
        cargo = await self.repository.obtener_cargo(cargo_id, filtro)
        if not cargo:
            raise ValueError("Cargo no encontrado")
        if not es_super_admin and cargo.empresa_id != empresa_id:
            raise ValueError("No tiene permiso para modificar roles de otro cargo")
        ids = await self.repository.sincronizar_roles_cargo(cargo_id, cargo.empresa_id, rol_ids)
        return {"cargo_id": cargo_id, "rol_ids": ids}
