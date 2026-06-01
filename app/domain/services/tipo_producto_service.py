"""Servicio CRUD de Tipos de Producto."""
from typing import Dict, Any
from app.infrastructure.repositories.tipo_producto_crud_repository import TipoProductoCRUDRepository
from app.domain.services.display_helpers import format_empresa_nombre


class TipoProductoService:
    def __init__(self, repository: TipoProductoCRUDRepository):
        self.repository = repository

    async def listar_tipos_producto(
        self,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 10,
        es_super_admin: bool = False,
        empresa_id_filtro: int | None = None,
        empresas_scope_ids: list[int] | None = None,
        buscar: str | None = None,
    ) -> Dict[str, Any]:
        tipos, total = await self.repository.listar(
            empresa_id=empresa_id,
            pagina=pagina,
            por_pagina=por_pagina,
            es_super_admin=es_super_admin,
            empresa_id_filtro=empresa_id_filtro,
            empresas_scope_ids=empresas_scope_ids,
            buscar=buscar,
        )
        return {
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "tipos_producto": [
                {
                    "id": t.id,
                    "nombre": t.nombre,
                    "empresa_id": t.empresa_id,
                    "empresa_nombre": format_empresa_nombre(t.empresa),
                    "activo": t.activo,
                }
                for t in tipos
            ],
        }

    async def obtener_tipo_producto(
        self, tipo_producto_id: int, empresa_id: int | None = None
    ) -> Dict[str, Any]:
        tipo = await self.repository.obtener_por_id(tipo_producto_id, empresa_id)
        if not tipo:
            raise ValueError("Tipo de producto no encontrado")
        return {
            "id": tipo.id,
            "nombre": tipo.nombre,
            "empresa_id": tipo.empresa_id,
            "activo": tipo.activo,
        }

    async def crear_tipo_producto(
        self, empresa_id: int, nombre: str, activo: bool = True
    ) -> Dict[str, Any]:
        if not nombre or not nombre.strip():
            raise ValueError("El nombre no puede estar vacío")
        nombre = nombre.strip()
        existente = await self.repository.obtener_por_nombre(nombre, empresa_id)
        if existente:
            raise ValueError(f"Ya existe un tipo de producto con el nombre '{nombre}'")
        nuevo = await self.repository.crear(empresa_id, nombre, activo)
        return {
            "id": nuevo.id,
            "nombre": nuevo.nombre,
            "empresa_id": nuevo.empresa_id,
            "activo": nuevo.activo,
        }

    async def actualizar_tipo_producto(
        self,
        tipo_producto_id: int,
        empresa_id: int,
        nombre: str | None = None,
        activo: bool | None = None,
    ) -> Dict[str, Any]:
        if nombre is not None and nombre.strip():
            nombre = nombre.strip()
            existente = await self.repository.obtener_por_nombre(nombre, empresa_id)
            if existente and existente.id != tipo_producto_id:
                raise ValueError(f"Ya existe un tipo de producto con el nombre '{nombre}'")
        actualizado = await self.repository.actualizar(tipo_producto_id, empresa_id, nombre, activo)
        if not actualizado:
            raise ValueError("Tipo de producto no encontrado")
        return {
            "id": actualizado.id,
            "nombre": actualizado.nombre,
            "empresa_id": actualizado.empresa_id,
            "activo": actualizado.activo,
        }

    async def eliminar_tipo_producto(
        self, tipo_producto_id: int, empresa_id: int
    ) -> Dict[str, Any]:
        tipo = await self.repository.obtener_por_id(tipo_producto_id, empresa_id)
        if not tipo:
            raise ValueError("Tipo de producto no encontrado")
        ok = await self.repository.eliminar(tipo_producto_id, empresa_id)
        if not ok:
            raise ValueError("Error al eliminar tipo de producto")
        return {
            "mensaje": f"Tipo de producto '{tipo.nombre}' eliminado",
            "tipo_producto_id": tipo_producto_id,
        }
