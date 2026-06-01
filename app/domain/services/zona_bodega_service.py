"""Servicio CRUD de Zonas de Bodega."""
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.repositories.zona_bodega_crud_repository import ZonaBodegaCRUDRepository
from app.infrastructure.repositories.bodega_crud_repository import BodegaCRUDRepository
from app.infrastructure.repositories.tipo_zona_crud_repository import TipoZonaCRUDRepository
from app.domain.services.display_helpers import format_empresa_nombre


class ZonaBodegaService:
    def __init__(self, repository: ZonaBodegaCRUDRepository, session: AsyncSession):
        self.repository = repository
        self.bodega_repo = BodegaCRUDRepository(session)
        self.tipo_zona_repo = TipoZonaCRUDRepository(session)

    async def _validar_relaciones(
        self,
        bodega_id: int,
        tipo_zona_id: int,
        empresa_id: int,
        es_super_admin: bool = False,
    ) -> tuple:
        bodega = await self.bodega_repo.obtener_por_id(
            bodega_id, None if es_super_admin else empresa_id
        )
        if not bodega or not bodega.activo:
            raise ValueError("Bodega no encontrada")
        tipo = await self.tipo_zona_repo.obtener_por_id(
            tipo_zona_id, None if es_super_admin else empresa_id
        )
        if not tipo or not tipo.activo:
            raise ValueError("Tipo de zona no encontrado")
        if bodega.empresa_id != tipo.empresa_id:
            raise ValueError("La bodega y el tipo de zona deben pertenecer a la misma empresa")
        if not es_super_admin and bodega.empresa_id != empresa_id:
            raise ValueError("No tiene permiso para operar en otra empresa")
        return bodega, tipo

    def _serializar(self, z) -> Dict[str, Any]:
        bodega = z.bodega
        tipo = z.tipo_zona
        return {
            "id": z.id,
            "bodega_id": z.bodega_id,
            "bodega_nombre": bodega.nombre if bodega else None,
            "tipo_zona_id": z.tipo_zona_id,
            "tipo_zona_nombre": tipo.nombre if tipo else None,
            "nombre": z.nombre,
            "activo": z.activo,
            "empresa_id": bodega.empresa_id if bodega else None,
            "empresa_nombre": format_empresa_nombre(bodega.empresa) if bodega else None,
        }

    async def listar_zonas_bodega(
        self,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 10,
        es_super_admin: bool = False,
        empresa_id_filtro: int | None = None,
        empresas_scope_ids: list[int] | None = None,
        bodega_id: int | None = None,
        buscar: str | None = None,
    ) -> Dict[str, Any]:
        zonas, total = await self.repository.listar(
            empresa_id=empresa_id,
            pagina=pagina,
            por_pagina=por_pagina,
            es_super_admin=es_super_admin,
            empresa_id_filtro=empresa_id_filtro,
            empresas_scope_ids=empresas_scope_ids,
            bodega_id=bodega_id,
            buscar=buscar,
        )
        return {
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "zonas_bodega": [self._serializar(z) for z in zonas],
        }

    async def obtener_zona_bodega(
        self,
        zona_id: int,
        empresa_id: int | None = None,
    ) -> Dict[str, Any]:
        zona = await self.repository.obtener_por_id(zona_id, empresa_id)
        if not zona:
            raise ValueError("Zona de bodega no encontrada")
        return self._serializar(zona)

    async def crear_zona_bodega(
        self,
        empresa_id: int,
        bodega_id: int,
        tipo_zona_id: int,
        nombre: str | None = None,
        activo: bool = True,
        es_super_admin: bool = False,
    ) -> Dict[str, Any]:
        await self._validar_relaciones(bodega_id, tipo_zona_id, empresa_id, es_super_admin)
        nueva = await self.repository.crear(bodega_id, tipo_zona_id, nombre, activo)
        return self._serializar(nueva)

    async def actualizar_zona_bodega(
        self,
        zona_id: int,
        empresa_id: int,
        bodega_id: int | None = None,
        tipo_zona_id: int | None = None,
        nombre: str | None = None,
        activo: bool | None = None,
        es_super_admin: bool = False,
    ) -> Dict[str, Any]:
        filtro = None if es_super_admin else empresa_id
        existente = await self.repository.obtener_por_id(zona_id, filtro)
        if not existente:
            raise ValueError("Zona de bodega no encontrada")

        new_bodega_id = bodega_id if bodega_id is not None else existente.bodega_id
        new_tipo_id = tipo_zona_id if tipo_zona_id is not None else existente.tipo_zona_id
        await self._validar_relaciones(new_bodega_id, new_tipo_id, empresa_id, es_super_admin)

        actualizada = await self.repository.actualizar(
            zona_id,
            filtro,
            bodega_id=bodega_id,
            tipo_zona_id=tipo_zona_id,
            nombre=nombre,
            activo=activo,
        )
        if not actualizada:
            raise ValueError("Error al actualizar zona de bodega")
        return self._serializar(actualizada)

    async def eliminar_zona_bodega(
        self,
        zona_id: int,
        empresa_id: int | None = None,
        es_super_admin: bool = False,
    ) -> Dict[str, Any]:
        filtro = None if es_super_admin else empresa_id
        zona = await self.repository.obtener_por_id(zona_id, filtro)
        if not zona:
            raise ValueError("Zona de bodega no encontrada")
        ok = await self.repository.eliminar(zona_id, filtro or (zona.bodega.empresa_id if zona.bodega else empresa_id))
        if not ok:
            raise ValueError("Error al eliminar zona de bodega")
        label = zona.nombre or f"#{zona.id}"
        return {"mensaje": f"Zona '{label}' eliminada", "zona_bodega_id": zona_id}
