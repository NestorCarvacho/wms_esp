"""Servicio CRUD de permisos."""
from typing import Any, Dict

from app.infrastructure.repositories.permiso_crud_repository import PermisoCRUDRepository
from app.domain.services.display_helpers import format_empresa_nombre


class PermisoService:
    def __init__(self, repository: PermisoCRUDRepository):
        self.repository = repository

    async def listar(
        self,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 10,
        es_super_admin: bool = False,
        empresa_id_filtro: int | None = None,
        buscar: str | None = None,
    ) -> Dict[str, Any]:
        permisos, total = await self.repository.listar(
            empresa_id, pagina, por_pagina, es_super_admin, empresa_id_filtro, buscar
        )
        return {
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "permisos": [
                {
                    "id": p.id,
                    "empresa_id": p.empresa_id,
                    "empresa_nombre": format_empresa_nombre(p.empresa),
                    "codigo": p.codigo,
                    "descripcion": p.descripcion,
                    "activo": p.activo,
                }
                for p in permisos
            ],
        }

    async def crear(
        self,
        empresa_id: int,
        codigo: str,
        descripcion: str | None = None,
        activo: bool = True,
    ) -> Dict[str, Any]:
        codigo = codigo.strip()
        if not codigo:
            raise ValueError("El código del permiso no puede estar vacío")
        existente = await self.repository.obtener_por_codigo(codigo, empresa_id)
        if existente:
            raise ValueError(f"Ya existe el permiso '{codigo}' en esta empresa")
        permiso = await self.repository.crear(empresa_id, codigo, descripcion, activo)
        return {"id": permiso.id, "codigo": permiso.codigo, "descripcion": permiso.descripcion}

    async def actualizar(self, permiso_id: int, empresa_id: int, **campos) -> Dict[str, Any]:
        if "codigo" in campos and campos["codigo"]:
            existente = await self.repository.obtener_por_codigo(campos["codigo"].strip(), empresa_id)
            if existente and existente.id != permiso_id:
                raise ValueError(f"Ya existe el permiso '{campos['codigo']}' en esta empresa")
        actualizado = await self.repository.actualizar(permiso_id, empresa_id, **campos)
        if not actualizado:
            raise ValueError("Permiso no encontrado")
        return {
            "id": actualizado.id,
            "codigo": actualizado.codigo,
            "descripcion": actualizado.descripcion,
            "activo": actualizado.activo,
        }

    async def eliminar(self, permiso_id: int, empresa_id: int) -> Dict[str, Any]:
        if not await self.repository.eliminar(permiso_id, empresa_id):
            raise ValueError("Permiso no encontrado")
        return {"mensaje": "Permiso eliminado exitosamente"}
